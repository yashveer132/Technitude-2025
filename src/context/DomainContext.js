import React, { createContext, useContext, useState } from "react";
import { createDomainConfig } from "../utils/domainAdapter";
import { restaurantData } from "../data/restaurantData";
import { clinicData } from "../data/clinicData";
import { hotelData } from "../data/hotelData";

const DomainContext = createContext();

const availableDomains = {
  restaurant: createDomainConfig("restaurant", restaurantData),
  clinic: createDomainConfig("clinic", clinicData),
  hotel: createDomainConfig("hotel", hotelData),
};

export const DomainProvider = ({ children }) => {
  const [activeDomain, setActiveDomain] = useState("restaurant");

  const currentDomainConfig =
    availableDomains[activeDomain] || availableDomains.restaurant;

  const switchDomain = (domainKey) => {
    if (availableDomains[domainKey]) {
      setActiveDomain(domainKey);
      return true;
    }
    return false;
  };

  const registerDomain = (key, data) => {
    if (!availableDomains[key]) {
      availableDomains[key] = createDomainConfig(key, data);
      return true;
    }
    return false;
  };

  return (
    <DomainContext.Provider
      value={{
        availableDomains,
        currentDomain: activeDomain,
        domainConfig: currentDomainConfig,
        switchDomain,
        registerDomain,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
};

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error("useDomain must be used within a DomainProvider");
  }
  return context;
};
