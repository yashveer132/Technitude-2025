export const handleFirebaseError = (error) => {
  let message = "An error occurred. Please try again.";

  switch (error.code) {
    case "auth/invalid-email":
      message = "Invalid email address format.";
      break;
    case "auth/user-disabled":
      message = "This account has been disabled.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email.";
      break;
    case "auth/wrong-password":
      message = "Invalid password.";
      break;
    case "auth/email-already-in-use":
      message = "An account already exists with this email.";
      break;
    case "auth/weak-password":
      message = "Password should be at least 6 characters.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your connection.";
      break;
    case "auth/too-many-requests":
      message = "Too many attempts. Please try again later.";
      break;
    case "auth/popup-closed-by-user":
      message = "Sign-in popup was closed before completion.";
      break;
    default:
      message = error.message || "An error occurred. Please try again.";
  }

  return message;
};

export const handleFirestoreError = (error) => {
  let message = "A database error occurred. Please try again.";

  switch (error.code) {
    case "permission-denied":
      message = "You do not have permission to perform this action.";
      break;
    case "unavailable":
      message = "The service is currently unavailable. Please try again later.";
      break;
    case "not-found":
      message = "The requested document was not found.";
      break;
    case "already-exists":
      message = "The document already exists.";
      break;
    default:
      message = error.message || "A database error occurred. Please try again.";
  }

  return message;
};
