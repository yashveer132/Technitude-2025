export class ChatServiceError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = "ChatServiceError";
    this.type = type;
    this.details = details;
  }
}

export const ERROR_TYPES = {
  MODEL_INITIALIZATION: "model_initialization",
  RESPONSE_GENERATION: "response_generation",
  INVALID_DOMAIN: "invalid_domain",
  RATE_LIMIT: "rate_limit",
  NETWORK: "network",
  CACHE: "cache",
  VALIDATION: "validation",
};

export const handleChatError = (error, context = {}) => {
  const errorResponse = {
    message: "An unexpected error occurred",
    fallbackResponse: null,
    shouldRetry: false,
  };

  if (error instanceof ChatServiceError) {
    switch (error.type) {
      case ERROR_TYPES.MODEL_INITIALIZATION:
        errorResponse.message = "Unable to initialize AI model";
        errorResponse.shouldRetry = true;
        break;
      case ERROR_TYPES.RESPONSE_GENERATION:
        errorResponse.message = "Failed to generate response";
        errorResponse.fallbackResponse = getContextBasedFallback(context);
        break;
      case ERROR_TYPES.INVALID_DOMAIN:
        errorResponse.message = "Invalid domain configuration";
        break;
      case ERROR_TYPES.RATE_LIMIT:
        errorResponse.message = "Rate limit exceeded. Please try again later";
        errorResponse.shouldRetry = true;
        break;
      case ERROR_TYPES.NETWORK:
        errorResponse.message = "Network connection error";
        errorResponse.shouldRetry = true;
        break;
      default:
        errorResponse.message = error.message;
    }
  }

  console.error("[ChatService Error]", {
    error: error.message,
    type: error.type,
    details: error.details,
    context,
  });

  return errorResponse;
};

const getContextBasedFallback = (context) => {
  switch (context?.domain) {
    case "restaurant":
      return "I apologize, but I'm having trouble accessing the menu information. Would you like to see our most popular dishes or speak with a staff member?";
    case "clinic":
      return "I apologize for the inconvenience. Would you like me to connect you with our reception desk for immediate assistance?";
    default:
      return "I apologize, but I'm having trouble processing your request. Please try again or contact support for assistance.";
  }
};

export const isValidErrorType = (type) => {
  return Object.values(ERROR_TYPES).includes(type);
};

export const createChatError = (message, type, details = {}) => {
  if (!isValidErrorType(type)) {
    console.warn(`Invalid error type: ${type}, defaulting to validation error`);
    type = ERROR_TYPES.VALIDATION;
  }
  return new ChatServiceError(message, type, details);
};
