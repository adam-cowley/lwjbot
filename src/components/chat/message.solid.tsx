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
  const backgroundClass = () => (props.message.role === 'ai' ? 'bg-blue-100' : 'bg-slate-100');
  const textColorClass = () => (props.message.role === 'ai' ? 'text-blue-600' : 'text-slate-600');

  return (
    <div class={`w-full flex flex-row ${align()}`}>
      <div class="flex flex-col space-y-2 text-sm mx-2 max-w-[60%] order-2 items-start">
        <div class={`${backgroundClass()} p-4 rounded-xl ${noRounding()} ${textColorClass()}`} innerHTML={fixMarkdown(props.message.content)} />
      </div>
    </div>
  );
};

export default Message;
