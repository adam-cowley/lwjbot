import { createSignal, onCleanup } from "solid-js";
import type { Message } from "./store";

export default function Form(props) {
  const [message, setMessage] = createSignal("");
  const input = () => document.querySelector("textarea");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (message().trim().length > 0) {
      props.onSubmit(message());
      setTimeout(() => setMessage(""), 100);

      props.container?.scrollBy(0, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (props.thinking) {
      return;
    }
    if (e.key === "ArrowUp") {
      const lastHuman = [...props.messages].reverse().find((m) => m.role === "human");

      if (lastHuman) {
        setMessage(lastHuman.content);
      }
      setTimeout(() => {
        const textarea = input();
        if (textarea) {
          textarea.selectionStart = textarea.value.length;
          textarea.selectionEnd = textarea.value.length;
        }
      }, 20);
    } else if (!e.shiftKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  // Cleanup if needed (similar to useEffect(() => return () => {}, []))
  onCleanup(() => {
    // Any cleanup actions
  });

  return (
    <form
      class="border-t b-slate-200 p-4 bg-slate-100"
      onSubmit={handleSubmit}
    >
      <div class="flex flex-row bg-white border border-slate-600 rounded-md w-full">
        <div class="flex-grow">
          <textarea
            ref={input}
            value={message()}
            rows={1}
            class="p-4 border-blue-600 rounded-md w-full outline-none focus:outline-none"
            onInput={(e) => setMessage(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div class="px-4">
          <button type="submit" class="px-4 py-4 border-primary-800 text-blue-700 font-bold rounded-md h-full bg-white">
            Send
          </button>
        </div>
      </div>
    </form>
  );
}
