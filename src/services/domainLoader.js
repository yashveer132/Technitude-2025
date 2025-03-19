import {
  validateDomainStructure,
  validateDomainData,
} from "../utils/domainValidator";

export class DomainLoader {
  static async loadDomain(domainType) {
    try {
      const domainConfig = await import(`../data/${domainType}Data.js`);
      const validation = validateDomainStructure(domainConfig);

      if (!validation.isValid) {
        throw new Error(
          `Invalid domain structure: ${validation.errors.join(", ")}`
        );
      }

      const dataValidation = validateDomainData(domainConfig.data, domainType);
      if (!dataValidation.isValid) {
        throw new Error(
          `Invalid domain data: ${dataValidation.errors.join(", ")}`
        );
      }

      return {
        config: domainConfig,
        loaded: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to load domain ${domainType}:`, error);
      throw error;
    }
  }

  static async preloadDomains(domains) {
    const preloadedDomains = await Promise.all(
      domains.map((domain) => this.loadDomain(domain))
    );
    return preloadedDomains.reduce((acc, domain, index) => {
      acc[domains[index]] = domain;
      return acc;
    }, {});
  }
}
