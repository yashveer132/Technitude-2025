export const createDomainConfig = (domainType, domainData) => {
  const baseConfig = {
    displayName: domainData.name || "GenAI Assistant",
    context: domainType,
    data: domainData,
    promptEnhancers: [
      {
        trigger: ["help", "assist", "support"],
        response:
          "I'm here to help! Please ask any questions about our services.",
      },
    ],
  };

  switch (domainType) {
    case "restaurant":
      return {
        ...baseConfig,
        tabsConfig: [
          {
            label: "Menu",
            dataKey: "menu",
            itemProperties: {
              title: "name",
              description: "description",
              price: "price",
            },
          },
          {
            label: "Combos",
            dataKey: "combos",
            itemProperties: {
              title: "name",
              description: "description",
              price: "price",
            },
          },
          {
            label: "Info",
            dataKeys: ["orderInformation"],
          },
        ],
        promptEnhancers: [
          ...baseConfig.promptEnhancers,
          {
            trigger: ["vegetarian", "vegan"],
            response: (data) => {
              const items = data.menu.filter((item) => item.isVegetarian);
              return `We offer ${items.length} vegetarian options.`;
            },
          },
          {
            trigger: ["gluten-free", "gluten free", "allergies"],
            response: (data) => {
              const items = data.menu.filter((item) => item.isGlutenFree);
              return `We offer ${items.length} gluten-free options.`;
            },
          },
        ],
      };

    case "clinic":
      return {
        ...baseConfig,
        tabsConfig: [
          {
            label: "Doctors",
            dataKey: "doctors",
            itemProperties: {
              title: "name",
              description: "specialty",
              price: "consultationFee",
            },
          },
          {
            label: "Services",
            dataKey: "services",
            itemProperties: {
              title: "name",
              description: "description",
              price: "fee",
            },
          },
          {
            label: "Policies",
            dataKeys: ["appointmentPolicy", "insuranceAccepted"],
          },
        ],
        promptEnhancers: [
          ...baseConfig.promptEnhancers,
          {
            trigger: ["appointment", "book", "schedule"],
            response:
              "To book an appointment, please provide your preferred date, time and doctor.",
          },
          {
            trigger: ["insurance", "coverage", "plan"],
            response: (data) => {
              return `We accept the following insurance plans: ${data.insuranceAccepted.join(
                ", "
              )}`;
            },
          },
        ],
      };

    case "hotel":
      return {
        ...baseConfig,
        tabsConfig: [
          {
            label: "Rooms",
            dataKey: "rooms",
            itemProperties: {
              title: "type",
              description: "amenities",
              price: "rate",
            },
          },
          {
            label: "Services",
            dataKey: "services",
            itemProperties: {
              title: "name",
              description: "description",
              price: "cost",
            },
          },
          {
            label: "Policies",
            dataKeys: ["checkInPolicy", "cancellationPolicy"],
          },
        ],
        promptEnhancers: [
          ...baseConfig.promptEnhancers,
          {
            trigger: ["reservation", "book", "stay"],
            response:
              "To book a room, please provide your check-in and check-out dates, and the number of guests.",
          },
          {
            trigger: ["features", "amenities"],
            response: (data) => {
              const amenities = data.rooms.reduce(
                (acc, room) => [...acc, ...room.amenities],
                []
              );
              return `Our hotel offers various amenities including: ${[
                ...new Set(amenities),
              ].join(", ")}`;
            },
          },
          {
            trigger: ["domain", "adapt", "extension"],
            response:
              "This hotel booking system demonstrates our platform's extensibility beyond restaurant and clinic domains. The same core architecture adapts seamlessly to handle hotel-specific features.",
          },
        ],
      };

    default:
      return baseConfig;
  }
};

export const renderDynamicTabs = (domainConfig) => {
  if (!domainConfig || !domainConfig.tabsConfig) return [];

  return domainConfig.tabsConfig.map((tab) => ({
    label: tab.label,
    content: tab.dataKey
      ? domainConfig.data[tab.dataKey]
      : tab.dataKeys
      ? tab.dataKeys.reduce(
          (obj, key) => ({
            ...obj,
            [key]: domainConfig.data[key],
          }),
          {}
        )
      : null,
  }));
};

export const extractDomainContext = (domainConfig, userInput) => {
  const context = {
    domainType: domainConfig.context,
    relevantData: {},
  };

  if (domainConfig.promptEnhancers) {
    for (const enhancer of domainConfig.promptEnhancers) {
      const hasTrigger = enhancer.trigger.some((t) =>
        userInput.toLowerCase().includes(t.toLowerCase())
      );

      if (hasTrigger) {
        if (typeof enhancer.response === "function") {
          context.relevantData.enhancedResponse = enhancer.response(
            domainConfig.data
          );
        } else {
          context.relevantData.enhancedResponse = enhancer.response;
        }
        break;
      }
    }
  }

  return context;
};

export const getRecommendations = (data, preferences) => {
  const { menu, combos } = data;
  const recommendations = [];

  if (preferences.dietary) {
    const filteredItems = menu.filter((item) => {
      if (preferences.dietary === "vegetarian") return item.isVegetarian;
      if (preferences.dietary === "gluten-free") return item.isGlutenFree;
      return false;
    });
    recommendations.push(...filteredItems);
  }

  if (preferences.cuisine) {
    const matchingCombos = combos.filter((combo) =>
      combo.description
        .toLowerCase()
        .includes(preferences.cuisine.toLowerCase())
    );
    recommendations.push(...matchingCombos);
  }

  return recommendations;
};
