import { createEffect } from 'solid-js';
import { marked } from 'marked'; // Assuming marked is correctly installed and imported

function fixMarkdown(messageContent) {
  const parsedMarkdown = marked.parse(messageContent);
  return parsedMarkdown.replace(
    /<a href="/g,
    '<a target="_blank" rel="noopener noreferrer" href="'
  );
}

const Message = (props) => {
  const align = () => (props.message.role === 'ai' ? 'justify-start' : 'justify-end');
  const noRounding = () => (props.message.role === 'ai' ? 'rounded-bl-none' : 'rounded-br-none');
  const backgroundClass = () => (props.message.role === 'ai' ? 'bg-slate-900' : 'bg-slate-700');
  const textColorClass = () => (props.message.role === 'ai' ? 'text-yellow-200' : 'text-slate-100');

  return (
    <div class={`w-full flex  flex-row ${align()}`}>
      <div class="flex flex-col space-y-2 text-sm mx-2 max-w-[60%] order-2 items-start">
        <div class={`${backgroundClass()} p-4 rounded-xl ${noRounding()} ${textColorClass()}`} innerHTML={fixMarkdown(props.message.content)} />
      </div>
    </div>
  );
};

export default Message;
