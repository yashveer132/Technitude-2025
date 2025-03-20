export const hotelData = {
  name: "Luxury Hotel",
  address: "123 Hotel Avenue, Cyber District, GA 30033",
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
      availability: false,
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
    {
      id: "family-suite",
      type: "Family Suite",
      description:
        "Spacious 750 sq ft suite perfect for families with separate living area",
      rate: 399,
      maxOccupancy: 4,
      amenities: [
        "2 Queen beds",
        "65-inch HDTV",
        "Kitchenette",
        "Dining area",
        "2 Bathrooms",
        "Kids play corner",
      ],
      features: [
        "Free WiFi",
        "Garden View",
        "Kids Welcome Pack",
        "Family Movie Library",
        "Daily Housekeeping",
      ],
      availability: true,
    },
    {
      id: "penth-suite",
      type: "Penthouse Suite",
      description: "Luxurious 1200 sq ft top floor suite with panoramic views",
      rate: 899,
      maxOccupancy: 4,
      amenities: [
        "Master bedroom with King bed",
        "Second bedroom with Queen bed",
        "75-inch HDTV",
        "Full kitchen",
        "Private terrace",
        "Jacuzzi tub",
        "Walk-in closet",
      ],
      features: [
        "Free WiFi",
        "Panoramic Views",
        "Butler Service",
        "Private Check-in",
        "Complimentary Airport Transfer",
        "Daily Housekeeping",
        "VIP Lounge Access",
      ],
      availability: false,
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
    earlyCheckIn: {
      availability: "Subject to availability",
      cost: "$50 (before 12 PM)",
      eliteMembers: "Complimentary for Gold & Platinum members",
    },
    lateCheckout: {
      availability: "Subject to availability",
      cost: "$40 (until 4 PM)",
      eliteMembers: "Complimentary for Gold & Platinum members",
    },
    extraBed: {
      cost: "$40 per night",
      availability: "Not available in Standard rooms",
    },
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
    {
      id: "service-4",
      name: "Private Airport Transfer",
      description: "Luxury vehicle airport pickup/drop-off service",
      hours: "24 hours (booking required)",
      cost: "From $75 one-way",
    },
    {
      id: "service-5",
      name: "Childcare Services",
      description: "Professional babysitting and kids activities",
      hours: "9:00 AM - 9:00 PM",
      cost: "$25/hour",
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
    {
      id: "pkg-3",
      name: "Family Fun Package",
      description: "Perfect for family vacations",
      includes: [
        "Family suite accommodation",
        "Daily breakfast for 4",
        "Kids eat free",
        "Theme park tickets",
        "Welcome gifts for children",
        "Late checkout until 2 PM",
      ],
      price: 499,
      discount: 0.2,
    },
    {
      id: "pkg-4",
      name: "Wellness Retreat",
      description: "Rejuvenate your body and mind",
      includes: [
        "Deluxe room accommodation",
        "Daily yoga sessions",
        "Spa treatment",
        "Healthy meal plan",
        "Fitness center access",
        "Meditation classes",
      ],
      price: 399,
      discount: 0.15,
    },
  ],
};
