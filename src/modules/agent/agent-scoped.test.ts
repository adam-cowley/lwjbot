import initAgent from "./agent";
import { config } from "dotenv";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "langchain/embeddings/base";
import { BaseChatModel } from "langchain/chat_models/base";
import { Runnable } from "@langchain/core/runnables";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { close } from "../graph";

describe("Langchain Agent", () => {
  let llm: BaseChatModel;
  let embeddings: Embeddings;
  let graph: Neo4jGraph;
  let executor: Runnable;

  beforeAll(async () => {
    config({ path: ".env.local" });

    graph = await Neo4jGraph.initialize({
      url: import.meta.env.SECRET_NEO4J_URI as string,
      username: import.meta.env.SECRET_NEO4J_USERNAME as string,
      password: import.meta.env.SECRET_NEO4J_PASSWORD as string,
      database: import.meta.env.SECRET_NEO4J_DATABASE as string | undefined,
    });

    llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
      modelName: "gpt-4",
      temperature: 0,
    });

    embeddings = new OpenAIEmbeddings({
      openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY as string,
    });

    executor = await initAgent(llm, embeddings, graph);
  });

  afterAll(async () => {
    await graph.close();
    await close();
  });

  describe("Scoping", () => {
    it("should refuse to answer a question not related to movies", async () => {
      const sessionId = "agent-rag-1";
      const input = "Who is the CEO of Neo4j?";

      const output = await executor.invoke(
        {
          input,
        },
        {
          configurable: {
            sessionId,
          },
        }
      );

      expect(output).toContain("questions about movies");
    });
  });
});
