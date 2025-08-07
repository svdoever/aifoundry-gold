import type { AIFoundryConfig } from "./AIFoundryConfigUtils";
import { streamText, type LanguageModel, type ModelMessage, type ToolSet } from "ai";
import { type AzureOpenAIProviderSettings, createAzure, azure } from "@ai-sdk/azure";
import { getTokenWithAzureIdentity } from "./getTokenWithAzureIdentity";
import { openai } from "@ai-sdk/openai";

// Create Azure AI Foundry language model that works with Vercel AI SDK
export async function createAzureAIFoundryResponsesAPILanguageModel(config: AIFoundryConfig): Promise<LanguageModel> {
  const redirectUri = config.redirectUri || window.location.href.split('?')[0]; // Fallback to current page URL if not set
  if (!redirectUri) {
    throw new Error("Redirect URI is required for Azure authentication.");
  }
  const aiFoundryAccessToken = await getTokenWithAzureIdentity(config.clientId, config.tenantId, redirectUri);

  const azureOpenAIProviderSettings: AzureOpenAIProviderSettings = {
    resourceName: config.resourceName,
    apiVersion: "preview",
    apiKey: "_", // needed, otherwise exception
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiFoundryAccessToken}`,
    },
  };

  const azure = createAzure(azureOpenAIProviderSettings);
  const openAiChatLanguageModel = azure.responses(config.deploymentName) as LanguageModel;
  return openAiChatLanguageModel;
}

const tools: ToolSet = {
  web_search_preview: openai.tools.webSearchPreview({
  }),
};


export async function chatResponses(
  languageModel: LanguageModel,
  system: string,
  messages: ModelMessage[],
  sendStreamingUpdate: (text: string) => void,
  sendFinalUpdate: (text: string) => void
): Promise<void> {
  try {
    const response = streamText({
      model: languageModel,
      system: system,
      messages: messages,
      tools: tools,
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
