import {
  format,
  addDays,
  parse,
  isValid,
  isBefore,
  isAfter,
  setMinutes,
  setHours,
} from "date-fns";

export const validateDateTime = (dateStr, timeStr) => {
  let parsedDate;
  try {
    parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) {
      parsedDate = parse(dateStr, "MM/dd/yyyy", new Date());
    }
  } catch (error) {
    return { isValid: false, message: "Invalid date format" };
  }

  if (!isValid(parsedDate) || isBefore(parsedDate, new Date())) {
    return { isValid: false, message: "Please provide a valid future date" };
  }

  if (timeStr) {
    const timePattern = /^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i;
    const match = timeStr.match(timePattern);
    if (!match) {
      return { isValid: false, message: "Please provide time in HH:MM format" };
    }

    let [_, hours, minutes = "00", meridian] = match;
    hours = parseInt(hours);
    if (meridian) {
      if (meridian.toLowerCase() === "pm" && hours < 12) hours += 12;
      if (meridian.toLowerCase() === "am" && hours === 12) hours = 0;
    }

    if (
      hours < 0 ||
      hours > 23 ||
      parseInt(minutes) < 0 ||
      parseInt(minutes) > 59
    ) {
      return { isValid: false, message: "Invalid time format" };
    }
  }

  return { isValid: true, date: parsedDate };
};

export const formatDateTime = (date, includeTime = true) => {
  return format(date, includeTime ? "MMMM d, yyyy h:mm a" : "MMMM d, yyyy");
};

export const isWithinWorkingHours = (date, workingHours) => {
  const day = format(date, "EEEE").toLowerCase();
  const timeSlots = workingHours[day] || [];

  return timeSlots.some((slot) => {
    const [start, end] = slot.split(" - ").map((time) => {
      const [hours, minutes, meridian] = time
        .match(/(\d+):(\d+)\s*(AM|PM)/)
        .slice(1);
      let hour = parseInt(hours);
      if (meridian === "PM" && hour < 12) hour += 12;
      if (meridian === "AM" && hour === 12) hour = 0;
      return setMinutes(setHours(date, hour), parseInt(minutes));
    });
    return isAfter(date, start) && isBefore(date, end);
  });
};

export const parseFutureDate = (dateStr) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayMatch = days.find((day) => dateStr.toLowerCase().includes(day));

  if (dayMatch) {
    const today = new Date();
    const targetDay = days.indexOf(dayMatch);
    const currentDay = today.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    return addDays(today, daysToAdd);
  }
};
