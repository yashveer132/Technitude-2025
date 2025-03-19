import { isValid, isFuture, parseISO, parse, format } from "date-fns";

export const validateBookingData = (data, context = "clinic") => {
  const errors = {};

  if (context === "clinic") {
    if (!data.doctor) errors.doctor = "Doctor is required";
    if (!data.date) errors.date = "Date is required";
    if (!data.time) errors.time = "Time is required";

    if (data.doctor && !data.doctor.startsWith("Dr.")) {
      data.doctor = `Dr. ${data.doctor}`;
    }

    if (data.date && data.time) {
      try {
        const dateMatch = data.date.match(
          /([0-9]{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i
        );

        if (dateMatch) {
          const day = dateMatch[1];
          const month = dateMatch[2];
          const dateStr = `${month} ${day}, 2025`;
          const dateTime = new Date(`${dateStr} ${data.time}`);

          if (!isValid(dateTime)) {
            errors.date = "Invalid date/time combination";
          } else if (!isFuture(dateTime)) {
            errors.date = "Appointment time must be in the future";
          } else {
            data.dayOfWeek = format(dateTime, "EEEE").toLowerCase();
            data.formattedDate = format(dateTime, "EEEE, MMMM d, yyyy");
            data.date = dateStr;
          }
        } else {
          errors.date = "Invalid date format";
        }
      } catch (e) {
        errors.date = "Invalid date/time format";
      }
    }
  } else if (context === "hotel") {
    if (!data.checkIn) errors.checkIn = "Check-in date is required";
    if (!data.roomType) errors.roomType = "Room type is required";
  }

  if (data.date && !isValid(parseISO(data.date))) {
    errors.date = "Invalid date format";
  }

  if (data.date && !isFuture(parseISO(data.date))) {
    errors.date = "Date must be in the future";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateOrderData = (data) => {
  const errors = {};

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.items = "Order must contain at least one item";
  }

  if (data.items) {
    data.items.forEach((item, index) => {
      if (!item.id || !item.quantity) {
        errors[`items.${index}`] = "Invalid item data";
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateUserData = (data) => {
  const errors = {};

  if (!data.email) errors.email = "Email is required";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.displayName) errors.displayName = "Name is required";
  if (data.displayName && data.displayName.length < 2) {
    errors.displayName = "Name must be at least 2 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
