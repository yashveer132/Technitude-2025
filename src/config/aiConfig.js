const AI_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_AI_API_KEY,

  models: {
    primary: {
      name: "gemini-2.0-flash",
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    },
    fallback: {
      name: "gemini-1.0-flash",
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    },
  },

  isConfigured: () => {
    return !!AI_CONFIG.apiKey;
  },

  getModelConfig: (type = "primary") => {
    return AI_CONFIG.models[type];
  },
};

export default AI_CONFIG;
