import { GoogleGenerativeAI } from "@google/generative-ai";
import AI_CONFIG from "../config/aiConfig";
import { extractDomainContext } from "../utils/domainAdapter";
import {
  ERROR_TYPES,
  createChatError,
  handleChatError,
} from "../utils/errorHandler";
import { validateDateTime, formatDateTime } from "../utils/dateTimeUtils";
import {
  getAvailableSlots,
  validateBookingRequest,
} from "../services/scheduleService";
import { saveUserChatHistory, getUserPreferences } from "./userService";
import { processOrder } from "./orderService";
import { createBooking } from "./bookingService";
import { parse, format, addDays } from "date-fns";
import { logChatInteraction } from "../firebase/config";
import { generateAIResponse, enhanceResponseWithDomainData } from "./aiService";

const responseCache = new Map();
const CACHE_EXPIRY = 3600000;

const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);

let activeModel = null;
let apiState = "initializing";

const initializeModel = async () => {
  try {
    apiState = "initializing";

    if (!AI_CONFIG.isConfigured()) {
      throw createChatError(
        "API key not configured",
        ERROR_TYPES.MODEL_INITIALIZATION
      );
    }

    const primaryConfig = AI_CONFIG.getModelConfig("primary");
    activeModel = genAI.getGenerativeModel({
      model: primaryConfig.name,
      generationConfig: primaryConfig.config,
    });

    const result = await activeModel
      .generateContent("Test connection")
      .catch((error) => {
        throw createChatError(
          "Failed to test model connection",
          ERROR_TYPES.MODEL_INITIALIZATION,
          { originalError: error.message }
        );
      });

    if (!result.response) {
      throw createChatError(
        "Primary model failed to respond",
        ERROR_TYPES.MODEL_INITIALIZATION
      );
    }

    apiState = "online";
    return true;
  } catch (primaryError) {
    console.warn("Primary model initialization failed:", primaryError);

    try {
      const fallbackConfig = AI_CONFIG.getModelConfig("fallback");
      activeModel = genAI.getGenerativeModel({
        model: fallbackConfig.name,
        generationConfig: fallbackConfig.config,
      });

      const result = await activeModel.generateContent("Test connection");
      if (result.response) {
        apiState = "limited";
        return true;
      }

      throw new Error("Fallback model failed to respond");
    } catch (fallbackError) {
      console.error("All models failed to initialize:", fallbackError);
      apiState = "offline";
      return false;
    }
  }
};

initializeModel().catch(console.error);

export const getApiStatus = () => apiState;

export const reconnectApi = async () => {
  return await initializeModel();
};

const getCachedResponse = (prompt, domain) => {
  const cacheKey = `${domain}:${prompt}`;
  const cached = responseCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.response;
  }

  return null;
};

const cacheResponse = (prompt, domain, response) => {
  const cacheKey = `${domain}:${prompt}`;
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
  });
};

let conversationState = new Map();

export const generateResponse = async (prompt, domainConfig, options = {}) => {
  const sessionId = options.sessionId || "default";
  const currentState = conversationState.get(sessionId) || {};
  const { userId } = options;

  try {
    if (currentState.pendingConfirmation) {
      const response = await handleConfirmationResponse(
        currentState,
        prompt,
        sessionId
      );
      if (response) return response;
    }

    if (currentState.pendingAction) {
      const response = await handlePendingAction(
        currentState,
        prompt,
        sessionId
      );
      if (response) return response;
    }

    if (!options.skipCache) {
      const cached = getCachedResponse(prompt, domainConfig.context);
      if (cached) return cached;
    }

    if (apiState === "offline") {
      throw createChatError("Service is offline", ERROR_TYPES.NETWORK);
    }

    const domainContext = extractDomainContext(domainConfig, prompt);
    const systemPrompt = createSystemPrompt(domainConfig);
    const fullPrompt = `${systemPrompt}\n\nPrevious context: ${
      currentState.lastTopic || "None"
    }\nUser query: ${prompt}`;

    const result = await activeModel.generateContent(fullPrompt);
    const responseText = result.response.text();

    await handleResponseLogging(prompt, responseText, domainConfig, options);

    const actionResponse = await handleDomainActions(
      prompt,
      domainConfig,
      responseText,
      sessionId
    );
    if (actionResponse) return actionResponse;

    return enhanceResponseWithDomainData(responseText, prompt, domainConfig);
  } catch (error) {
    return handleError(error, domainConfig, prompt);
  }
};

