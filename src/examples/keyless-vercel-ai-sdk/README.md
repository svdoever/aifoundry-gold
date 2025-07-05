# Keyless Azure AI Foundry Streaming Example

This example demonstrates how to use Azure AI Foundry with keyless authentication and streaming support. It provides a modern React application with real-time chat capabilities using the same Azure AI Foundry endpoint as the HTML example.

## Features

- **Keyless Authentication**: Uses Azure MSAL for browser-based authentication without API keys
- **Azure AI Foundry Integration**: Uses the correct `.services.ai.azure.com/models` endpoint
- **Streaming Support**: Real-time streaming of AI responses for better user experience
- **Reusable Configuration**: Generic configuration component that can be used across multiple examples
- **TypeScript & CSS Modules**: Modern development stack with type safety and scoped styles
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Configuration

The application uses the same local storage keys as the original HTML example (`aifoundry-keyless.html`) for consistency:

- `aifoundry:clientId` - Azure App Registration Client ID
- `aifoundry:tenantId` - Azure Tenant ID
- `aifoundry:resourceName` - Azure AI Foundry resource name
- `aifoundry:deploymentName` - Model deployment name (e.g., gpt-4o, gpt-4.1)

## Architecture

### Components

- **AIFoundryConfigComponent**: Reusable configuration UI component
- **AIFoundryConfigUtils**: Utility functions for configuration management
- **AzureProvider**: Custom Azure AI Foundry provider that implements streaming chat completions
- **KeylessVercelAISDK**: Main example component

### Tech Stack

- React 19
- TypeScript
- CSS Modules
- Vite 7
- Azure MSAL Browser

## Azure AI Foundry Integration

The example uses the same Azure AI Foundry endpoint as the original HTML example:

```typescript
const endpoint = `https://${config.resourceName}.services.ai.azure.com/models`;

const response = await fetch(
  `${endpoint}/chat/completions?api-version=2024-05-01-preview`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.deploymentName,
      messages,
      stream: true
    })
  }
);
```

## Streaming Implementation

The streaming is handled by parsing Server-Sent Events:

```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) {
        yield content; // Stream content to UI
      }
    }
  }
}
```

## Usage

1. Configure your Azure AI Foundry credentials in the configuration section
2. Optionally modify the system message to customize the AI assistant behavior
3. Start chatting with the AI assistant
4. Experience real-time streaming responses

## Authentication Flow

1. Configuration is loaded from URL parameters or local storage
2. When sending a message, MSAL attempts silent token acquisition
3. If silent acquisition fails, a popup window opens for interactive login
4. The acquired token is used as a Bearer token in the Authorization header
5. Streaming responses are processed and displayed in real-time

## Development

The example is built as a separate Vite entry point (`keyless-vercel-ai-sdk.html`) and can be accessed directly during development at:

```
http://localhost:5173/keyless-vercel-ai-sdk.html
```

## Benefits over Plain HTML

- **Type Safety**: Full TypeScript support for better development experience
- **Component Reusability**: Configuration component can be reused in other examples
- **Modern Development**: Hot reload, CSS modules, and modern React patterns
- **Better UX**: Real-time streaming with proper loading states and error handling
- **Maintainability**: Organized code structure with clear separation of concerns
- **Consistent API**: Uses the same Azure AI Foundry endpoint as the HTML example
