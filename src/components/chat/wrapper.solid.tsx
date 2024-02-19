import { createEffect } from 'solid-js';
import { createChatStore } from './store'; // Adjust the import path as necessary
import Message from './message.solid'; // Adjust the import path as necessary
import Form from './form.solid'; // Adjust the import path as necessary
import Thinking from './thinking.solid'; // Adjust the import path as necessary

export default function Home() {
  const { messages, thinking, setContainer, generateResponse } = createChatStore();

//   const thinkingText = `🤔 ${process.env.NEXT_PUBLIC_CHATBOT_NAME || 'Chatbot'} is thinking...`;
  const thinkingText = `🤔 Lengsbot is thinking...`;

  return (
    <>
      <div class="flex flex-col h-screen" style={{ height: '100vh' }}>
        <div class="p-4 bg-blue-800 flex flex-row justify-between">
          <h1 class="text-white">
            <span class="font-bold">{'Lengsbot'} -</span>
            <span class="text-blue-100"> {'Boop'}</span>
          </h1>
        </div>

        <div
          ref={setContainer} // Assigning the ref directly
          class="flex flex-grow flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        >
          <For each={messages()}>{(m, i) => <Message message={m} />}</For>

          <Show when={thinking()}><Thinking /></Show>
        </div>

        <Form messages={messages()} thinking={thinking()} onSubmit={generateResponse} />

        <div class="flex flex-row justify-between b-slate-200 px-4 pb-4 bg-slate-100 text-xs text-slate-600">
          <div class="animate-pulse">{thinking() ? thinkingText : ' '}</div>
          <div>
            Powered by
            <a href="https://neo4j.com" target="_blank" rel="noopener noreferrer" class="font-bold"> Neo4j</a> &ndash; Learn more at
            <a href="https://graphacademy.neo4j.com" target="_blank" rel="noopener noreferrer" class="font-bold"> Neo4j GraphAcademy</a>
          </div>
        </div>
      </div>
    </>
  );
}
