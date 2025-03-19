export const hotelData = {
  name: "GenAI Luxury Hotel",
  tagline: "Experience unparalleled luxury in the heart of the city",
  description:
    "Our 5-star boutique hotel combines modern elegance with personalized service.",

  rooms: [
    {
      id: "std-king",
      type: "Standard King Room",
      description: "Comfortable 350 sq ft room with king bed and city view",
      rate: 199,
      maxOccupancy: 2,
      amenities: ["King bed", "40-inch HDTV", "Work desk", "Mini fridge"],
      features: ["Free WiFi", "City View", "Daily Housekeeping"],
      availability: true,
    },
    {
      id: "dlx-king",
      type: "Deluxe King Room",
      description: "Spacious 450 sq ft room with premium city view",
      rate: 249,
      maxOccupancy: 2,
      amenities: [
        "King bed",
        "50-inch HDTV",
        "Work desk",
        "Mini bar",
        "Espresso machine",
      ],
      features: [
        "Free WiFi",
        "Premium View",
        "Daily Housekeeping",
        "Lounge Access",
      ],
      availability: true,
    },
    {
      id: "exec-suite",
      type: "Executive Suite",
      description: "Luxurious 650 sq ft suite with separate living area",
      rate: 349,
      maxOccupancy: 3,
      amenities: [
        "King bed",
        "Living room",
        "55-inch HDTV",
        "Full mini bar",
        "Dining area",
      ],
      features: [
        "Free WiFi",
        "Panoramic View",
        "Butler Service",
        "Lounge Access",
      ],
      availability: true,
    },
  ],

  dining: [
    {
      name: "Skyline Restaurant",
      type: "Fine Dining",
      cuisine: "Contemporary International",
      hours: "5:30 PM - 10:30 PM",
      description: "Award-winning rooftop dining with panoramic views",
      reservationRequired: true,
    },
    {
      name: "Garden Café",
      type: "Casual Dining",
      cuisine: "International Buffet",
      hours: "6:30 AM - 10:00 PM",
      description: "All-day dining in a lush garden setting",
      reservationRequired: false,
    },
  ],

  amenities: {
    wellness: [
      {
        name: "Serenity Spa",
        services: ["Massage", "Facial", "Body Treatment"],
        hours: "9:00 AM - 9:00 PM",
      },
      {
        name: "Fitness Center",
        features: ["Cardio Equipment", "Free Weights", "Personal Training"],
        hours: "24/7",
      },
    ],
    business: [
      {
        name: "Business Center",
        services: ["Meeting Rooms", "Video Conferencing", "Printing"],
        hours: "24/7",
      },
    ],
  },

  policies: {
    checkIn: "3:00 PM",
    checkOut: "12:00 PM",
    cancellation: "24 hours before arrival",
    deposit: "First night's stay",
    pets: "Pet-friendly rooms available upon request",
    smoking: "100% non-smoking property",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    petsAllowed: true,
    smokingAllowed: false,
    paymentOptions: [
      "Credit Cards (Visa, MasterCard, American Express)",
      "Debit Cards",
      "Cash",
      "Digital Wallets",
    ],
  },

  specialOffers: [
    {
      name: "Weekend Getaway",
      description: "Stay 2 nights, get 20% off",
      validUntil: "2024-12-31",
      code: "WEEKEND20",
    },
    {
      name: "Spa Package",
      description: "Includes daily spa treatment",
      validUntil: "2024-12-31",
      code: "SPAWELL",
    },
  ],

  transportation: {
    airport: {
      distance: "12 miles",
      shuttle: "Available 24/7",
      cost: 60,
    },
    parking: {
      valet: 35,
      self: 25,
      electric: "Complimentary charging stations",
    },
  },

  nearby: [
    {
      name: "Central Plaza",
      distance: "0.2 miles",
      walkTime: "5 minutes",
    },
    {
      name: "Museum of Fine Arts",
      distance: "0.4 miles",
      walkTime: "10 minutes",
    },
    {
      name: "Convention Center",
      distance: "0.6 miles",
      walkTime: "12 minutes",
    },
  ],

  services: [
    {
      id: "service-1",
      name: "Room Service",
      description: "24/7 in-room dining service",
      hours: "24 hours",
      cost: "Varies by menu item",
    },
    {
      id: "service-2",
      name: "Concierge",
      description: "Personal assistance for all guest needs",
      hours: "24 hours",
      cost: "Complimentary",
    },
    {
      id: "service-3",
      name: "Spa Services",
      description: "Full-service spa treatments",
      hours: "9:00 AM - 9:00 PM",
      cost: "From $99",
    },
  ],

  packages: [
    {
      id: "pkg-1",
      name: "Romance Package",
      description: "Perfect for couples",
      includes: [
        "Champagne upon arrival",
        "Couples massage",
        "Romantic dinner for two",
      ],
      price: 299,
      discount: 0.15,
    },
    {
      id: "pkg-2",
      name: "Business Package",
      description: "Ideal for business travelers",
      includes: [
        "Airport transfer",
        "Daily breakfast",
        "Access to business center",
      ],
      price: 249,
      discount: 0.1,
    },
  ],
};