const handleConfirmationResponse = async (currentState, prompt, sessionId) => {
  const isAffirmative = isAffirmativeResponse(prompt);
  const isNegative = isNegativeResponse(prompt);

  if (!isAffirmative && !isNegative) return null;

  const { action, data } = currentState.pendingAction || {};

  if (isAffirmative) {
    switch (action) {
      case "CONFIRM_ORDER":
        return {
          action: "PROCESS_ORDER",
          data: {
            ...data,
            confirmed: true,
            timestamp: new Date(),
          },
          keepContext: true,
        };
      case "CONFIRM_BOOKING":
        try {
          const booking = await createBooking({
            ...data,
            confirmed: true,
            timestamp: new Date(),
          });

          return {
            message:
              `✅ Appointment confirmed!\n\n` +
              `Booking Reference: ${booking.id}\n` +
              `Doctor: Dr. ${data.doctor}\n` +
              `Date: ${data.date}\n` +
              `Time: ${data.time}\n` +
              `Fee: $${data.fee}\n\n` +
              `Please arrive 15 minutes early. Don't forget to bring:\n` +
              `- Photo ID\n` +
              `- Insurance card\n` +
              `- List of current medications\n\n` +
              `Need to reschedule? Call us at least 24 hours in advance.`,
            updateContext: {
              pendingAction: null,
              lastTopic: "booking_complete",
              bookingRef: booking.id,
            },
          };
        } catch (error) {
          return {
            message:
              "I apologize, but there was an error processing your booking. " +
              "Please try again or contact our reception at (555) 123-4567.",
            isError: true,
          };
        }
    }
  } else {
    return {
      message:
        "I understand you don't want to proceed. How else can I assist you today?",
      updateContext: {
        pendingAction: null,
        lastTopic: currentState.lastTopic,
        pendingConfirmation: false,
      },
    };
  }
};

const isAffirmativeResponse = (text) => {
  const affirmativeResponses = [
    "yes",
    "yeah",
    "sure",
    "okay",
    "ok",
    "confirm",
    "definitely",
    "absolutely",
    "proceed",
    "correct",
  ];
  return affirmativeResponses.some((term) => text.toLowerCase().includes(term));
};

const isNegativeResponse = (text) => {
  const negativeResponses = [
    "no",
    "nope",
    "cancel",
    "don't",
    "dont",
    "negative",
    "decline",
    "stop",
    "incorrect",
  ];
  return negativeResponses.some((term) => text.toLowerCase().includes(term));
};

const handlePendingAction = async (currentState, prompt, sessionId) => {
  const { action, data } = currentState.pendingAction;
  const userResponse = prompt.toLowerCase();

  const affirmativeResponses = [
    "yes",
    "yeah",
    "sure",
    "okay",
    "ok",
    "confirm",
    "definitely",
    "absolutely",
    "proceed",
    "go ahead",
    "i do",
    "i agree",
    "correct",
  ];
  const negativeResponses = [
    "no",
    "nope",
    "cancel",
    "don't",
    "dont",
    "negative",
    "decline",
    "stop",
    "not now",
    "i don't",
    "i dont",
    "incorrect",
  ];

  const isAffirmative = affirmativeResponses.some((term) =>
    userResponse.includes(term)
  );
  const isNegative = negativeResponses.some((term) =>
    userResponse.includes(term)
  );

  if (isAffirmative || isNegative) {
    if (isAffirmative) {
      switch (action) {
        case "CONFIRM_ORDER":
          return {
            action: "PROCESS_ORDER",
            data: {
              ...data,
              confirmed: true,
              timestamp: new Date(),
            },
          };
        case "CONFIRM_BOOKING":
          return {
            action: "PROCESS_BOOKING",
            data: {
              ...data,
              confirmed: true,
              timestamp: new Date(),
            },
          };
        default:
          return {
            message: "I'll process that right away.",
            updateContext: {
              pendingAction: null,
              lastTopic: action.toLowerCase(),
              pendingConfirmation: false,
            },
          };
      }
    } else {
      conversationState.delete(sessionId);
      return {
        message:
          "I understand you don't want to proceed. How else can I assist you today?",
        updateContext: {
          pendingAction: null,
          lastTopic: currentState.lastTopic,
          pendingConfirmation: false,
        },
      };
    }
  }

  return handlePendingActionModification(currentState, prompt, action, data);
};

const handlePendingActionModification = (
  currentState,
  prompt,
  action,
  data
) => {
  const query = prompt.toLowerCase();

  switch (action) {
    case "CONFIRM_BOOKING":
      if (
        query.includes("appointment") ||
        query.includes("doctor") ||
        query.includes("schedule")
      ) {
        const updatedData = {
          ...data,
          ...extractBookingDetails(prompt, { context: "clinic" }),
        };

        return {
          message: formatBookingConfirmation(updatedData),
          updateContext: {
            pendingAction: {
              action: "CONFIRM_BOOKING",
              data: updatedData,
            },
            pendingConfirmation: true,
            lastTopic: "booking",
          },
        };
      }
      break;

    case "CONFIRM_ORDER":
      if (
        query.includes("order") ||
        query.includes("food") ||
        query.includes("menu")
      ) {
        const updatedData = {
          ...data,
          ...extractOrderDetails(prompt, { context: "restaurant" }),
        };

        return {
          message: formatOrderConfirmation(updatedData),
          updateContext: {
            pendingAction: {
              action: "CONFIRM_ORDER",
              data: updatedData,
            },
            pendingConfirmation: true,
            lastTopic: "order",
          },
        };
      }
      break;

    case "HOTEL_BOOKING":
      if (
        query.includes("room") ||
        query.includes("hotel") ||
        query.includes("book")
      ) {
        const updatedData = {
          ...data,
          ...extractHotelBookingDetails(prompt, { context: "hotel" }),
        };

        return {
          message: formatHotelBookingConfirmation(updatedData),
          updateContext: {
            pendingAction: {
              action: "HOTEL_BOOKING",
              data: updatedData,
            },
            pendingConfirmation: true,
            lastTopic: "hotel",
          },
        };
      }
      break;
  }

  return null;
};

