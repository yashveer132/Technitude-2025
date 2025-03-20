export const getDemoQueries = (context) => {
  const queries = {
    restaurant: [
      "What vegetarian options do you have?",
      "I'd like to order a Vegetarian Buddha Bowl",
      "Is it available for delivery?",
      "What are the differnt combo options available?",
      "I need something spicy to eat",
    ],
    clinic: [
      "Who are your available doctors?",
      "I'd like to book an appointment with Dr. Johnson",
      "What insurance plans do you accept?",
      "What is your appointment poilicy",
    ],
    hotel: [
      "What room types do you have available?",
      "I'm interested in the Executive Suite",
      "What are the different hotel services that you offer",
      "What are the differnet packages available",
      "What is the check-in and check-out times?",
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
