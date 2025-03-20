import { GoogleGenerativeAI } from "@google/generative-ai";
import AI_CONFIG from "../config/aiConfig";
import { hotelData } from "../data/hotelData";

let isApiWorking = false;
let model = null;
const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);

const findWorkingModel = async () => {
  try {
    const primaryConfig = AI_CONFIG.getModelConfig("primary");
    model = genAI.getGenerativeModel({
      model: primaryConfig.name,
      generationConfig: primaryConfig.config,
    });
    await model.generateContent("Test");
    isApiWorking = true;
    return true;
  } catch (error) {
    console.warn("Primary model failed, trying fallback:", error);
    try {
      const fallbackConfig = AI_CONFIG.getModelConfig("fallback");
      model = genAI.getGenerativeModel({
        model: fallbackConfig.name,
        generationConfig: fallbackConfig.config,
      });
      await model.generateContent("Test");
      isApiWorking = true;
      return true;
    } catch (fallbackError) {
      console.error("All models failed:", fallbackError);
      isApiWorking = false;
      return false;
    }
  }
};

findWorkingModel().catch(console.error);

export const generateAIResponse = async (prompt, context) => {
  if (!isApiWorking || !model) {
    return getOfflineResponse(prompt, context);
  }

  try {
    let systemPrompt = "";
    if (context === "restaurant") {
      systemPrompt = `You are an AI assistant for a restaurant named GenAI Fusion Restaurant.
You help customers with menu queries, dietary requirements, order recommendations, and estimated preparation times.
You should be friendly, professional, and knowledgeable about restaurant menu items and services.
When discussing preparation times, consider factors like current restaurant busyness and dish complexity.
For dietary restrictions, provide detailed information about ingredients and potential allergens.
For combo recommendations, consider customer preferences and suggest appropriate pairings.
Always maintain a helpful and attentive tone, as if you're a knowledgeable server in a high-end restaurant.
Make customers feel welcome and assist them efficiently with all their dining needs.`;
    } else if (context === "clinic") {
      systemPrompt = `You are an AI assistant for GenAI Wellness Clinic.
You help patients book appointments, check doctor availability, and provide information about medical services.
Maintain a professional, empathetic, and informative tone when discussing healthcare services.
When handling appointment requests, ask for specific date, time, and doctor preferences.
For medical queries, provide general information but advise consulting with a healthcare professional.
Be attentive to patient concerns and provide clear, accurate information about services and procedures.
Ensure all interactions are respectful of patient privacy and medical confidentiality.
When discussing medical costs and insurance, provide clear and transparent information.
For urgent medical concerns, always recommend appropriate emergency services.`;
    } else if (context === "hotel") {
      systemPrompt = `You are an AI assistant for GenAI Luxury Hotel.
You help guests with room bookings, amenity information, and answering questions about the hotel's services.
Maintain a friendly yet professional tone that reflects the hotel's upscale atmosphere.
When discussing room options, highlight unique features and amenities that enhance the guest experience.
For booking requests, ask about specific dates, room preferences, number of guests, and special requirements.
Be knowledgeable about nearby attractions, transportation options, and services available to guests.
When quoting rates, be clear about included amenities and any additional fees or taxes.
Provide information about check-in/check-out times, parking options, and special hotel policies.
Help guests feel welcomed and valued, as if they're already experiencing the hotel's exceptional service.`;
    } else {
      systemPrompt = `You are an AI assistant for ${context}. Provide helpful, accurate, and concise responses with a professional tone.`;
    }

    const combinedPrompt = `${systemPrompt}\n\nUser query: ${prompt}`;
    const result = await model.generateContent(combinedPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    isApiWorking = false;
    return getOfflineResponse(prompt, context);
  }
};

function formatRoomDetails(room) {
  return `• ${room.type} - $${room.rate}/night
    - ${room.description}
    - Max Occupancy: ${room.maxOccupancy} guests
    - Amenities: ${room.amenities.join(", ")}
    - Features: ${room.features.join(", ")}
    - Status: ${room.availability ? "Available" : "Currently Booked"}`;
}

function getOfflineResponse(prompt, context) {
  const query = prompt.toLowerCase();

  if (context === "hotel") {
    if (
      query.includes("list") ||
      query.includes("available") ||
      query.includes("show") ||
      (query.includes("what") && query.includes("room")) ||
      query.includes("tell me about") ||
      query.includes("room type")
    ) {
      return `Here are all our room types at ${
        hotelData.name
      }:\n\n${hotelData.rooms
        .map(formatRoomDetails)
        .join(
          "\n\n"
        )}\n\nWould you like to proceed with a booking? I can help you check availability for your preferred dates.`;
    } else if (
      query.includes("room") ||
      query.includes("suite") ||
      query.includes("accommodation") ||
      query.includes("stay") ||
      query.includes("book")
    ) {
      return `Let me show you our available room types first:\n\n${hotelData.rooms
        .map(formatRoomDetails)
        .join(
          "\n\n"
        )}\n\nTo proceed with a booking, please let me know your preferred check-in date and room type. I'll help you check availability.`;
    } else if (query.includes("amenities") || query.includes("facilities")) {
      return "GenAI Luxury Hotel offers a comprehensive range of amenities to enhance your stay. Our facilities include a rooftop infinity pool with panoramic city views, a fully-equipped fitness center open 24/7, a luxury spa offering various treatments, three distinctive dining venues including our award-winning rooftop restaurant, concierge services, complimentary high-speed Wi-Fi throughout the property, valet parking, business center, and executive lounge access for suite guests. Would you like more details about any specific amenity?";
    } else if (
      query.includes("location") ||
      query.includes("nearby") ||
      query.includes("around")
    ) {
      return "GenAI Luxury Hotel enjoys a prime downtown location with numerous attractions within walking distance. We're just two blocks from Central Plaza, a 5-minute walk to the Museum of Fine Arts, 10 minutes from the Symphony Hall, and surrounded by boutique shopping and fine dining options. The International Airport is a convenient 20-minute drive, and public transportation is accessible from the Metro Station just across the street. Our concierge team can arrange tours and transportation to any destination you're interested in exploring.";
    } else if (
      query.includes("check-in") ||
      query.includes("check-out") ||
      query.includes("arrival")
    ) {
      return "Our standard check-in time is 3:00 PM, and check-out is at 12:00 PM noon. Early check-in and late check-out can be arranged based on availability for a nominal fee. If you arrive before your room is ready, our bell staff will be happy to store your luggage securely while you enjoy our facilities or explore the area. For Platinum Rewards members, we offer guaranteed early check-in from 12:00 PM and late check-out until 2:00 PM at no additional charge.";
    } else if (
      query.includes("dining") ||
      query.includes("restaurant") ||
      query.includes("breakfast")
    ) {
      return "GenAI Luxury Hotel features three exceptional dining venues: The Skyline Restaurant on our rooftop level offers innovative fine dining with panoramic city views, open for dinner from 5:30 PM to 10:30 PM. The Garden Café provides casual all-day dining in a lush atrium setting from 6:30 AM to 10:00 PM. Our elegant Lobby Lounge serves light fare, afternoon tea, and craft cocktails from 11:00 AM until midnight. Complimentary breakfast is included with all room rates and is served at The Garden Café from 6:30 AM to 10:30 AM (until 11:00 AM on weekends).";
    } else if (
      query.includes("spa") ||
      query.includes("massage") ||
      query.includes("wellness")
    ) {
      return "Our Serenity Spa offers a comprehensive range of treatments designed to relax and rejuvenate. Popular options include our Signature Massage (60/90 minutes, $150/$210), Hot Stone Therapy (75 minutes, $180), Revitalizing Facial (60 minutes, $165), and Detoxifying Body Wrap (90 minutes, $195). The spa facilities include aromatherapy steam rooms, a meditation garden, and a relaxation lounge with herbal teas. We recommend booking treatments at least 24 hours in advance, especially during weekends. Hotel guests receive a 15% discount on all spa services.";
    } else if (
      query.includes("parking") ||
      query.includes("car") ||
      query.includes("transport")
    ) {
      return "We offer valet parking service for hotel guests at $35 per night with unlimited in/out privileges. Self-parking is available in the adjacent parking garage at $25 per night. For transportation needs, our concierge can arrange airport transfers ($60 one-way), private car service ($75 per hour), or taxi/rideshare services. We also offer complimentary luxury sedan service within a 2-mile radius of the hotel, subject to availability. Electric vehicle charging stations are available in our parking area at no additional cost.";
    }
    return "Welcome to GenAI Luxury Hotel! Our property combines elegant accommodations with exceptional service to create memorable stays in the heart of the city. From our sophisticated rooms and suites to our world-class dining and wellness facilities, we strive to exceed every expectation. How may I assist you with your upcoming stay or inquiry today?";
  }

  if (context === "restaurant") {
    if (
      query.includes("menu") ||
      query.includes("food") ||
      query.includes("eat")
    ) {
      return generateMenuResponse(query);
    } else if (query.includes("order") || query.includes("delivery")) {
      return handleOrderQuery(query);
    } else if (query.includes("time") || query.includes("wait")) {
      return generateWaitTimeResponse();
    } else if (query.includes("dietary") || query.includes("allergy")) {
      return generateDietaryResponse(query);
    } else if (query.includes("special") || query.includes("deal")) {
      return generateSpecialsResponse();
    }
  }

  if (context === "restaurant") {
    if (query.includes("vegetarian")) {
      return "We have several delicious vegetarian options on our menu. Our most popular choices include the Mediterranean Veggie Platter with housemade hummus, the Vegetarian Buddha Bowl with seasonal roasted vegetables and quinoa, and our signature Mushroom Risotto with truffle oil. All dishes can be prepared vegan upon request.";
    } else if (query.includes("gluten-free") || query.includes("gluten free")) {
      return "We offer numerous gluten-free options to accommodate dietary needs. Our Grilled Salmon with lemon-herb sauce, Caesar Salad (when ordered without croutons), and our specialty Quinoa Bowl are all gluten-free. Our kitchen takes special precautions to prevent cross-contamination for guests with celiac disease or gluten sensitivity.";
    } else if (query.includes("menu")) {
      return "Our menu features a thoughtfully curated selection of fusion dishes including our award-winning Vegetarian Buddha Bowl, fresh Grilled Salmon with seasonal vegetables, Classic Cheeseburger with house-cut fries, creamy Mushroom Risotto with truffle oil, crisp Caesar Salad with homemade dressing, and for dessert, our famous Chocolate Lava Cake. We also offer daily chef's specials featuring local, seasonal ingredients.";
    } else if (
      query.includes("time") ||
      query.includes("ready") ||
      query.includes("wait")
    ) {
      return "Most of our signature dishes take approximately 20-25 minutes to prepare, as we make everything fresh to order. During peak dining hours (12-2pm and 6-8pm), wait times may extend to 30-35 minutes. Our appetizers typically arrive within 10-15 minutes. If you're in a hurry, please let us know, and we can recommend quick-service options from our menu.";
    } else if (query.includes("delivery") || query.includes("takeout")) {
      return "We offer both delivery and takeout services. Delivery is available within a 5-mile radius with a $5.99 delivery fee (waived for orders over $50). For takeout orders, you can order through our website or by phone, and your food will typically be ready for pickup in 25-30 minutes. We provide accurate time estimates when you place your order based on current kitchen volume.";
    } else if (
      query.includes("recommend") ||
      query.includes("popular") ||
      query.includes("suggestion")
    ) {
      return "Our most popular dishes include our signature Seafood Paella, which combines fresh shrimp, clams, and fish with saffron rice, and our Truffle Mushroom Risotto, a creamy arborio rice dish with wild mushrooms and white truffle oil. For a lighter option, guests love our Mediterranean Plate with house-made hummus, tabbouleh, and warm pita. Would you like more specific recommendations based on your taste preferences?";
    } else if (query.includes("allergy") || query.includes("allergic")) {
      return "We take food allergies very seriously and can accommodate most dietary restrictions. Our kitchen staff is trained to prevent cross-contamination, and we maintain detailed ingredient information for all our dishes. Please inform us of any allergies when ordering, and our chef will ensure your meal is prepared safely. For severe allergies, we recommend speaking directly with our manager who can provide additional guidance.";
    } else if (
      query.includes("special occasion") ||
      query.includes("birthday") ||
      query.includes("anniversary")
    ) {
      return "We'd be delighted to help make your special occasion memorable! We offer customized dining experiences including special table arrangements, personalized menus, and complimentary desserts for birthdays and anniversaries. For larger celebrations, our private dining room can accommodate groups of up to 25 people with pre-fixed menu options. Please let us know your specific requirements, and we'll make sure your celebration is exceptional.";
    }
    return "Welcome to GenAI Fusion Restaurant! We offer a diverse menu of thoughtfully prepared dishes using fresh, locally-sourced ingredients wherever possible. Our culinary team specializes in creative fusion cuisine with options for various dietary preferences. How may I assist you with our menu, specials, or help you place an order today?";
  } else if (context === "clinic") {
    if (query.includes("appointment") || query.includes("book")) {
      return "To book an appointment, I'd be happy to assist you. Could you please provide your preferred date, doctor, and time? We have several specialists available including Dr. Sarah Johnson (General Physician), Dr. Rebecca Chen (Pediatrician), and Dr. David Wilson (Orthopedic Surgeon). For most accurate availability, I recommend providing at least two preferred time slots. All appointments include an initial consultation and any necessary follow-up recommendations.";
    } else if (query.includes("doctor") || query.includes("available")) {
      return "Our medical team includes several highly qualified doctors across various specialties: Dr. Sarah Johnson (General Physician, available Mon-Wed), Dr. Rebecca Chen (Pediatrician, available Tues-Fri), Dr. David Wilson (Orthopedic Surgeon, available Mon, Wed, Fri), Dr. Michael Lee (Cardiologist, available Thurs-Sat), and Dr. Elizabeth Taylor (Dermatologist, available Mon, Tues, Thurs). Would you like more information about any particular doctor or specialty?";
    } else if (
      query.includes("fee") ||
      query.includes("cost") ||
      query.includes("price")
    ) {
      return "Our consultation fees vary by specialty and service type. General check-ups with Dr. Johnson are $120, pediatric check-ups with Dr. Chen are $135, orthopedic consultations with Dr. Wilson are $175, cardiology consultations with Dr. Lee are $195, and dermatology services with Dr. Taylor range from $140-$180. These fees cover the initial consultation and standard in-office procedures. We accept most major insurance plans, which typically cover a significant portion of these costs.";
    } else if (query.includes("insurance")) {
      return "GenAI Wellness Clinic accepts most major insurance plans including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, Medicare, and Humana. We recommend verifying your coverage before your appointment. Our administrative staff can help you understand your benefits and any potential out-of-pocket expenses. For patients without insurance, we offer reasonable self-pay rates and payment plans as needed.";
    } else if (query.includes("service") || query.includes("offer")) {
      return "We offer comprehensive healthcare services including general check-ups, preventive care, pediatric services, chronic disease management, orthopedic evaluations, cardiovascular screenings, dermatology treatments, minor surgical procedures, vaccinations, lab testing, and specialist referrals. Each service is tailored to meet individual patient needs with an emphasis on holistic wellness and preventative care. Is there a specific service you're interested in learning more about?";
    } else if (query.includes("emergency") || query.includes("urgent")) {
      return "For medical emergencies, please call 911 immediately or go to your nearest emergency room. While we do offer same-day appointments for urgent but non-life-threatening conditions, we are not an emergency facility. Our urgent care hours are Monday-Friday 8:00 AM to 7:00 PM and Saturday 9:00 AM to 3:00 PM. Please call ahead at (555) 123-4567 so we can prepare for your arrival and minimize your wait time.";
    } else if (
      query.includes("covid") ||
      query.includes("vaccine") ||
      query.includes("testing")
    ) {
      return "We provide COVID-19 testing (both PCR and rapid antigen) and vaccinations at our clinic. Testing is available by appointment Monday through Saturday, with results typically available within 24-48 hours for PCR and 15 minutes for rapid tests. We offer all authorized COVID-19 vaccines and boosters. Please bring your ID and insurance card if you have one, though testing and vaccines are available regardless of insurance status.";
    }
    return "Welcome to GenAI Wellness Clinic! Our team of healthcare professionals is dedicated to providing comprehensive, patient-centered care for you and your family. Whether you need to schedule an appointment, have questions about our services, or need information about our doctors, I'm here to assist you. How may I help you with your healthcare needs today?";
  }

  return "I'm here to help! Please let me know what information you're looking for, and I'll be happy to provide professional assistance tailored to your needs.";
}

function generateMenuResponse(query) {
  if (query.includes("popular")) {
    return "Our most popular dishes include the Vegetarian Buddha Bowl, Grilled Salmon, and our signature Thai Curry. Would you like to know more about any of these dishes?";
  }
  return "Our menu features a diverse selection of dishes including appetizers, main courses, and desserts. We specialize in both vegetarian and non-vegetarian options. Would you like to see our full menu or specific categories?";
}

function handleOrderQuery(query) {
  if (query.includes("delivery")) {
    return "We offer delivery within a 5-mile radius. The delivery fee is $3.99, waived for orders over $25. Would you like to place a delivery order?";
  }
  return "I'll be happy to help you place an order. Would you like to start with our popular dishes or see the full menu?";
}

function generateWaitTimeResponse() {
  const currentHour = new Date().getHours();
  const isRushHour =
    (currentHour >= 11 && currentHour <= 14) ||
    (currentHour >= 17 && currentHour <= 20);
  return `Current wait times are ${
    isRushHour ? "25-35" : "15-20"
  } minutes for most dishes. Would you like to place an order?`;
}

function generateDietaryResponse(query) {
  if (query.includes("vegetarian")) {
    return "We have a wide range of vegetarian options, including dishes made with fresh vegetables, legumes, and plant-based proteins. All our vegetarian dishes can be modified to be vegan upon request.";
  } else if (query.includes("gluten")) {
    return "Our gluten-free menu includes a variety of dishes prepared with special care to avoid cross-contamination. We use dedicated cooking spaces and utensils for gluten-free preparation.";
  } else if (query.includes("allergy")) {
    return "We take food allergies very seriously. Please let us know your specific allergies, and our chef will ensure your meal is prepared safely in a separate area with appropriate precautions.";
  }
  return "We accommodate various dietary requirements including vegetarian, vegan, gluten-free, and other allergies. Please let us know your specific needs, and we'll be happy to assist.";
}

function generateSpecialsResponse() {
  const currentHour = new Date().getHours();
  const isLunchTime = currentHour >= 11 && currentHour <= 15;
  const isDinnerTime = currentHour >= 17 && currentHour <= 22;

  if (isLunchTime) {
    return "Our lunch specials today include a choice of soup or salad with any main course. We also offer a business lunch combo with appetizer, main course, and dessert.";
  } else if (isDinnerTime) {
    return "Tonight's dinner specials feature our chef's signature dishes and a special prix fixe menu that includes an appetizer, main course, and dessert.";
  }
  return "We offer daily specials and seasonal menu items. Our staff can tell you about today's featured dishes and current promotions.";
}

export const enhanceResponseWithDomainData = (
  response,
  userMessage,
  context,
  domainData
) => {
  let enhancedResponse = response;

  if (!domainData) {
    return enhancedResponse;
  }

  if (context === "restaurant") {
    if (userMessage.toLowerCase().includes("vegetarian")) {
      const vegOptions = domainData.menu.filter((item) => item.isVegetarian);
      if (vegOptions.length > 0) {
        enhancedResponse += `\n\nOur current vegetarian selections include: ${vegOptions
          .map(
            (item) =>
              `${item.name} ($${item.price.toFixed(2)})${
                item.description ? ` - ${item.description}` : ""
              }`
          )
          .join(
            ", "
          )}. All vegetarian dishes can be prepared vegan upon request - please let us know if you have any specific dietary requirements.`;
      }
    }

    if (
      userMessage.toLowerCase().includes("gluten-free") ||
      userMessage.toLowerCase().includes("gluten free")
    ) {
      const gfOptions = domainData.menu.filter((item) => item.isGlutenFree);
      if (gfOptions.length > 0) {
        enhancedResponse += `\n\nOur kitchen takes dietary restrictions seriously. These gluten-free options are prepared with care to avoid cross-contamination: ${gfOptions
          .map(
            (item) =>
              `${item.name} ($${item.price.toFixed(2)})${
                item.description ? ` - ${item.description}` : ""
              }`
          )
          .join(", ")}.`;
      }
    }

    if (
      userMessage.toLowerCase().includes("how long") ||
      userMessage.toLowerCase().includes("preparation time") ||
      userMessage.toLowerCase().includes("ready") ||
      userMessage.toLowerCase().includes("wait time")
    ) {
      const currentHour = new Date().getHours();
      const isWeekend = [0, 6].includes(new Date().getDay());
      let businessStatus = "moderate";

      if (
        (currentHour >= 12 && currentHour <= 14) ||
        (currentHour >= 17 && currentHour <= 20)
      ) {
        businessStatus = "busy";
      } else if (currentHour < 11 || currentHour > 21) {
        businessStatus = "quiet";
      }

      const estimatedTimeAdjustment =
        businessStatus === "busy"
          ? "10-15 minutes longer than usual"
          : businessStatus === "quiet"
          ? "typically faster than our average times"
          : "right on our estimated preparation times";

      enhancedResponse += `\n\nCurrently, we are experiencing ${businessStatus} service levels${
        isWeekend ? " due to weekend volume" : ""
      }. Wait times are ${estimatedTimeAdjustment}. Our average preparation time is ${
        domainData.orderInformation.averagePreparationTime
      } minutes for most dishes.`;
    }

    if (
      userMessage.toLowerCase().includes("delivery") ||
      userMessage.toLowerCase().includes("takeout")
    ) {
      enhancedResponse += `\n\nDelivery details: $${domainData.orderInformation.deliveryFee.toFixed(
        2
      )} delivery fee (free for orders over $${
        domainData.orderInformation.minimumOrderForFreeDelivery
      }). Typical delivery radius is ${
        domainData.orderInformation.deliveryRadius
      } miles from our location. Current estimated delivery time: ${
        [0, 6].includes(new Date().getDay()) ? "45-60" : "30-45"
      } minutes.`;
    }

    if (
      userMessage.toLowerCase().includes("combo") ||
      userMessage.toLowerCase().includes("special") ||
      userMessage.toLowerCase().includes("deal")
    ) {
      if (domainData.combos && domainData.combos.length > 0) {
        enhancedResponse += `\n\nCurrently, we are featuring these special combos:\n${domainData.combos
          .map(
            (combo) =>
              `• ${combo.name}: ${combo.description} - $${combo.price.toFixed(
                2
              )}`
          )
          .join("\n")}`;
      }
    }

    if (
      userMessage.toLowerCase().includes("season") ||
      userMessage.toLowerCase().includes("special") ||
      userMessage.toLowerCase().includes("feature")
    ) {
      const currentMonth = new Date().getMonth();
      let seasonalHighlight = "";

      if (currentMonth >= 2 && currentMonth <= 4) {
        seasonalHighlight =
          "Our spring menu features fresh asparagus, pea, and mint dishes.";
      } else if (currentMonth >= 5 && currentMonth <= 7) {
        seasonalHighlight =
          "Our summer specials include house-made fruit sorbets and grilled seafood platters.";
      } else if (currentMonth >= 8 && currentMonth <= 10) {
        seasonalHighlight =
          "Our fall menu showcases butternut squash risotto and apple cider glazed dishes.";
      } else {
        seasonalHighlight =
          "Our winter specials include hearty stews, truffle-infused dishes, and holiday-inspired desserts.";
      }

      enhancedResponse += `\n\n${seasonalHighlight} Ask about our Chef's daily special when placing your order.`;
    }
  } else if (context === "clinic") {
    if (
      userMessage.toLowerCase().includes("doctor") ||
      userMessage.toLowerCase().includes("available")
    ) {
      const availableDoctors = domainData.doctors.filter(
        (doc) => doc.available
      );
      if (availableDoctors.length > 0) {
        enhancedResponse +=
          "\n\nOur currently available doctors include: \n" +
          availableDoctors
            .map(
              (doc) =>
                `• Dr. ${doc.name} (${
                  doc.specialty
                }) - Available ${doc.availableDays.join(", ")}`
            )
            .join("\n");
      }
    }

    if (
      userMessage.toLowerCase().includes("fee") ||
      userMessage.toLowerCase().includes("cost") ||
      userMessage.toLowerCase().includes("price") ||
      userMessage.toLowerCase().includes("charges")
    ) {
      enhancedResponse +=
        "\n\nOur current consultation fees by service type: \n" +
        domainData.services
          .map(
            (service) =>
              `• ${service.name}: $${service.fee} (${service.duration} minutes)`
          )
          .join("\n") +
        "\n\nWe accept most major insurance plans which may cover part or all of these costs depending on your coverage.";
    }

    if (userMessage.toLowerCase().includes("insurance")) {
      if (
        domainData.insuranceAccepted &&
        domainData.insuranceAccepted.length > 0
      ) {
        enhancedResponse += `\n\nWe currently accept these insurance plans: ${domainData.insuranceAccepted.join(
          ", "
        )}. Our billing department can verify your coverage prior to your appointment - please have your insurance card available when you call.`;
      }
    }

    if (
      userMessage.toLowerCase().includes("service") ||
      userMessage.toLowerCase().includes("treatment")
    ) {
      const servicesByCategory = {};

      domainData.services.forEach((service) => {
        const category = service.category || "General Services";
        if (!servicesByCategory[category]) {
          servicesByCategory[category] = [];
        }
        servicesByCategory[category].push(service);
      });

      const serviceList = Object.entries(servicesByCategory)
        .map(([category, services]) => {
          return `**${category}**: ${services.map((s) => s.name).join(", ")}`;
        })
        .join("\n");

      enhancedResponse += `\n\nOur clinic offers a comprehensive range of medical services:\n${serviceList}`;
    }

    if (
      userMessage.toLowerCase().includes("hour") ||
      userMessage.toLowerCase().includes("open")
    ) {
      enhancedResponse += `\n\n**Clinic Hours:**\nMonday-Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 3:00 PM\nSunday: Closed\n\nLab services are available Monday-Friday 7:30 AM - 4:00 PM.`;
    }
  } else if (context === "hotel") {
    if (
      userMessage.toLowerCase().includes("room") ||
      userMessage.toLowerCase().includes("suite") ||
      userMessage.toLowerCase().includes("accommodation")
    ) {
      if (domainData.rooms && domainData.rooms.length > 0) {
        enhancedResponse +=
          "\n\n**Available Room Types:**\n" +
          domainData.rooms
            .map(
              (room) =>
                `• ${room.type}: ${room.description} - $${room.rate}/night${
                  room.features
                    ? ` (Features: ${room.features.join(", ")})`
                    : ""
                }`
            )
            .join("\n");
      }
    }

    if (
      userMessage.toLowerCase().includes("amenity") ||
      userMessage.toLowerCase().includes("facility") ||
      userMessage.toLowerCase().includes("feature")
    ) {
      enhancedResponse += `\n\n**Hotel Amenities:**
• 24-hour fitness center with state-of-the-art equipment
• Rooftop infinity pool with city views
• Full-service spa offering massages and treatments
• Business center with meeting rooms
• Concierge services available around the clock
• Complimentary high-speed WiFi throughout property
• 24-hour room service
• Valet parking service
• Three on-site dining options`;
    }

    if (
      userMessage.toLowerCase().includes("restaurant") ||
      userMessage.toLowerCase().includes("dining") ||
      userMessage.toLowerCase().includes("breakfast") ||
      userMessage.toLowerCase().includes("food")
    ) {
      if (domainData.dining && domainData.dining.length > 0) {
        enhancedResponse +=
          "\n\n**Dining Options:**\n" +
          domainData.dining
            .map(
              (venue) =>
                `• ${venue.name}: ${venue.description} - Hours: ${venue.hours}`
            )
            .join("\n");
      } else {
        enhancedResponse += `\n\n**Dining Options:**
• The Skyline Restaurant: Fine dining with panoramic city views - Open 5:30 PM - 10:30 PM
• The Garden Café: Casual all-day dining - Open 6:30 AM - 10:00 PM
• Lobby Lounge: Light fare and cocktails - Open 11:00 AM - 12:00 AM
• Room Service: Available 24 hours`;
      }
    }

    if (
      userMessage.toLowerCase().includes("nearby") ||
      userMessage.toLowerCase().includes("attraction") ||
      userMessage.toLowerCase().includes("visit") ||
      userMessage.toLowerCase().includes("see")
    ) {
      enhancedResponse += `\n\n**Nearby Attractions:**
• Central Plaza - 5 minute walk
• Museum of Fine Arts - 10 minute walk
• Symphony Hall - 15 minute walk
• Shopping District - 8 minute walk
• Waterfront Park - 20 minute walk
• Convention Center - 12 minute walk`;
    }
  }

  return enhancedResponse;
};