const handleResponseLogging = async (
  prompt,
  responseText,
  domainConfig,
  options
) => {
  const { skipCache } = options;

  if (!skipCache) {
    try {
      cacheResponse(prompt, domainConfig.context, responseText);
    } catch (cacheError) {
      console.warn("Failed to cache response:", cacheError);
    }
  }

  logChatInteraction("message_sent", {
    domain: domainConfig.context,
    success: true,
  });
};

const handleDomainActions = async (
  prompt,
  domainConfig,
  responseText,
  sessionId
) => {
  const query = prompt.toLowerCase();
  const { context } = domainConfig;

  if (
    context === "clinic" &&
    query.match(/(book|schedule|make|set up).*appointment/i)
  ) {
    return handleClinicBooking(prompt, domainConfig, sessionId);
  }

  if (context === "restaurant" && isOrderRequest(query)) {
    return handleRestaurantOrder(prompt, domainConfig, sessionId);
  }

  if (context === "hotel" && isHotelBookingRequest(query)) {
    return handleHotelBooking(prompt, domainConfig, sessionId);
  }

  return null;
};

const handleClinicBooking = async (prompt, domainConfig, sessionId) => {
  const currentState = conversationState.get(sessionId) || {};
  const bookingDetails = {
    ...currentState.bookingDetails,
    ...extractBookingDetails(prompt, domainConfig),
  };

  const { data } = domainConfig;

  if (
    currentState.pendingAction?.action === "CONFIRM_BOOKING" &&
    (prompt.toLowerCase().includes("yes") ||
      prompt.toLowerCase().includes("yeah"))
  ) {
    const nameMatch = prompt.match(/(?:name\s+is\s+)?(\w+(?:\s+\w+)*)/i);
    if (nameMatch) {
      bookingDetails.patientName = nameMatch[1];
    }

    if (bookingDetails.patientName) {
      return {
        action: "PROCESS_BOOKING",
        data: {
          ...bookingDetails,
          confirmed: true,
          timestamp: new Date(),
        },
      };
    }
  }

  if (bookingDetails.doctor && bookingDetails.date && bookingDetails.time) {
    const doctor = data.doctors.find((d) =>
      d.name
        .toLowerCase()
        .includes(bookingDetails.doctor.toLowerCase().replace("dr.", "").trim())
    );

    if (doctor) {
      const validation = await validateBookingRequest(
        doctor,
        bookingDetails.date,
        bookingDetails.time
      );

      if (validation.isValid) {
        conversationState.set(sessionId, {
          pendingAction: {
            action: "CONFIRM_BOOKING",
            data: {
              ...bookingDetails,
              doctorId: doctor.id,
              fee: doctor.consultationFee,
              specialty: doctor.specialty,
            },
          },
          lastTopic: "booking_confirmation",
          bookingStage: "confirmation",
          bookingDetails,
        });

        let message = `I've prepared your appointment with details:\n\n`;
        message += `Doctor: Dr. ${doctor.name} (${doctor.specialty})\n`;
        message += `Date: ${bookingDetails.date}\n`;
        message += `Time: ${bookingDetails.time}\n`;
        message += `Consultation Fee: $${doctor.consultationFee}\n\n`;

        if (!bookingDetails.patientName) {
          message += `To complete the booking, please provide:\n`;
          message += `- Your name for the appointment\n`;
        }

        message += `\nWould you like to confirm this appointment?`;

        return {
          message,
          requiresConfirmation: true,
          updateContext: {
            lastTopic: "booking_confirmation",
            pendingConfirmation: true,
          },
        };
      } else {
        return {
          message: `I apologize, but that time slot is no longer available. Here are the available slots for Dr. ${
            doctor.name
          } on ${bookingDetails.date}:\n${validation.availableSlots.join(
            ", "
          )}\n\nWould you like to select a different time?`,
          updateContext: {
            lastTopic: "booking_time",
            selectedDoctor: doctor.name,
            selectedDate: bookingDetails.date,
            bookingStage: "time_selection",
          },
        };
      }
    }
  }

  if (
    prompt.toLowerCase().includes("book") ||
    prompt.toLowerCase().includes("appointment")
  ) {
    if (!bookingDetails.doctor) {
      const availableDoctors = data.doctors.filter((d) => d.available);

      return {
        message:
          "I'll help you book an appointment. Here are our available doctors:\n\n" +
          availableDoctors
            .map(
              (doc) =>
                `• Dr. ${doc.name} (${doc.specialty}) - $${doc.consultationFee} per visit`
            )
            .join("\n") +
          "\n\nWhich doctor would you like to see?",
        updateContext: {
          lastTopic: "booking_start",
          bookingStage: "doctor_selection",
        },
      };
    }
  }
};

