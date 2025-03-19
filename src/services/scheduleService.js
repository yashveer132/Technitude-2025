import { format, parse, addMinutes, isSameDay } from "date-fns";
import { isWithinWorkingHours, validateDateTime } from "../utils/dateTimeUtils";

const SLOT_DURATION = 30;

export const getAvailableSlots = (doctor, date, bookedSlots = []) => {
  const { schedule } = doctor;
  const dayName = format(new Date(date), "EEEE").toLowerCase();
  const workingHours = schedule[dayName] || [];

  if (workingHours.length === 0) {
    return { available: false, message: "Doctor not available on this day" };
  }

  const availableSlots = [];
  workingHours.forEach((period) => {
    const [startTime, endTime] = period.split(" - ");
    let currentSlot = parse(startTime, "h:mm a", date);
    const periodEnd = parse(endTime, "h:mm a", date);

    while (currentSlot < periodEnd) {
      if (!isSlotBooked(currentSlot, bookedSlots)) {
        availableSlots.push(format(currentSlot, "h:mm a"));
      }
      currentSlot = addMinutes(currentSlot, SLOT_DURATION);
    }
  });

  return {
    available: availableSlots.length > 0,
    slots: availableSlots,
    message:
      availableSlots.length > 0
        ? `Available slots: ${availableSlots.join(", ")}`
        : "No available slots for this day",
  };
};

const isSlotBooked = (slot, bookedSlots) => {
  return bookedSlots.some(
    (bookedSlot) =>
      isSameDay(slot, bookedSlot.date) &&
      format(slot, "HH:mm") === format(bookedSlot.date, "HH:mm")
  );
};

export const checkDoctorAvailability = (doctor, date, bookingRules) => {
  if (!isWithinWorkingHours(date, doctor.schedule)) {
    return { available: false, message: "Outside of working hours" };
  }

  const now = new Date();
  const hoursDifference = (date - now) / (1000 * 60 * 60);

  if (hoursDifference < bookingRules.minAdvanceHours) {
    return {
      available: false,
      message: `Appointments must be booked at least ${bookingRules.minAdvanceHours} hours in advance`,
    };
  }

  if (hoursDifference > bookingRules.maxAdvanceDays * 24) {
    return {
      available: false,
      message: `Appointments cannot be booked more than ${bookingRules.maxAdvanceDays} days in advance`,
    };
  }

  return { available: true };
};

export const validateBookingRequest = (
  doctor,
  dateStr,
  timeStr,
  patientHistory = []
) => {
  const dateValidation = validateDateTime(dateStr, timeStr);
  if (!dateValidation.isValid) {
    return { isValid: false, message: dateValidation.message };
  }

  const availabilityCheck = checkDoctorAvailability(
    doctor,
    dateValidation.date,
    {
      minAdvanceHours: 24,
      maxAdvanceDays: 30,
    }
  );

  if (!availabilityCheck.available) {
    return { isValid: false, message: availabilityCheck.message };
  }

  const { available, slots, message } = getAvailableSlots(
    doctor,
    dateValidation.date,
    patientHistory
  );

  if (!available) {
    return { isValid: false, message };
  }

  return { isValid: true, slots };
};
