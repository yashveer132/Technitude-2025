import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  VStack,
  Text,
  Avatar,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  HStack,
  Alert,
  AlertIcon,
  Link,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaPaperPlane,
  FaMicrophone,
  FaRegCopy,
  FaTrash,
  FaRobot,
  FaUser,
  FaSync,
} from "react-icons/fa";
import { BiReset } from "react-icons/bi";
import { MdOutlinePreview, MdSettings } from "react-icons/md";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import {
  generateAIResponse,
  enhanceResponseWithDomainData,
} from "../../services/aiService";
import { processOrder } from "../../services/orderService";
import {
  createBooking,
  getBookingDetails,
} from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import AIStatusIndicator from "./AIStatusIndicator";
import { parseMarkdown } from "../../utils/markdownParser";
import {
  generateResponse,
  getApiStatus,
  reconnectApi,
} from "../../services/chatService";
import { useServices } from "../../context/ServiceContext";
import { getDemoQueries, runDemoSequence } from "../../utils/demoQueries";
import { useSettings } from "../../context/SettingsContext";
import { MessageTypingIndicator } from "./MessageTypingIndicator";
import ChatSettings from "./ChatSettings";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

function ChatInterface({ context, domainData }) {
  const { accessibility, optimization } = useServices();
  const { settings, updateSettings } = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [sessionId] = useState(Math.random().toString(36).substring(7));
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const [conversationContext, setConversationContext] = useState({
    pendingAction: null,
    lastTopic: null,
    pendingConfirmation: false,
  });

  const promptForMissingInfo = (orderData) => {
    const message = `To complete your order, I'll need a few more details:
${!orderData.customerName ? "\n- Your name for the order" : ""}
${
  !orderData.paymentMethod
    ? "\n- Preferred payment method (cash, card, or digital payment)"
    : ""
}

Please provide these details so I can confirm your order.`;

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
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

  const resetConversationContext = () => {
    setConversationContext({
      pendingAction: null,
      lastTopic: null,
      pendingConfirmation: false,
    });
  };

  const handleOrderError = (error) => {
    console.error("Order error:", error);
    setMessages((prev) => [
      ...prev,
      {
        text: `I apologize, but there was an error processing your order: ${error.message}. Please try again or contact our support.`,
        sender: "ai",
        timestamp: new Date(),
        isError: true,
      },
    ]);
  };

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const userBgColor = useColorModeValue("brandPrimary.100", "brandPrimary.700");
  const aiBgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBgColor = useColorModeValue(
    "brandPrimary.500",
    "brandPrimary.600"
  );
  const messageTimeColor = useColorModeValue("gray.500", "gray.400");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const footerBgColor = useColorModeValue("white", "gray.800");
  const demoBgColor = useColorModeValue(
    "linear(to-r, blue.400, brandPrimary.400)",
    "linear(to-r, blue.600, brandPrimary.600)"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkApiStatus = async () => {
      const status = getApiStatus();
      setApiStatus(status);
    };

    checkApiStatus();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages = {
        restaurant: "Restaurant Assistant",
        clinic: "Clinic Assistant",
        hotel: "Hotel Assistant",
      };
      setMessages([
        {
          text: `Welcome to the ${
            welcomeMessages[context] || "AI"
          } Assistant! How can I help you today?`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  }, [context, messages.length]);

  const checkOrderCompletion = (message, currentContext) => {
    if (!currentContext.pendingAction && currentContext.lastTopic === "order") {
      if (
        /thank|thanks|great|perfect|okay|ok|sure|yes/i.test(
          message.toLowerCase()
        )
      ) {
        return "Would you like to place another order or is there anything else I can help you with?";
      }
    }
    return null;
  };

  const checkRestaurantConversationEnd = (message) => {
    const endPhrases = [
      "bye",
      "goodbye",
      "that's all",
      "that is all",
      "nothing else",
      "no thanks",
      "thank you",
      "thanks",
    ];

    if (endPhrases.some((phrase) => message.toLowerCase().includes(phrase))) {
      return "Thank you for choosing our restaurant! Have a great day!";
    }
    return null;
  };

  const isRestaurantQueryResolved = (query, response) => {
    const checks = {
      menu: /our menu|we offer|available dishes/i,
      order: /order (confirmed|placed)|preparing your order/i,
      delivery: /delivery (time|fee|details)|deliver to your/i,
      timing: /preparation time|wait time|ready in/i,
      dietary: /vegetarian|gluten-free|allergen/i,
    };

    for (const [type, pattern] of Object.entries(checks)) {
      if (query.toLowerCase().includes(type) && pattern.test(response)) {
        return true;
      }
    }
    return false;
  };

  const handleSendMessage = async (messageText) => {
    const message = messageText || input.trim();
    if (!message) return;

    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await generateResponse(
        message,
        {
          context,
          data: domainData,
        },
        {
          sessionId,
          userId: user?.uid,
          conversationContext,
        }
      );

      if (typeof response === "object") {
        if (response.action === "PROCESS_ORDER") {
          await handleOrderConfirmation(response.data);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              text: response.message,
              sender: "ai",
              timestamp: new Date(),
            },
          ]);

          if (response.updateContext) {
            setConversationContext(response.updateContext);
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: response,
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error processing your request. Please try again.",
          sender: "ai",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelBooking = async (bookingData) => {
    try {
      const booking = await createBooking({
        ...bookingData,
        userId: user?.uid,
        createdAt: new Date(),
        type: "hotel",
      });

      let checkOutDate = bookingData.checkOut;
      if (!checkOutDate && bookingData.checkIn) {
        const tempDate = new Date(bookingData.checkIn);
        tempDate.setDate(tempDate.getDate() + 1);
        checkOutDate = tempDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      }

      const startDate = new Date(bookingData.checkIn);
      const endDate = new Date(checkOutDate);
      const numberOfNights = Math.max(
        1,
        Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      );

      const rate = bookingData.rate || 99;
      const totalCost = numberOfNights * rate;

      const specialRequestsSection = bookingData.specialRequests
        ? `\n\n**Special Requests:**\n${bookingData.specialRequests}`
        : "";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: `✅ **Hotel Reservation Successfully Confirmed!**\n\n**Booking Reference:** ${
            booking.id
          }\n\n**Check-in Date:** ${
            bookingData.checkIn
          }\n**Check-out Date:** ${checkOutDate}\n**Room Type:** ${
            bookingData.roomType
          }\n**Number of Guests:** ${
            bookingData.guests || 1
          }\n**Length of Stay:** ${numberOfNights} night${
            numberOfNights > 1 ? "s" : ""
          }\n**Rate:** $${rate} per night\n**Total:** $${totalCost}${specialRequestsSection}\n\nCheck-in time starts at 3:00 PM, and check-out is until 11:00 AM. Please present a valid ID and the credit card used for booking upon arrival.

Thank you for choosing ${domainData.name}! We look forward to welcoming you.`,
          sender: "ai",
          timestamp: new Date(),
          isConfirmation: true,
        },
      ]);
    } catch (error) {
      console.error("Error processing hotel booking:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but there was an issue processing your hotel reservation. Please try again or contact our reservations team directly at reservations@hotel.com.",
          sender: "ai",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  const handleBookingConfirmation = async (bookingData) => {
    try {
      if (!bookingData.patientName) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: "To complete your booking, please provide your name for the appointment.",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const booking = await createBooking({
        ...bookingData,
        type: "clinic",
        userId: user?.uid,
        status: "confirmed",
        createdAt: new Date(),
      });

      const doctor = domainData.doctors.find(
        (d) =>
          d.name === booking.doctor.replace("Dr. ", "") ||
          `Dr. ${d.name}` === booking.doctor
      );

      const confirmationMessage = generateBookingConfirmation(booking, doctor);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: confirmationMessage,
          sender: "ai",
          timestamp: new Date(),
          isConfirmation: true,
        },
      ]);

      setConversationContext({
        pendingAction: null,
        lastTopic: "booking_complete",
        pendingConfirmation: false,
      });

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: "Is there anything else you would like to know about our clinic services?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }, 2000);
    } catch (error) {
      handleBookingError(error);
    }
  };

  const generateBookingConfirmation = (booking, doctor) => {
    return `✅ **Appointment Successfully Booked!**
  
  **Booking Reference:** ${booking.id}
  **Patient Name:** ${booking.patientName}
  **Doctor:** Dr. ${doctor.name} (${doctor.specialty})
  **Date:** ${booking.formattedDate}
  **Time:** ${booking.time}
  **Consultation Fee:** $${doctor.consultationFee}
  
  📋 **Important Reminders:**
  • Please arrive 15 minutes before your appointment
  • Bring valid ID and insurance card
  • If you need to cancel/reschedule, please do so 24 hours in advance
  • Call ${domainData.phone} for any questions
  
  Thank you for choosing ${domainData.name}!`;
  };

  const handleBookingError = (error) => {
    console.error("Booking error:", error);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: `I apologize, but there was an error processing your appointment: ${error.message}. Please try again or contact our reception at ${domainData.phone}.`,
        sender: "ai",
        timestamp: new Date(),
        isError: true,
      },
    ]);
  };

  const handleOrderConfirmation = async (orderData) => {
    try {
      if (!orderData.customerName || !orderData.paymentMethod) {
        promptForMissingInfo(orderData);
        return;
      }

      const order = await processOrder({
        ...orderData,
        userId: user?.uid,
        timestamp: new Date(),
      });

      const itemsList = formatOrderItems(orderData.items);
      const confirmationMessage = generateOrderConfirmation(
        order,
        itemsList,
        orderData
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: confirmationMessage,
          sender: "ai",
          timestamp: new Date(),
          isConfirmation: true,
        },
      ]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            text: "Is there anything else I can help you with?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }, 1000);

      resetConversationContext();
    } catch (error) {
      handleOrderError(error);
    }
  };

  const generateOrderConfirmation = (order, itemsList, orderData) => {
    const { subtotal, total, estimatedTime } = orderData;
    const specialInstructions = orderData.specialInstructions
      ? `\n\n**Special Instructions:**\n${orderData.specialInstructions}`
      : "";

    return `✅ **Order Successfully Confirmed!**

**Order #${order.id}**

**Items:**
${itemsList}

**Subtotal:** $${subtotal.toFixed(2)}
${orderData.isDelivery ? `**Delivery Fee:** $${order.deliveryFee}\n` : ""}
**Total:** $${total.toFixed(2)}

**Estimated ${
      orderData.isDelivery ? "Delivery" : "Preparation"
    } Time:** ${estimatedTime} minutes${specialInstructions}

${
  orderData.isDelivery
    ? `Your order will be delivered to your address. You'll receive updates about your delivery status.`
    : `Your order will be ready for pickup at our restaurant. We'll notify you when it's ready.`
}

