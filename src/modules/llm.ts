import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export const llm = new ChatOpenAI({
  openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0,
});

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY as string,
});
