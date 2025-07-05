import { useState, useEffect, useCallback } from 'react';
import styles from './AIFoundryConfig.module.css';
import type { AIFoundryConfig } from '../utils/AIFoundryConfigUtils';

const LOCAL_STORAGE_PREFIX = 'aifoundry:';

interface AIFoundryConfigComponentProps {
  onConfigChange?: (config: AIFoundryConfig) => void;
  showExampleValues?: boolean;
}

export function AIFoundryConfigComponent({ 
  onConfigChange, 
  showExampleValues = true 
}: AIFoundryConfigComponentProps) {
  const [config, setConfig] = useState<AIFoundryConfig>({
    clientId: '',
    tenantId: '',
    resourceName: '',
    deploymentName: ''
  });
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load configuration from URL params and local storage
  const loadConfig = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storageValues = {
      clientId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'clientId') || '',
      tenantId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'tenantId') || '',
      resourceName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'resourceName') || '',
      deploymentName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'deploymentName') || ''
    };

    // Priority: URL params > Local Storage > Defaults
    const newConfig: AIFoundryConfig = {
      clientId: urlParams.get('clientId') || storageValues.clientId,
      tenantId: urlParams.get('tenantId') || storageValues.tenantId,
      resourceName: urlParams.get('resourceName') || storageValues.resourceName,
      deploymentName: urlParams.get('deploymentName') || storageValues.deploymentName
    };

    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [onConfigChange]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleInputChange = (field: keyof AIFoundryConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    setMessage(null); // Clear any previous messages
  };

  const saveToStorage = () => {
    if (!config.clientId || !config.tenantId || !config.resourceName || !config.deploymentName) {
      setMessage({ text: 'Please fill in all configuration fields before saving.', type: 'error' });
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'clientId', config.clientId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tenantId', config.tenantId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'resourceName', config.resourceName);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'deploymentName', config.deploymentName);

    setMessage({ text: 'Configuration saved to local storage!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const clearStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'clientId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'tenantId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'resourceName');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'deploymentName');

    setMessage({ text: 'Configuration cleared from local storage!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const isConfigValid = config.clientId && config.tenantId && config.resourceName && config.deploymentName;

  return (
    <div className={styles.configSection}>
      <h3>Configuration</h3>
      
      <div className={styles.configRow}>
        <label htmlFor="clientId">Client ID:</label>
        <input
          type="text"
          id="clientId"
          value={config.clientId}
          onChange={(e) => handleInputChange('clientId', e.target.value)}
          placeholder={showExampleValues ? "e.g., 12345678-1234-1234-1234-123456789012" : ""}
        />
      </div>
      
      <div className={styles.configRow}>
        <label htmlFor="tenantId">Tenant ID:</label>
        <input
          type="text"
          id="tenantId"
          value={config.tenantId}
          onChange={(e) => handleInputChange('tenantId', e.target.value)}
          placeholder={showExampleValues ? "e.g., 87654321-4321-4321-4321-210987654321" : ""}
        />
      </div>
      
      <div className={styles.configRow}>
        <label htmlFor="resourceName">Resource Name:</label>
        <input
          type="text"
          id="resourceName"
          value={config.resourceName}
          onChange={(e) => handleInputChange('resourceName', e.target.value)}
          placeholder={showExampleValues ? "e.g., my-ai-foundry-resource" : ""}
        />
      </div>
      
      <div className={styles.configRow}>
        <label htmlFor="deploymentName">Deployment Name:</label>
        <input
          type="text"
          id="deploymentName"
          value={config.deploymentName}
          onChange={(e) => handleInputChange('deploymentName', e.target.value)}
          placeholder={showExampleValues ? "e.g., gpt-4o, gpt-35-turbo" : ""}
        />
      </div>
      
      <div className={styles.buttonRow}>
        <button 
          className={styles.button}
          onClick={saveToStorage}
          disabled={!isConfigValid}
        >
          Save to Local Storage
        </button>
        <button 
          className={`${styles.button} ${styles.secondary}`}
          onClick={clearStorage}
        >
          Clear Local Storage
        </button>
      </div>
      
      {message && (
        <div className={message.type === 'error' ? styles.validationError : styles.successMessage}>
          {message.text}
        </div>
      )}
    </div>
  );
}
