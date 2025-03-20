import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { validateDateTime, formatDateTime } from "../utils/dateTimeUtils";
import { validateBookingData } from "../utils/validation";
import { isValid } from "date-fns";
import { format } from "date-fns";

export const createBooking = async (bookingData) => {
  if (bookingData.date && !bookingData.date.includes("2025")) {
    bookingData.date = `${bookingData.date}, 2025`;
  }

  if (bookingData.doctor && !bookingData.doctor.startsWith("Dr.")) {
    bookingData.doctor = `Dr. ${bookingData.doctor}`;
  }

  if (bookingData.type === "clinic" && bookingData.date && bookingData.time) {
    try {
      const appointmentDate = new Date(
        `${bookingData.date} ${bookingData.time}`
      );
      if (isValid(appointmentDate)) {
        bookingData.appointmentDateTime = appointmentDate.toISOString();
        bookingData.dayOfWeek = format(appointmentDate, "EEEE").toLowerCase();
        bookingData.formattedDate = format(
          appointmentDate,
          "EEEE, MMMM d, yyyy"
        );
      }
    } catch (error) {
      throw new Error("Invalid appointment date/time");
    }
  }

  const validation = validateBookingData(
    bookingData,
    bookingData.type || "clinic"
  );
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(", "));
  }

  try {
    const formattedData = {
      ...bookingData,
      createdAt: new Date().toISOString(),
      date: bookingData.date
        ? new Date(bookingData.date).toISOString()
        : undefined,
      checkIn: bookingData.checkIn
        ? new Date(bookingData.checkIn).toISOString()
        : undefined,
      checkOut: bookingData.checkOut
        ? new Date(bookingData.checkOut).toISOString()
        : undefined,
      status: "confirmed",
      type: bookingData.type || "clinic",
    };

    const bookingRef = await addDoc(collection(db, "bookings"), formattedData);

    return {
      id: bookingRef.id,
      ...formattedData,
    };
  } catch (error) {
    if (!navigator.onLine) {
      return {
        id: `offline_${Date.now()}`,
        ...bookingData,
        status: "pending_sync",
      };
    }
    console.error("Booking creation failed:", error);
    throw error;
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (bookingSnap.exists()) {
      const bookingData = bookingSnap.data();
      const appointmentDate = new Date(
        bookingData.appointmentDateTime || bookingData.date
      );

      return {
        id: bookingSnap.id,
        ...bookingData,
        dayOfWeek: format(appointmentDate, "EEEE").toLowerCase(),
        formattedDate: format(appointmentDate, "EEEE, MMMM d, yyyy"),
      };
    }
    throw new Error("Booking not found");
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
};

export const checkConflictingBookings = async (doctorId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "bookings"),
    where("doctorId", "==", doctorId),
    where("date", ">=", start),
    where("date", "<=", end)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getUserBookingHistory = async (userId) => {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    where("status", "==", "confirmed")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
