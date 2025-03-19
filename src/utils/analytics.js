export const trackError = (error, context) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    type: error.name,
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
  };

  console.error("Error tracked:", errorData);
  // TODO: Implement actual error tracking service integration
};

export const trackPerformance = (metric) => {
  const performanceData = {
    timestamp: new Date().toISOString(),
    name: metric.name,
    duration: metric.duration,
    domain: metric.domain,
  };

  console.log("Performance tracked:", performanceData);
  // TODO: Implement actual performance monitoring service integration
};

export const trackUserInteraction = (interaction) => {
  const interactionData = {
    timestamp: new Date().toISOString(),
    type: interaction.type,
    domain: interaction.domain,
    success: interaction.success,
    duration: interaction.duration,
  };

  console.log("User interaction tracked:", interactionData);
  // TODO: Implement actual analytics service integration
};
