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

- **AIFoundryConfig**: Reusable configuration UI component
- **AIFoundryConfigUtils**: Utility functions for configuration management
- **AzureProvider**: Custom Azure AI Foundry provider that implements streaming chat completions
- **KeylessVercelAISDK**: Main example component

### Tech Stack

- React 19
- TypeScript
- CSS Modules
- Vite 7
- Azure MSAL Browser

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
