import type { AIFoundryConfig } from "./AIFoundryConfigUtils";
import { streamText, type LanguageModel, type CoreMessage } from "ai";
import { type AzureOpenAIProviderSettings, createAzure } from "@ai-sdk/azure";

// Token cache interface
interface TokenCache {
  token: string;
  expiresAt: number;
  config: AIFoundryConfig;
}

// Global token cache
let tokenCache: TokenCache | null = null;

// Helper function to check if token is expired (with 5 minute buffer)
function isTokenExpired(cache: TokenCache): boolean {
  const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() >= (cache.expiresAt - bufferMs);
}

// Helper function to check if config has changed
function hasConfigChanged(cache: TokenCache, config: AIFoundryConfig): boolean {
  return (
    cache.config.clientId !== config.clientId ||
    cache.config.tenantId !== config.tenantId ||
    cache.config.resourceName !== config.resourceName ||
    cache.config.redirectUri !== config.redirectUri
  );
}

/**
 * Clears the cached access token. Useful for logout scenarios or when forcing a fresh token.
 */
export function clearTokenCache(): void {
  tokenCache = null;
}

/**
 * Azure MSAL authentication with caching.
 * Automatically caches tokens and refreshes them when expired or config changes.
 * Uses a 5-minute buffer before expiration to ensure tokens don't expire during requests.
 * 
 * @param config - Azure AI Foundry configuration
 * @returns Promise<string> - Access token
 */

// Azure MSAL authentication with caching
export async function getAccessToken(config: AIFoundryConfig): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && !isTokenExpired(tokenCache) && !hasConfigChanged(tokenCache, config)) {
    return tokenCache.token;
  }

  const { PublicClientApplication } = await import("@azure/msal-browser");

  const rootUrl = `${window.location.protocol}//${window.location.host}`;
  const redirectUri = config.redirectUri || rootUrl;

  // Debug logging to verify redirectUri is being used
  console.log('AzureProvider: Using redirectUri:', redirectUri);
  console.log('AzureProvider: Config redirectUri:', config.redirectUri);
  console.log('AzureProvider: Fallback rootUrl:', rootUrl);

  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: redirectUri,
    },
  };

  const scopes = ["https://cognitiveservices.azure.com/.default"];
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  let tokenResult;
  try {
    tokenResult = await msalInstance.acquireTokenSilent({ scopes });
  } catch {
    tokenResult = await msalInstance.loginPopup({ scopes });
  }

  // Cache the token with expiration time
  tokenCache = {
    token: tokenResult.accessToken,
    expiresAt: tokenResult.expiresOn?.getTime() || (Date.now() + 60 * 60 * 1000), // fallback to 1 hour
    config: { ...config }
  };

  return tokenResult.accessToken;
}

// Create Azure AI Foundry language model that works with Vercel AI SDK
export async function createAzureAIFoundryLanguageModel(config: AIFoundryConfig): Promise<LanguageModel> {
  const aiFoundryAccessToken = await getAccessToken(config);

  const azureOpenAIProviderSettings: AzureOpenAIProviderSettings = {
    baseURL: "https://" + config.resourceName + ".openai.azure.com/openai/deployments",
    resourceName: config.resourceName,
    apiKey: "_", // needed, otherwise exception
    headers: {
      Authorization: `Bearer ${aiFoundryAccessToken}`,
    },
  };

  const azure = createAzure(azureOpenAIProviderSettings);
  const openAiChatLanguageModel = azure(config.deploymentName) as LanguageModel;
  return openAiChatLanguageModel;
}

export async function chat(
  languageModel: LanguageModel,
  system: string,
  messages: CoreMessage[],
  sendStreamingUpdate: (text: string) => void,
  sendFinalUpdate: (text: string) => void
): Promise<void> {
  try {
    const response = streamText({
      model: languageModel,
      system: system,
      messages: messages,
      onFinish: async (event) => {
        const onFinishResult = event;
        console.log("Vercel AI SDK stream finished:", onFinishResult);
      },
      onError: (error) => {
        console.log("Error in Vercel AI SDK stream:", error);
      },
    });

    let accumulatedText = "";
    for await (const chunk of response.textStream) {
      // Accumulate text tokens
      accumulatedText += chunk;
      sendStreamingUpdate(accumulatedText);
    }

    sendFinalUpdate(accumulatedText);
  } catch (error) {
    console.log("Error in chat:", error);
    throw error;
  }
}
