export const validateDomainStructure = (domain) => {
  const requiredFields = ["name", "features", "queryTypes"];
  const errors = [];

  requiredFields.forEach((field) => {
    if (!domain[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (!domain.features || typeof domain.features !== "object") {
    errors.push("Features must be an object with boolean values");
  }

  if (
    !domain.queryTypes ||
    !Array.isArray(Object.values(domain.queryTypes)[0])
  ) {
    errors.push("QueryTypes must contain arrays of supported query types");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDomainData = (data, domainType) => {
  const commonFields = ["name", "address", "phone"];
  const errors = [];

  commonFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  switch (domainType) {
    case "restaurant":
      if (!data.menu || !Array.isArray(data.menu)) {
        errors.push("Restaurant domain must have a menu array");
      }
      break;

    case "clinic":
      if (!data.doctors || !Array.isArray(data.doctors)) {
        errors.push("Clinic domain must have a doctors array");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
