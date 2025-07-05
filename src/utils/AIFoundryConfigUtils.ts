export interface AIFoundryConfig {
  clientId: string;
  tenantId: string;
  resourceName: string;
  deploymentName: string;
}

const LOCAL_STORAGE_PREFIX = 'aifoundry:';

// Utility functions for external use
export const AIFoundryConfigUtils = {
  getConfig(): AIFoundryConfig {
    const urlParams = new URLSearchParams(window.location.search);
    const storageValues = {
      clientId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'clientId') || '',
      tenantId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'tenantId') || '',
      resourceName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'resourceName') || '',
      deploymentName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'deploymentName') || ''
    };

    return {
      clientId: urlParams.get('clientId') || storageValues.clientId,
      tenantId: urlParams.get('tenantId') || storageValues.tenantId,
      resourceName: urlParams.get('resourceName') || storageValues.resourceName,
      deploymentName: urlParams.get('deploymentName') || storageValues.deploymentName
    };
  },

  isConfigValid(config: AIFoundryConfig): boolean {
    return !!(config.clientId && config.tenantId && config.resourceName && config.deploymentName);
  },

  saveConfig(config: AIFoundryConfig): void {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'clientId', config.clientId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tenantId', config.tenantId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'resourceName', config.resourceName);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'deploymentName', config.deploymentName);
  },

  clearConfig(): void {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'clientId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'tenantId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'resourceName');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'deploymentName');
  },

  getStoragePrefix(): string {
    return LOCAL_STORAGE_PREFIX;
  }
};
