export const getDemoQueries = (context) => {
  const queries = {
    restaurant: [
      "What vegetarian options do you have?",
      "I'd like to order a Vegetarian Buddha Bowl",
      "Is it available for delivery?",
      "Yes, please add it to my order",
      "What's the delivery time?",
    ],
    clinic: [
      "Who are your available doctors?",
      "I'd like to book an appointment with Dr. Johnson",
      "Is tomorrow at 10 AM available?",
      "Yes, I'd like to confirm the booking",
      "What insurance plans do you accept?",
    ],
    hotel: [
      "What room types do you have available?",
      "I'm interested in the Executive Suite",
      "Is it available next weekend?",
      "What amenities are included?",
      "I'd like to make a booking",
    ],
  };

  return queries[context] || [];
};

export const runDemoSequence = async (
  queries = [],
  handleMessage = () => {}
) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const query of queries) {
    await delay(2000);
    await handleMessage(query);
  }
};
