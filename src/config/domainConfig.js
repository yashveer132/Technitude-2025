export const domainConfig = {
  restaurant: {
    name: "Restaurant Domain",
    features: {
      menuBrowsing: true,
      dietaryFilters: true,
      orderTracking: true,
      deliveryOptions: true,
      combos: true,
    },
    queryTypes: {
      menu: ["vegetarian", "gluten-free", "allergens", "prices"],
      orders: ["delivery", "preparation", "reservation"],
      recommendations: ["combos", "popular", "dietary"],
      information: ["hours", "location", "payment"],
    },
  },
  clinic: {
    name: "Clinic Domain",
    features: {
      appointmentBooking: true,
      doctorAvailability: true,
      insuranceCheck: true,
      serviceInfo: true,
    },
    queryTypes: {
      appointments: ["booking", "cancellation", "reschedule"],
      doctors: ["availability", "specialization", "schedule"],
      services: ["consultation", "procedures", "fees"],
      insurance: ["coverage", "plans", "claims"],
    },
  },
};
