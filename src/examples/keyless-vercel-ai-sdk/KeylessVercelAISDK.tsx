import { useState, useEffect, useRef, useCallback } from 'react';
import { AIFoundryConfigComponent } from '../../components/AIFoundryConfig';
import { AIFoundryConfigUtils, type AIFoundryConfig } from '../../utils/AIFoundryConfigUtils';
import { createAzureAIFoundryLanguageModel, chat } from '../../utils/AzureProvider';
import { type CoreMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import styles from './KeylessVercelAISDK.module.css';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id: string;
}

export function KeylessVercelAISDK() {
  const [config, setConfig] = useState<AIFoundryConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [systemMessage, setSystemMessage] = useState('You are a pirate assistant.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Load initial config from localStorage on component mount
  useEffect(() => {
    const initialConfig = AIFoundryConfigUtils.getConfig();
    console.log('KeylessVercelAISDK: Initial config loaded:', initialConfig);
    setConfig(initialConfig);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleConfigChange = useCallback((newConfig: AIFoundryConfig) => {
    console.log('KeylessVercelAISDK: Config changed:', newConfig);
    setConfig(newConfig);
  }, []);

  const handleSendMessage = async () => {
    if (!config || !AIFoundryConfigUtils.isConfigValid(config)) {
      setError('Please configure all required fields first.');
      return;
    }

    if (!input.trim()) {
      setError('Please enter a message.');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');
    setIsStreaming(true);

    try {
      // Get the language model
      const languageModel = await createAzureAIFoundryLanguageModel(config);
      
      // Convert messages to CoreMessage format
      const coreMessages: CoreMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      coreMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Call the chat function with streaming callbacks
      await chat(
        languageModel,
        systemMessage,
        coreMessages,
        (streamingText: string) => {
          // This is called for each streaming update
          setStreamingContent(streamingText);
        },
        (finalText: string) => {
          // This is called when streaming is complete
          const assistantMessage: Message = {
            role: 'assistant',
            content: finalText,
            id: (Date.now() + 1).toString()
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingContent('');
          setIsStreaming(false);
        }
      );
    } catch (err) {
      console.error('Error calling Azure API:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while calling the API.');
      setIsStreaming(false);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
    setIsStreaming(false);
  };

  const loadExamplePrompt = () => {
    setInput('Explain how to train a parrot using markdown formatting with headings, lists, and code examples.');
  };

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>
        ← Back to Home
      </a>

      <div className={styles.header}>
        <img src="/aifoundry-gold.svg" alt="Azure AI Foundry Gold" />
        <div className={styles.headerText}>
          <h1>Azure AI Foundry - Keyless with Vercel AI SDK</h1>
          <p className={styles.subtitle}>
            Client-side keyless authentication with streaming support
          </p>
        </div>
      </div>

      <AIFoundryConfigComponent onConfigChange={handleConfigChange} />

      <div className={styles.exampleSection}>
        <h3>Example Conversation</h3>
        <div className={styles.examplePrompt}>
          <strong>System:</strong> You are a pirate assistant.
        </div>
        <div className={styles.examplePrompt}>
          <strong>User:</strong> Explain how to train a parrot using markdown formatting with headings, lists, and code examples.
        </div>
        <button 
          onClick={loadExamplePrompt}
          style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Load Example Prompt
        </button>
      </div>

      <div className={styles.chatSection}>
        <div className={styles.chatHeader}>
          <h3>AI Chat</h3>
          {messages.length > 0 && (
            <button onClick={clearChat} className={styles.clearButton}>
              Clear Chat
            </button>
          )}
        </div>

        <div className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((message) => (
            <div key={message.id} className={styles.messageContainer}>
              <div 
                className={`${styles.messageLabel} ${
                  message.role === 'system' ? styles.systemLabel :
                  message.role === 'user' ? styles.userLabel :
                  styles.assistantLabel
                }`}
              >
                {message.role === 'system' ? 'System' :
                 message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div 
                className={`${styles.messageContent} ${
                  message.role === 'system' ? styles.systemMessage :
                  message.role === 'user' ? styles.userMessage :
                  styles.assistantMessage
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {/* Show streaming content */}
          {isStreaming && streamingContent && (
            <div className={styles.messageContainer}>
              <div className={`${styles.messageLabel} ${styles.assistantLabel}`}>
                Assistant
              </div>
              <div className={`${styles.messageContent} ${styles.assistantMessage}`}>
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                {isLoading && <span className={styles.loadingIndicator}>|</span>}
              </div>
            </div>
          )}

          {/* Show loading indicator when starting */}
          {isLoading && !isStreaming && (
            <div className={styles.loadingIndicator}>
              <div className={styles.spinner}></div>
              Connecting to Azure AI Foundry...
            </div>
          )}

          {/* Show empty state */}
          {messages.length === 0 && !isLoading && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginTop: '2rem',
              fontStyle: 'italic'
            }}>
              Start a conversation by typing a message below
            </div>
          )}
        </div>

        <div className={styles.chatInput}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              placeholder="System message (optional)"
              className={styles.systemInput}
            />
          </div>

          <div className={styles.messageInputGroup}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className={styles.messageInput}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !config || !AIFoundryConfigUtils.isConfigValid(config)}
              className={styles.sendButton}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