Thank you for choosing ${
      order.restaurantName
    }! Your order has been confirmed and is being prepared.`;
  };

  const extractTopic = (message) => {
    const lowerMessage = message.toLowerCase();

    if (context === "restaurant") {
      if (
        lowerMessage.includes("vegetarian") ||
        lowerMessage.includes("gluten") ||
        lowerMessage.includes("vegan") ||
        lowerMessage.includes("dietary")
      ) {
        return "dietary";
      } else if (
        lowerMessage.includes("delivery") ||
        lowerMessage.includes("pickup")
      ) {
        return "delivery";
      } else if (
        lowerMessage.includes("menu") ||
        lowerMessage.includes("food")
      ) {
        return "menu";
      } else if (lowerMessage.includes("order")) {
        return "order";
      }
    } else if (context === "clinic") {
      if (lowerMessage.includes("appoint") || lowerMessage.includes("book")) {
        return "appointment";
      } else if (
        lowerMessage.includes("doctor") ||
        lowerMessage.includes("physician")
      ) {
        return "doctor";
      } else if (
        lowerMessage.includes("insurance") ||
        lowerMessage.includes("cover")
      ) {
        return "insurance";
      } else if (
        lowerMessage.includes("service") ||
        lowerMessage.includes("treat")
      ) {
        return "service";
      }
    } else if (context === "hotel") {
      if (lowerMessage.includes("book") || lowerMessage.includes("reserv")) {
        return "booking";
      } else if (
        lowerMessage.includes("room") ||
        lowerMessage.includes("suite")
      ) {
        return "room";
      } else if (
        lowerMessage.includes("ameniti") ||
        lowerMessage.includes("facility")
      ) {
        return "amenities";
      } else if (
        lowerMessage.includes("check-in") ||
        lowerMessage.includes("check-out")
      ) {
        return "checkin";
      }
    }

    return null;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearChat = () => {
    setMessages([
      {
        text: `Welcome to the ${
          context === "restaurant" ? "Restaurant" : "Clinic"
        } Assistant! How can I help you today?`,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);

    toast({
      title: "Chat cleared",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const messageVariants = {
    hidden: (sender) => ({
      opacity: 0,
      x: sender === "user" ? 20 : -20,
      y: 5,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const retryApiConnection = async () => {
    setApiStatus("checking");
    try {
      const result = await reconnectApi();
      setApiStatus(getApiStatus());

      toast({
        title: result ? "Connection restored" : "Connection failed",
        description: result
          ? "Successfully connected to the AI service"
          : "Could not connect to the AI service",
        status: result ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setApiStatus("offline");
      toast({
        title: "Connection failed",
        description: "Could not connect to the AI service",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderMessageContent = (text) => {
    if (!text) {
      return <Text>No message content</Text>;
    }

    const cleanedText = text.replace(/\n{3,}/g, "\n\n");

    if (
      cleanedText.includes("**") ||
      cleanedText.includes("*") ||
      cleanedText.includes("#") ||
      cleanedText.includes("-") ||
      cleanedText.includes("`") ||
      cleanedText.includes("```") ||
      cleanedText.includes("|") ||
      cleanedText.includes("\n\n") ||
      cleanedText.includes("> ")
    ) {
      return parseMarkdown(cleanedText);
    }

    return (
      <Text whiteSpace="pre-wrap" wordBreak="break-word">
        {cleanedText}
      </Text>
    );
  };

  const isConfirmationResponse = (message) => {
    const text = message.toLowerCase();
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

    return (
      affirmativeResponses.some((term) => text.includes(term)) ||
      negativeResponses.some((term) => text.includes(term))
    );
  };

  const isNegativeResponse = (message) => {
    const text = message.toLowerCase();
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

    return negativeResponses.some((term) => text.includes(term));
  };

  const isSimpleQuery = (message) => {
    const text = message.toLowerCase();
    return text.endsWith("?") && text.split(" ").length < 6;
  };

  const calculatePreparationTime = (items, kitchenLoad = {}) => {
    const baseTime = items.reduce((total, item) => {
      const itemPrepTime = item.preparationTime || 10;
      return total + itemPrepTime * item.quantity;
    }, 0);

    const loadFactor = kitchenLoad.currentLoad
      ? Math.min(
          1.5,
          0.8 +
            (0.1 * kitchenLoad.currentLoad) / kitchenLoad.maxSimultaneousOrders
        )
      : 1;

    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const weekendFactor = isWeekend
      ? kitchenLoad.estimationFactors?.weekendMultiplier || 1.2
      : 1;

    const currentHour = new Date().getHours();
    const isRushHour =
      (currentHour >= 11 && currentHour <= 14) ||
      (currentHour >= 17 && currentHour <= 20);
    const rushHourFactor = isRushHour
      ? kitchenLoad.estimationFactors?.rushHourMultiplier || 1.3
      : 1;

    const adjustedTime = baseTime * loadFactor * weekendFactor * rushHourFactor;

    const randomFactor = 0.9 + Math.random() * 0.2;

    return Math.ceil(adjustedTime * randomFactor);
  };

  const isContinuingConversation = (message, context) => {
    const lastTopic = context?.lastTopic;
    if (!lastTopic) return false;

    const topicKeywords = {
      order: ["order", "food", "delivery", "menu"],
      booking: ["appointment", "schedule", "book", "reserve"],
      menu: ["menu", "dish", "food", "meal"],
      delivery: ["deliver", "pickup", "takeout"],
      room: ["room", "suite", "accommodation"],
      amenities: ["amenity", "facility", "service"],
      doctor: ["doctor", "physician", "specialist"],
    };

    const keywords = topicKeywords[lastTopic] || [];
    const messageLower = message.toLowerCase();
    return keywords.some((keyword) => messageLower.includes(keyword));
  };

  const isConfirmationMessage = (message) => {
    const text = message.toLowerCase();
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
    ];

    return (
      affirmativeResponses.some((term) => text.includes(term)) ||
      negativeResponses.some((term) => text.includes(term))
    );
  };

  const startDemoMode = () => {
    setIsDemoMode(true);
    const demoQueries = getDemoQueries(context);
    runDemoSequence(demoQueries, handleSendMessage);
  };

  const renderSettings = () => (
    <ChatSettings
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      settings={settings}
      updateSettings={updateSettings}
    />
  );

  const additionalHeaderButtons = (
    <>
      <Tooltip label="Demo Mode" hasArrow>
        <IconButton
          size="sm"
          icon={<MdOutlinePreview />}
          onClick={startDemoMode}
          variant="ghost"
          color="white"
          isDisabled={isDemoMode}
        />
      </Tooltip>
      <Tooltip label="Settings" hasArrow>
        <IconButton
          size="sm"
          icon={<MdSettings />}
          onClick={() => setShowSettings(true)}
          variant="ghost"
          color="white"
        />
      </Tooltip>
    </>
  );

  const renderMessage = (msg) => (
    <MotionFlex
      key={msg.id}
      justify={msg.sender === "user" ? "flex-end" : "flex-start"}
      custom={msg.sender}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      fontSize={settings.fontSize}
    >
      {msg.sender === "ai" && (
        <Avatar
          size="sm"
          mr={2}
          icon={<FaRobot />}
          bg={msg.isError ? "red.500" : "brandPrimary.500"}
        />
      )}

      <MotionBox
        maxW={{ base: "85%", md: "70%" }}
        bg={msg.sender === "user" ? userBgColor : aiBgColor}
        p={3}
        borderRadius="lg"
        boxShadow="sm"
        position="relative"
        _hover={{
          "& > .message-actions": {
            opacity: 1,
          },
        }}
      >
        {renderMessageContent(msg.text)}

        {settings.showTimestamps && (
          <Text
            fontSize="xs"
            color={messageTimeColor}
            mt={1}
            textAlign={msg.sender === "user" ? "right" : "left"}
          >
            {formatTime(msg.timestamp)}
          </Text>
        )}

        <Flex
          className="message-actions"
          position="absolute"
          opacity="0"
          transition="opacity 0.2s"
          right={msg.sender === "user" ? "-15px" : "auto"}
          left={msg.sender === "ai" ? "-15px" : "auto"}
          top="50%"
          transform="translateY(-50%)"
        >
          <Tooltip label="Copy message" hasArrow>
            <IconButton
              size="xs"
              icon={<FaRegCopy />}
              colorScheme={msg.sender === "user" ? "brandPrimary" : "gray"}
              variant="ghost"
              onClick={() => copyToClipboard(msg.text)}
              aria-label="Copy to clipboard"
            />
          </Tooltip>
        </Flex>
      </MotionBox>

      {msg.sender === "user" && (
        <Avatar size="sm" ml={2} icon={<FaUser />} bg="brandSecondary.500" />
      )}
    </MotionFlex>
  );

  const smoothScrollToBottom = () => {
    const options = {
      behavior: "smooth",
      block: "end",
    };
    messagesEndRef.current?.scrollIntoView(options);
  };

  return (
    <Box
      w="100%"
      h={{ base: "calc(100vh - 200px)", md: "600px" }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="xl"
    >
      <Flex flexDirection="column" h="100%">
        {isDemoMode && (
          <Alert
            status="info"
            variant="subtle"
            bgGradient={demoBgColor}
            color="white"
            py={3}
            mb={0}
          >
            <Flex justify="center" align="center" w="100%" gap={2}>
              <Icon as={MdOutlinePreview} boxSize="20px" />
              <Text fontWeight="bold" fontSize="md">
                Demo Mode Active
              </Text>
              <Button
                size="sm"
                variant="ghost"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                _active={{ bg: "whiteAlpha.400" }}
                leftIcon={<Icon as={BiReset} boxSize="16px" />}
                onClick={() => setIsDemoMode(false)}
              >
                Exit Demo
              </Button>
            </Flex>
          </Alert>
        )}

        <Box
          p={4}
          bg={headerBgColor}
          color="white"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ base: "column", sm: "row" }}
            gap={{ base: 3, sm: 0 }}
          >
            <Flex align="center">
              <Icon as={FaRobot} boxSize={6} mr={3} />
              <Text fontWeight="bold" fontSize={{ base: "lg", sm: "xl" }}>
                {context === "restaurant"
                  ? "Restaurant"
                  : context === "clinic"
                  ? "Clinic"
                  : context === "hotel"
                  ? "Hotel"
                  : "AI"}{" "}
                Assistant
              </Text>
            </Flex>

            <HStack
              spacing={{ base: 2, sm: 3 }}
              flexWrap="wrap"
              justify={{ base: "center", sm: "flex-end" }}
            >
              {apiStatus === "checking" ? (
                <Spinner size="md" color="white" />
              ) : (
                <AIStatusIndicator apiStatus={apiStatus} />
              )}

              {apiStatus === "offline" && (
                <Tooltip label="Try reconnecting" hasArrow>
                  <IconButton
                    size="sm"
                    icon={<FaSync />}
                    aria-label="Try reconnecting"
                    onClick={retryApiConnection}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200", color: "white" }}
                    isLoading={apiStatus === "checking"}
                  />
                </Tooltip>
              )}

              <Tooltip label="Clear conversation" hasArrow>
                <IconButton
                  size="sm"
                  icon={<FaTrash />}
                  aria-label="Clear conversation"
                  onClick={clearChat}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200", color: "white" }}
                />
              </Tooltip>

              {additionalHeaderButtons}
            </HStack>
          </Flex>
        </Box>

        {apiStatus === "offline" && (
          <Alert status="warning" variant="solid" colorScheme="yellow">
            <AlertIcon />
            <Text>
              Running in offline mode with limited responses.
              <Link
                onClick={retryApiConnection}
                ml={2}
                textDecoration="underline"
              >
                Try reconnecting
              </Link>
            </Text>
          </Alert>
        )}

        <Box
          flex="1"
          p={{ base: 2, md: 4 }}
          overflowY="auto"
          bg={bgColor}
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: borderColor,
              borderRadius: "24px",
            },
          }}
        >
          <VStack spacing={settings.messageSpacing} align="stretch">
            {messages.map((msg) => renderMessage(msg))}
            {isTyping && settings.showTypingIndicator && (
              <MessageTypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        <Box
          p={{ base: 3, md: 5 }}
          borderTopWidth="1px"
          bg={footerBgColor}
          position="relative"
        >
          <InputGroup size="lg">
            <Input
              pr="4rem"
              h="56px"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              borderRadius="full"
              bg={inputBgColor}
              focusBorderColor="brandPrimary.400"
              fontSize="md"
              _placeholder={{ fontSize: "md" }}
            />
            <InputRightElement width="4rem" h="100%">
              <IconButton
                size="md"
                h="40px"
                w="40px"
                icon={isLoading ? <Spinner /> : <FaPaperPlane size="1.2em" />}
                colorScheme="brandPrimary"
                onClick={handleSendMessage}
                isDisabled={!input.trim() || isLoading}
                aria-label="Send message"
              />
            </InputRightElement>
          </InputGroup>
        </Box>
      </Flex>

      {renderSettings()}
    </Box>
  );
}

export default ChatInterface;
