import { createSignal, createEffect, onCleanup } from 'solid-js';

export type Message = {
  role: 'human' | 'ai';
  content: string;
};

export function createChatStore() {
  const [thinking, setThinking] = createSignal<boolean>(false);
  const [messages, setMessages] = createSignal<Message[]>([
    {
      role: 'ai',
      content: 'How can I help you today?' // process.env.PUBLIC_CHATBOT_GREETING || 'How can I help you today?',
    },
  ]);

  // Solid does not use refs in the same way React does. For DOM elements, you'd typically use a callback ref.
  let container: HTMLDivElement | undefined;

  const generateResponse = async (message: string): Promise<void> => {
    // Clone current messages and append human message
    setMessages([...messages(), { role: 'human', content: message }]);

    // Set thinking to true
    setThinking(true);

    try {
      // Send POST message to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      // Append the API message to the state
      const json = await response.json();

      // Ensure to spread the previous messages to maintain reactivity
      setMessages([...messages(), { role: 'ai', content: json.message }])
    } catch (e) {
      console.error(e);
    } finally {
      setThinking(false);
    }
  };

  // Effect for scrolling latest message into view
  createEffect(() => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });

  // Cleanup if needed, though in this case, it may not be necessary
  onCleanup(() => {
    // Any cleanup actions
  });

  return {
    thinking,
    messages,
    setContainer: (el: HTMLDivElement) => {
      container = el;
    },
    generateResponse,
  };
}
