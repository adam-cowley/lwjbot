import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import { sleep } from "../../utils";

// tag::call[]
export async function call(input: string, sessionId: string): Promise<string> {
  // tag::model[]
  const llm = new ChatOpenAI({
    openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
  });
  // end::model[]
  // tag::embeddings[]
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
  });
  // end::embeddings[]
  // tag::graph[]
  // Get Graph Singleton
  const graph = await initGraph();
  // end::graph[]

  // tag::call[]
  const agent = await initAgent(llm, embeddings, graph);
  const res = await agent.invoke({ input }, { configurable: { sessionId } });

  return res;
  // end::call[]
}
// end::call[]
