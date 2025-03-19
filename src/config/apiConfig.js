const API_CONFIG = {
  googleAIApiKey:
    process.env.REACT_APP_GOOGLE_AI_API_KEY ||
    "AIzaSyDutDKJZBucAq6NO-KjcrPf69bMbOo41Ew",

  aiModel: "gemini-2.0-flash",

  fallbackModel: "gemini-1.0-flash",

  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.7,
  },
};

export const isGoogleAIConfigured = () => {
  return !!API_CONFIG.googleAIApiKey;
};

export default API_CONFIG;
