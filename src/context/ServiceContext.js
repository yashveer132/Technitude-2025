import React, { createContext, useContext, useEffect, useState } from "react";
import { AccessibilityService } from "../services/accessibilityService";
import { OptimizationService } from "../services/optimizationService";
import { DomainLoader } from "../services/domainLoader";
import { trackError, trackPerformance } from "../utils/analytics";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState({
    accessibility: null,
    optimization: null,
    domainLoader: null,
  });

  useEffect(() => {
    const initializeServices = () => {
      try {
        const accessibility = new AccessibilityService();
        const optimization = new OptimizationService();

        setServices({
          accessibility,
          optimization,
          domainLoader: DomainLoader,
        });

        trackPerformance({
          name: "services_initialization",
          duration: performance.now(),
          domain: "system",
        });
      } catch (error) {
        trackError(error, "service_initialization");
      }
    };

    initializeServices();
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => useContext(ServiceContext);
