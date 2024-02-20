import { ChatOpenAI } from "@langchain/openai";
import initTools from ".";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAIEmbeddings } from "@langchain/openai";

describe("Tool Chain", () => {
  it("should return two tools", async () => {
    const graph = await Neo4jGraph.initialize({
      url: import.meta.env.SECRET_NEO4J_URI as string,
      username: import.meta.env.SECRET_NEO4J_USERNAME as string,
      password: import.meta.env.SECRET_NEO4J_PASSWORD as string,
      database: import.meta.env.SECRET_NEO4J_DATABASE as string | undefined,
    });

    const llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
      modelName: "gpt-4",
      temperature: 0,
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY as string,
    });

    const tools = await initTools(llm, embeddings, graph);

    expect(tools).toBeDefined();
    expect(tools.length).toBeGreaterThanOrEqual(2);

    await graph.close();
  });
});