const handleRestaurantOrder = async (prompt, domainConfig, sessionId) => {
  const currentState = conversationState.get(sessionId) || {};
  const orderDetails = {
    ...currentState.orderDetails,
    ...extractOrderDetails(prompt, domainConfig),
  };

  const { data } = domainConfig;

  if (
    currentState.pendingAction?.action === "CONFIRM_ORDER" &&
    (prompt.toLowerCase().includes("yes") ||
      prompt.toLowerCase().includes("yeah"))
  ) {
    const nameMatch = prompt.match(/(\w+(?:\s+\w+)*),\s*(card|cash)/i);
    if (nameMatch) {
      orderDetails.customerName = nameMatch[1];
      orderDetails.paymentMethod = nameMatch[2].toLowerCase();
    }

    if (orderDetails.customerName && orderDetails.paymentMethod) {
      return {
        action: "PROCESS_ORDER",
        data: {
          ...orderDetails,
          confirmed: true,
          timestamp: new Date(),
        },
      };
    }
  }

  if (orderDetails.items?.length > 0) {
    const subtotal = calculateOrderTotal(orderDetails);
    const total =
      subtotal +
      (orderDetails.isDelivery ? data.orderInformation.deliveryFee : 0);
    const estimatedTime = calculateEstimatedTime(
      orderDetails,
      data.kitchenCapacity
    );

    conversationState.set(sessionId, {
      pendingAction: {
        action: "CONFIRM_ORDER",
        data: {
          ...orderDetails,
          subtotal,
          total,
          estimatedTime,
          restaurantName: data.name,
        },
      },
      lastTopic: "order",
      pendingConfirmation: true,
      orderDetails,
    });

    let message = formatOrderConfirmation(orderDetails);
    if (!orderDetails.customerName || !orderDetails.paymentMethod) {
      message += "\n\nTo complete your order, please provide:\n";
      if (!orderDetails.customerName) message += "- Your name\n";
      if (!orderDetails.paymentMethod)
        message += "- Payment method (cash or card)";
    }

    return {
      message,
      requiresConfirmation: true,
      updateContext: {
        lastTopic: "order",
        pendingConfirmation: true,
      },
    };
  }

  return {
    message: "What would you like to order from our menu?",
    updateContext: {
      lastTopic: "order",
      pendingConfirmation: false,
    },
  };
};

const formatOrderItems = (items) => {
  return items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} ($${(
          item.price * item.quantity
        ).toFixed(2)})`
    )
    .join("\n");
};

const calculateEstimatedTime = (orderDetails, kitchenCapacity) => {
  const { currentLoad, maxSimultaneousOrders, estimationFactors } =
    kitchenCapacity;
  const loadFactor = currentLoad / maxSimultaneousOrders;

  let totalTime = 0;
  orderDetails.items.forEach((item) => {
    let itemTime =
      orderDetails.data?.menu?.find((m) => m.id === item.id)?.preparationTime ||
      15;
    itemTime *= item.quantity;
    totalTime += itemTime;
  });

  if (loadFactor > 0.8) {
    totalTime *= estimationFactors.rushHourMultiplier;
  }

  if ([0, 6].includes(new Date().getDay())) {
    totalTime *= estimationFactors.weekendMultiplier;
  }

  return Math.ceil(totalTime);
};

const handleHotelBooking = async (prompt, domainConfig, sessionId) => {
  const currentState = conversationState.get(sessionId) || {};
  const query = prompt.toLowerCase();

  if (
    query.includes("room") ||
    query.includes("book") ||
    query.includes("stay") ||
    query.includes("accommodation")
  ) {
    return {
      message: `Here are our available room types:\n\n${domainConfig.data.rooms
        .map(
          (room) =>
            `• ${room.type} - $${room.rate}/night\n  ${
              room.description
            }\n  Max Occupancy: ${room.maxOccupancy} guests\n  Status: ${
              room.availability ? "Available" : "Currently Booked"
            }\n`
        )
        .join(
          "\n"
        )}\n\nPlease let me know which room type interests you and your preferred check-in date. I'll help you check availability.`,
      updateContext: {
        lastTopic: "hotel_rooms",
        pendingConfirmation: false,
      },
    };
  }

  const bookingDetails = extractHotelBookingDetails(prompt, domainConfig);

  if (bookingDetails.checkIn && bookingDetails.roomType) {
  }

  if (currentState.lastTopic === "hotel_rooms") {
    return {
      message: "Which room type would you like to book and for what dates?",
      updateContext: {
        lastTopic: "room_selection",
        pendingConfirmation: false,
      },
    };
  }

  return {
    message:
      "I'll help you find the perfect room. Would you like to see our available room types first?",
    updateContext: {
      lastTopic: "hotel",
      pendingConfirmation: false,
    },
  };
};

const handleError = (error, domainConfig, prompt) => {
  const handledError = handleChatError(error, {
    domain: domainConfig.context,
    apiState,
    prompt,
  });

  if (handledError.fallbackResponse) {
    return handledError.fallbackResponse;
  }

  return getOfflineResponse(prompt, domainConfig);
};

const isOrderRequest = (query) => {
  return (
    query.includes("order") ||
    query.includes("like to get") ||
    query.includes("i'll have") ||
    query.includes("i want to order")
  );
};

