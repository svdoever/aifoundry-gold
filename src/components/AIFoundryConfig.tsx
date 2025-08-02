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
  
  const [redirectUri, setRedirectUri] = useState('');
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load configuration from URL params and local storage
  const loadConfig = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storageValues = {
      clientId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'clientId') || '',
      tenantId: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'tenantId') || '',
      resourceName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'resourceName') || '',
      deploymentName: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'deploymentName') || '',
      redirectUri: localStorage.getItem(LOCAL_STORAGE_PREFIX + 'redirectUri') || ''
    };

    const currentPageUrl = window.location.href.split('?')[0]; // Remove query parameters

    // Priority: URL params > Local Storage > Defaults
    const newConfig: AIFoundryConfig = {
      clientId: urlParams.get('clientId') || storageValues.clientId,
      tenantId: urlParams.get('tenantId') || storageValues.tenantId,
      resourceName: urlParams.get('resourceName') || storageValues.resourceName,
      deploymentName: urlParams.get('deploymentName') || storageValues.deploymentName
    };

    const newRedirectUri = urlParams.get('redirectUri') || storageValues.redirectUri || currentPageUrl;

    setConfig(newConfig);
    setRedirectUri(newRedirectUri);
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
    if (!config.clientId || !config.tenantId || !config.resourceName || !config.deploymentName || !redirectUri) {
      setMessage({ text: 'Please fill in all configuration fields before saving.', type: 'error' });
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'clientId', config.clientId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tenantId', config.tenantId);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'resourceName', config.resourceName);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'deploymentName', config.deploymentName);
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'redirectUri', redirectUri);

    setMessage({ text: 'Configuration saved to local storage!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const clearStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'clientId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'tenantId');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'resourceName');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'deploymentName');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'redirectUri');

    setMessage({ text: 'Configuration cleared from local storage!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const copyRedirectUri = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setMessage({ text: 'Redirect URI copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = redirectUri;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setMessage({ text: 'Redirect URI copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const getAzurePortalUrl = () => {
    if (!config.clientId.trim()) {
      return '#';
    }
    return `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/${config.clientId}`;
  };

  const isConfigValid = config.clientId && config.tenantId && config.resourceName && config.deploymentName && redirectUri;

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
      
      <div className={styles.configRow}>
        <label htmlFor="redirectUri">Redirect URI:</label>
        <div className={styles.inputWithCopy}>
          <input
            type="text"
            id="redirectUri"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder={showExampleValues ? "e.g., https://yoursite.com/aifoundry.html" : ""}
          />
          <button 
            type="button" 
            className={styles.copyButton} 
            onClick={copyRedirectUri}
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      <div className={styles.configNote}>
        ⚠️ <strong>Important:</strong> This redirect URI must be registered as a <strong>Single-page application</strong> redirect URI in your Azure App Registration.
        <br />
        <a 
          href={getAzurePortalUrl()} 
          className={styles.azurePortalLink}
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            pointerEvents: config.clientId.trim() ? 'auto' : 'none',
            opacity: config.clientId.trim() ? 1 : 0.5
          }}
        >
          🔗 {config.clientId.trim() ? 'Open Azure Portal App Registration' : 'Enter Client ID to enable Azure Portal link'}
        </a>
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
