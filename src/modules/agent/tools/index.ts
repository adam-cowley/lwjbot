import { BaseChatModel } from "langchain/chat_models/base";
import { Embeddings } from "@langchain/core/embeddings";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import initCypherRetrievalChain from "./cypher/cypher-retrieval.chain";
import initVectorRetrievalChain from "./vector-retrieval.chain";
import { DynamicStructuredTool } from "@langchain/community/tools/dynamic";
import { AgentToolInputSchema } from "../agent.types";
import { RunnableConfig } from "langchain/runnables";

// tag::function[]
export default async function initTools(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
): Promise<DynamicStructuredTool[]> {
  // tag::cypherchain[]
  // Initiate chains
  const cypherChain = await initCypherRetrievalChain(llm, graph);
  // end::cypherchain[]
  // tag::retrievalchain[]
  const retrievalChain = await initVectorRetrievalChain(llm, embeddings);
  // end::retrievalchain[]

  return [
    // tag::cypher[]
    new DynamicStructuredTool({
      name: "graph-cypher-retrieval-chain",
      description:
        "For retrieving more advanced information about episodes including topics, people, and places.",
      schema: AgentToolInputSchema,
      func: (input, _runManager, config) => cypherChain.invoke(input, config),
    }),
    // end::cypher[]
    // tag::vector[]
    new DynamicStructuredTool({
      name: "graph-vector-retrieval-chain",
      description:
        "For performing semantic search to find out qualitative information about an episode",
      schema: AgentToolInputSchema,
      func: (input, _runManager: any, config) =>
        retrievalChain.invoke(input, config),
    }),
    // end::vector[]
  ];
}
// end::function[]