const isHotelBookingRequest = (query) => {
  return (
    query.includes("book") ||
    query.includes("reserve") ||
    query.includes("room") ||
    query.includes("stay at")
  );
};

const formatBookingConfirmation = (bookingData) => {
  return `I've prepared an appointment with Dr. ${bookingData.doctor} on ${
    bookingData.date
  } at ${
    bookingData.time || "the first available time"
  }. Would you like to confirm this booking?`;
};

const formatOrderConfirmation = (orderData) => {
  const itemsList = orderData.items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");

  return `I've prepared your order with: ${itemsList}. The total is $${calculateOrderTotal(
    orderData
  ).toFixed(2)}. Would you like to confirm this order?`;
};

const formatHotelBookingConfirmation = (bookingData) => {
  return `I've prepared a reservation for a ${bookingData.roomType} room from ${
    bookingData.checkIn
  } to ${bookingData.checkOut || "the day after"}. The rate is $${
    bookingData.rate || "standard rate"
  } per night. Would you like to confirm this booking?`;
};

const createSystemPrompt = (domainConfig) => {
  const { context, data } = domainConfig;

  const commonInstructions = `
You are an AI assistant for ${data.name}.
Provide clear, concise, and professional responses.
Maintain a friendly yet professional tone throughout the conversation.
If you're unsure about something, be honest about limitations.
Always prioritize clarity and accuracy in your responses.
Consider the context of the entire conversation, not just the current query.
Base your responses on the following data but respond conversationally:
${JSON.stringify(data, null, 2)}`;

  const domainSpecificPrompts = {
    restaurant: `
${commonInstructions}
Specific instructions for restaurant queries:
- For menu items, always mention price, ingredients, and preparation time
- For dietary restrictions, provide detailed information about ingredients and preparation methods
- For wait times, consider current restaurant status and provide accurate estimates
- Include information about seasonal specials, chef recommendations, and popular combos
- When discussing delivery, include estimated delivery times and any minimum order requirements
- For reservations, confirm date, time, party size, and any special requirements
- Always recognize returning customers and their preferences when the information is available
- For large parties, mention our private dining options and special menu packages`,

    clinic: `
${commonInstructions}
Specific instructions for clinic queries:
- For appointments, capture and validate date/time preferences with precision
- Check doctor's complete schedule for requested dates and suggest alternatives when needed
- Suggest the most appropriate specialist based on described symptoms
- Always include consultation fees, payment options, and relevant insurance information
- Handle doctor-specific queries with information about their qualifications and specialties
- For returning patients, acknowledge their previous visits and any ongoing treatments
- Mention any preparation needed for specific procedures or appointments
- Provide clear instructions about clinic location, parking, and check-in procedures
- For urgent matters, direct patients to appropriate emergency services`,

    hotel: `
${commonInstructions}
Specific instructions for hotel queries:
- For room bookings, confirm dates, room type, number of guests, and any special requests
- Provide detailed information about room amenities, views, and unique features
- When discussing rates, include all applicable taxes, resort fees, and any available discounts
- Highlight hotel facilities like pools, restaurants, fitness centers, and business services
- For special occasions, suggest relevant packages or complementary services
- Include information about check-in/check-out times and early/late options
- Provide details about the hotel's location, nearby attractions, and transportation options
- For long stays, mention extended stay rates and special arrangements
- Always acknowledge loyalty program members and their benefits`,
  };

  return domainSpecificPrompts[context] || commonInstructions;
};

const extractBookingDetails = (prompt, domainConfig) => {
  const { data } = domainConfig;
  const query = prompt.toLowerCase();

  const datePattern =
    /(?:\bon\s+|for\s+|next\s+|this\s+)?((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?|(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+morning|\s+afternoon|\s+evening)?|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/i;
  const timePattern =
    /(?:at\s+)?((?:\d{1,2})(?::\d{2})?\s*(?:am|pm)|(?:noon|midnight))/i;
  const doctorPattern =
    /(?:with\s+|see\s+|doctor\s+|dr\.?\s*)((?:[a-zA-Z]+\s*){1,3})/i;

  const dateMatch = query.match(datePattern);
  const timeMatch = query.match(timePattern);
  const doctorMatch = query.match(doctorPattern);

  let formattedDate = null;
  let formattedTime = null;
  let formattedDoctor = null;

  if (dateMatch) {
    formattedDate = formatDate(dateMatch[1]);
  }

  if (timeMatch) {
    formattedTime = formatTime(timeMatch[1]);
  }

  if (doctorMatch) {
    const doctorName = doctorMatch[1].trim();
    const matchedDoctor = data.doctors.find((doc) =>
      doc.name.toLowerCase().includes(doctorName.toLowerCase())
    );
    formattedDoctor = matchedDoctor ? matchedDoctor.name : doctorName;
  }

  const symptomsMap = {
    skin: "Dermatologist",
    heart: "Cardiologist",
    child: "Pediatrician",
    bone: "Orthopedic Surgeon",
  };

  for (const [symptom, specialty] of Object.entries(symptomsMap)) {
    if (query.includes(symptom)) {
      const specialistDoc = data.doctors.find(
        (d) => d.specialty === specialty && d.available
      );
      if (specialistDoc) {
        formattedDoctor = specialistDoc.name;
      }
    }
  }

  return {
    doctor: formattedDoctor,
    date: formattedDate,
    time: formattedTime,
    service: extractService(query, data),
    patient: extractPatientName(query),
  };
};

const extractOrderDetails = (prompt, domainConfig) => {
  const { data } = domainConfig;
  const query = prompt.toLowerCase();

  const items = [];
  let isDelivery = query.includes("deliver") || query.includes("delivery");

  data.menu.forEach((menuItem) => {
    const itemNameLower = menuItem.name.toLowerCase();
    if (query.includes(itemNameLower)) {
      const quantityPattern = new RegExp(
        `(\\d+)\\s+(?:${itemNameLower}|${menuItem.name})`,
        "i"
      );
      const quantityMatch = query.match(quantityPattern);

      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

      items.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity,
      });
    }
  });

  data.combos.forEach((combo) => {
    const comboNameLower = combo.name.toLowerCase();
    if (query.includes(comboNameLower)) {
      const quantityPattern = new RegExp(
        `(\\d+)\\s+(?:${comboNameLower}|${combo.name})`,
        "i"
      );
      const quantityMatch = query.match(quantityPattern);

      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

      items.push({
        id: combo.id,
        name: combo.name,
        price: combo.price,
        quantity: quantity,
        isCombo: true,
      });
    }
  });

  return {
    items: items,
    isDelivery: isDelivery,
    specialInstructions: extractSpecialInstructions(query),
  };
};

