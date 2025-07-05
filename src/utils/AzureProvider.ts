import type { AIFoundryConfig } from "./AIFoundryConfigUtils";
import { streamText, type LanguageModel, type CoreMessage } from "ai";
import { type AzureOpenAIProviderSettings, createAzure } from "@ai-sdk/azure";

// Azure MSAL authentication
export async function getAccessToken(config: AIFoundryConfig): Promise<string> {
  const { PublicClientApplication } = await import("@azure/msal-browser");

  const rootUrl = `${window.location.protocol}//${window.location.host}`;

  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: rootUrl,
    },
  };

  const scopes = ["https://cognitiveservices.azure.com/.default"];
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  try {
    const silent = await msalInstance.acquireTokenSilent({ scopes });
    return silent.accessToken;
  } catch {
    const interactive = await msalInstance.loginPopup({ scopes });
    return interactive.accessToken;
  }
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
        const onFinishResult = event as any;
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
