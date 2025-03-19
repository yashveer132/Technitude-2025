import React from "react";

const ExtensibilityBanner = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-semibold text-blue-800">
        Domain Adaptable System
      </h3>
      <p className="text-sm text-blue-600">
        This GenAI Assistant demonstrates multi-domain capabilities:
        <span className="block mt-2">
          • Restaurant Menu & Ordering • Clinic Appointments • Hotel Bookings •
          Easily extendable to more domains
        </span>
      </p>
    </div>
  );
};

export default ExtensibilityBanner;
