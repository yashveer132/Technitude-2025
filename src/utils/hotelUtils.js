export const calculateStayDuration = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

export const calculateTotalRate = (room, nights, specialOffers = []) => {
  let total = room.rate * nights;

  for (const offer of specialOffers) {
    if (offer.name === "Weekend Getaway" && nights >= 2) {
      total *= 0.8;
      break;
    }
  }

  return total;
};

export const checkRoomAvailability = (
  room,
  checkIn,
  checkOut,
  existingBookings
) => {
  const requestedStart = new Date(checkIn);
  const requestedEnd = new Date(checkOut);

  if (!room.availability) return false;

  return !existingBookings.some((booking) => {
    const bookedStart = new Date(booking.checkIn);
    const bookedEnd = new Date(booking.checkOut);

    return requestedStart < bookedEnd && requestedEnd > bookedStart;
  });
};

export const getSuggestedRooms = (criteria) => {
  const { guests, preferences = [], minRate, maxRate } = criteria;

  return rooms.filter((room) => {
    if (room.maxOccupancy < guests) return false;

    if (minRate && room.rate < minRate) return false;
    if (maxRate && room.rate > maxRate) return false;

    if (preferences.length > 0) {
      return preferences.every(
        (pref) => room.amenities.includes(pref) || room.features.includes(pref)
      );
    }

    return true;
  });
};

export const formatBookingConfirmation = (booking) => {
  const nights = calculateStayDuration(booking.checkIn, booking.checkOut);
  const total = calculateTotalRate(booking.room, nights, booking.specialOffers);

  return {
    confirmationNumber: booking.id,
    checkIn: new Date(booking.checkIn).toLocaleDateString(),
    checkOut: new Date(booking.checkOut).toLocaleDateString(),
    roomType: booking.room.type,
    guests: booking.guests,
    nights: nights,
    rate: booking.room.rate,
    total: total,
    specialRequests: booking.specialRequests || [],
    includes: [
      "Complimentary breakfast",
      "Free WiFi",
      "Access to fitness center",
      ...booking.room.features,
    ],
  };
};