const extractHotelBookingDetails = (prompt, domainConfig) => {
  const { data } = domainConfig;
  const query = prompt.toLowerCase();

  const datePattern =
    /(?:from|on|starting|check[\s-]?in)\s+((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?|(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/i;
  const checkoutPattern =
    /(?:to|until|through|checkout|check[\s-]?out)\s+((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?|(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/i;
  const roomTypePattern =
    /(standard|deluxe|suite|executive|family|single|double|queen|king)\s+(room|suite)/i;
  const guestsPattern = /(\d+)\s+(people|guests|adults|persons)/i;

  const checkinMatch = query.match(datePattern);
  const checkoutMatch = query.match(checkoutPattern);
  const roomTypeMatch = query.match(roomTypePattern);
  const guestsMatch = query.match(guestsPattern);

  let checkIn = checkinMatch ? formatDate(checkinMatch[1]) : null;
  let checkOut = checkoutMatch ? formatDate(checkoutMatch[1]) : null;
  let roomType = roomTypeMatch ? roomTypeMatch[0] : "Standard Room";
  let guests = guestsMatch ? parseInt(guestsMatch[1]) : 1;

  let rate = null;
  if (roomType && data.rooms) {
    const matchedRoom = data.rooms.find((room) =>
      room.type.toLowerCase().includes(roomType.toLowerCase())
    );
    rate = matchedRoom ? matchedRoom.rate : calculateEstimatedRate(roomType);
  }

  return {
    checkIn,
    checkOut,
    roomType,
    guests,
    rate,
    specialRequests: extractSpecialRequests(query),
  };
};

const calculateOrderTotal = (orderDetails) => {
  let total = 0;

  if (orderDetails.items && orderDetails.items.length > 0) {
    orderDetails.items.forEach((item) => {
      total += item.price * item.quantity;
    });
  }

  if (orderDetails.isDelivery) {
    total += 5.99;
  }

  return total;
};

const formatDate = (dateString) => {
  if (dateString.toLowerCase() === "today") {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  if (dateString.toLowerCase() === "tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const weekdayIndex = weekdays.findIndex((day) =>
    dateString.toLowerCase().includes(day)
  );

  if (weekdayIndex !== -1) {
    const today = new Date().getDay();
    let daysToAdd = weekdayIndex - today;
    if (daysToAdd <= 0) daysToAdd += 7;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    return targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  try {
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate)) {
      return parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  } catch (e) {
    return dateString;
  }

  return dateString;
};

const formatTime = (timeString) => {
  if (timeString.toLowerCase() === "noon") {
    return "12:00 PM";
  }
  if (timeString.toLowerCase() === "midnight") {
    return "12:00 AM";
  }

  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  const match = timeString.match(timeRegex);

  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] || "00";
    const period = match[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours}:${minutes} ${period}`;
  }

  return timeString;
};

const extractService = (query, data) => {
  if (!data.services) return null;

  for (const service of data.services) {
    if (query.includes(service.name.toLowerCase())) {
      return service.name;
    }
  }

  const serviceKeywords = {
    "check-up": "General Check-up",
    checkup: "General Check-up",
    general: "General Check-up",
    pediatric: "Pediatric Consultation",
    children: "Pediatric Consultation",
    kids: "Pediatric Consultation",
    specialist: "Specialist Consultation",
    ortho: "Orthopedic Consultation",
    bones: "Orthopedic Consultation",
    dental: "Dental Check-up",
    teeth: "Dental Check-up",
  };

  for (const [keyword, serviceName] of Object.entries(serviceKeywords)) {
    if (query.includes(keyword)) {
      return serviceName;
    }
  }

  return null;
};

const extractPatientName = (query) => {
  const namePatterns = [
    /for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    /my\s+name\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    /patient\s+name\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    /patient\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
  ];

  for (const pattern of namePatterns) {
    const match = query.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const extractSpecialInstructions = (query) => {
  const instructionPatterns = [
    /no\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /extra\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /without\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /with\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /special\s+instructions?\s*[:;-]?\s*([^\.]+)/i,
    /please\s+([^\.]+)/i,
  ];

  for (const pattern of instructionPatterns) {
    const match = query.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const extractSpecialRequests = (query) => {
  const requestPatterns = [
    /special\s+requests?\s*[:;-]?\s*([^\.]+)/i,
    /i\s+need\s+([^\.]+)/i,
    /i\s+require\s+([^\.]+)/i,
    /please\s+([^\.]+)/i,
  ];

  for (const pattern of requestPatterns) {
    const match = query.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const calculateEstimatedRate = (roomType) => {
  const baseRates = {
    standard: 99,
    deluxe: 129,
    suite: 179,
    executive: 199,
    family: 149,
    single: 89,
    double: 109,
    queen: 119,
    king: 139,
  };

  const roomTypeLower = roomType.toLowerCase();

  for (const [key, rate] of Object.entries(baseRates)) {
    if (roomTypeLower.includes(key)) {
      return rate;
    }
  }

  return 99;
};

const getOfflineResponse = (prompt, domainConfig) => {
  const { context, data } = domainConfig;
  const query = prompt.toLowerCase();
  let dateMatch = null;

  const datePattern =
    /(?:on|for)?\s*([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i;
  const timePattern = /(?:at)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const doctorPattern = /dr\.?\s+([a-zA-Z\s]+)/i;

  const dateResult = prompt.match(datePattern);
  if (dateResult) {
    dateMatch = dateResult;
  }

  let response = "";

  if (context === "restaurant") {
    const getPreparationTime = (item) => {
      const { preparationDetails } = item;
      if (!preparationDetails) return item.preparationTime;

      let time = preparationDetails.baseTime;
      const currentHour = new Date().getHours();
      const isPeakHour = preparationDetails.peakHours.some((period) => {
        const [start, end] = period.split(" - ").map((t) => parseInt(t));
        return currentHour >= start && currentHour <= end;
      });

      if (isPeakHour) time += preparationDetails.rushHourIncrease;
      if (preparationDetails.prePrepped) time *= 0.8;
      return Math.round(time);
    };

    if (query.includes("dietary") || query.includes("nutrition")) {
      const matchingItems = data.menu
        .filter((item) => item.dietaryInfo)
        .map((item) => ({
          name: item.name,
          info: item.dietaryInfo,
        }));
      response = `Here are items with detailed dietary information:\n${matchingItems
        .map(
          (item) =>
            `${item.name}: ${Object.entries(item.info)
              .filter(([k, v]) => v === true)
              .map(([k]) => k.replace("is", ""))
              .join(", ")}`
        )
        .join("\n")}`;
    }

    if (query.includes("vegetarian")) {
      const vegOptions = data.menu.filter((item) => item.isVegetarian);
      response = `We have ${
        vegOptions.length
      } vegetarian options on our menu: ${vegOptions
        .map((item) => item.name)
        .join(", ")}.`;
    } else if (query.includes("gluten")) {
      const gfOptions = data.menu.filter((item) => item.isGlutenFree);
      response = `We offer ${gfOptions.length} gluten-free options: ${gfOptions
        .map((item) => item.name)
        .join(", ")}.`;
    } else if (
      query.includes("menu") ||
      query.includes("dishes") ||
      query.includes("food")
    ) {
      response = `Our menu features dishes like: ${data.menu
        .slice(0, 5)
        .map((item) => item.name)
        .join(", ")}, and more.`;
    } else if (
      query.includes("time") ||
      query.includes("ready") ||
      query.includes("wait")
    ) {
      response = `Most dishes take about ${data.orderInformation.averagePreparationTime} minutes to prepare.`;
    } else if (query.includes("deliver")) {
      response = `Delivery fee is $${data.orderInformation.deliveryFee}. Free delivery on orders over $${data.orderInformation.minimumOrderForFreeDelivery}.`;
    } else if (
      query.includes("combo") ||
      query.includes("deal") ||
      query.includes("special")
    ) {
      response = `We offer ${data.combos.length} special combos: ${data.combos
        .map((combo) => combo.name)
        .join(", ")}.`;
    } else if (query.includes("recommend") || query.includes("suggestion")) {
      const preference = query.includes("seafood")
        ? "seafood"
        : query.includes("vegetarian")
        ? "vegetarian"
        : query.includes("spicy")
        ? "spicy"
        : null;

      const recommendedCombo = data.combos.find((combo) => {
        if (preference === "seafood") {
          return combo.name.toLowerCase().includes("seafood");
        }
        return false;
      });

      if (recommendedCombo) {
        response = `Based on your preference, I recommend the ${recommendedCombo.name}: ${recommendedCombo.description}`;
      }
    } else {
      response = `Welcome to ${data.name}! How may I assist with our menu or ordering today?`;
    }
  } else if (context === "clinic") {
    if (query.includes("appointment") || query.includes("book")) {
      const timeMatch = query.match(timePattern);
      const doctorMatch = query.match(doctorPattern);

      if (doctorMatch) {
        const doctor = data.doctors.find((d) =>
          d.name.toLowerCase().includes(doctorMatch[1].toLowerCase())
        );

        if (doctor && dateMatch) {
          const bookingValidation = validateBookingRequest(
            doctor,
            dateMatch[1],
            timeMatch ? timeMatch[1] : null,
            []
          );

          if (bookingValidation.isValid) {
            response = `Available slots with Dr. ${doctor.name} on ${
              dateMatch[1]
            }:\n${bookingValidation.slots.join(", ")}\nConsultation fee: $${
              doctor.consultationFee
            }`;
          } else {
            response = bookingValidation.message;
          }
        }
      }
    } else if (query.includes("available")) {
      if (dateMatch) {
        response = `For ${
          dateMatch[1]
        }, I'll need to check the real-time availability. Currently, we have these doctors who generally work that day: ${data.doctors
          .filter((doc) => doc.available)
          .map((doc) => `Dr. ${doc.name} (${doc.specialty})`)
          .join(", ")}`;
      } else {
        const availableDocs = data.doctors.filter((doc) => doc.available);
        response = `We have ${
          availableDocs.length
        } doctors currently available: ${availableDocs
          .map((doc) => "Dr. " + doc.name + " (" + doc.specialty + ")")
          .join(", ")}.`;
      }
    } else if (
      query.includes("fee") ||
      query.includes("cost") ||
      query.includes("price")
    ) {
      response = `Our consultation fees vary: ${data.services
        .map((service) => `${service.name}: $${service.fee}`)
        .join(", ")}.`;
    } else if (query.includes("insurance")) {
      response = `We accept these insurance plans: ${data.insuranceAccepted.join(
        ", "
      )}.`;
    } else if (query.includes("service")) {
      response = `We offer services like: ${data.services
        .map((service) => service.name)
        .join(", ")}.`;
    } else {
      response = `Welcome to ${data.name}! How may I assist with appointments or medical services today?`;
    }
  } else {
    response =
      "I'm here to help! Please let me know what information you're looking for.";
  }

  return response;
};

const calculatePreparationTime = (order, kitchenCapacity) => {
  const { currentLoad, maxSimultaneousOrders, estimationFactors } =
    kitchenCapacity;
  const loadFactor = currentLoad / maxSimultaneousOrders;
  const baseTime = order.items.reduce(
    (total, item) => total + item.preparationTime,
    0
  );

  let adjustedTime = baseTime;

  if (loadFactor > 0.8) {
    adjustedTime *= estimationFactors.rushHourMultiplier;
  }

  const isWeekend = new Date().getDay() % 6 === 0;
  if (isWeekend) {
    adjustedTime *= estimationFactors.weekendMultiplier;
  }

  return Math.ceil(adjustedTime);
};

const handleClinicQueries = (query, data) => {
  const datePattern =
    /(?:\bon\s+|for\s+|next\s+|this\s+)?((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?|(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+morning|\s+afternoon|\s+evening)?|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/i;

  if (query.includes("available") || query.includes("doctor")) {
    const dateMatch = query.match(datePattern);
    if (dateMatch) {
      const dateStr = `${dateMatch[1]}, 2025`;
      const requestedDate = new Date(dateStr);
      const dayOfWeek = format(requestedDate, "EEEE").toLowerCase();
      const formattedDate = format(requestedDate, "MMMM d, yyyy");

      const availableDoctors = data.doctors.filter(
        (doc) =>
          doc.available &&
          doc.schedule[dayOfWeek] &&
          doc.schedule[dayOfWeek].length > 0
      );

      if (availableDoctors.length > 0) {
        return `For ${formattedDate} (${format(
          requestedDate,
          "EEEE"
        )}), these doctors are available:\n\n${availableDoctors
          .map(
            (doc) =>
              `• Dr. ${doc.name} (${doc.specialty})\n  Hours: ${doc.schedule[
                dayOfWeek
              ].join(", ")}`
          )
          .join("\n\n")}`;
      } else {
        return `I apologize, but we don't have any doctors available on ${formattedDate} (${format(
          requestedDate,
          "EEEE"
        )}). Would you like to check another date?`;
      }
    }
  }
};

const handleConfirmation = async (
  currentState,
  isConfirmed,
  prompt,
  sessionId
) => {
  if (!currentState || !currentState.pendingAction) {
    return null;
  }

  const { action, data } = currentState.pendingAction;

  if (isConfirmed) {
    switch (action) {
      case "CONFIRM_ORDER":
        return {
          action: "PROCESS_ORDER",
          data: {
            ...data,
            confirmed: true,
            timestamp: new Date(),
          },
          message: null,
        };
    }
  } else {
    return {
      message: "Order cancelled. Is there something else I can help you with?",
      updateContext: {
        pendingAction: null,
        lastTopic: currentState.lastTopic,
        pendingConfirmation: false,
      },
    };
  }
};
