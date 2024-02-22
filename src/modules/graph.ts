import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";


// <1> The singleton instance
let graph: Neo4jGraph;

/**
 * <2> Return the existing `graph` object or create one
 * has not already been created
 * @returns {Promise<Neo4jGraph>}
 */
export async function initGraph(): Promise<Neo4jGraph> {
  if (!graph) {
    graph = await Neo4jGraph.initialize({
      url: import.meta.env.SECRET_NEO4J_URI as string,
      username: import.meta.env.SECRET_NEO4J_USERNAME as string,
      password: import.meta.env.SECRET_NEO4J_PASSWORD as string,
      database: import.meta.env.SECRET_NEO4J_DATABASE as string | undefined,
    });
  }

  return graph;
}
// end::graph[]

// tag::read[]
/**
 * Execute a Cypher statement in a read transaction
 *
 * @param {string} cypher               The cypher statement
 * @param {Record<string, any>} params  Parameters
 * @returns {Record<string, any>[]}
 */
export async function read<T extends Record<string, any>>(
  cypher: string,
  params: Record<string, any>
): Promise<T[] | undefined> {
  const graph = await initGraph();
  const res = await graph.query<T>(cypher, params, 'READ');
  return res?.map((record) => record.toObject());
}
// end::read[]

// tag::write[]
/**
 * Execute a Cypher statement in a write transaction
 *
 * @param {string} cypher               The cypher statement
 * @param {Record<string, any>} params  Parameters
 * @returns {Record<string, any>[]}
 */
export async function write<T extends Record<string, any>>(
  cypher: string,
  params: Record<string, any>
): Promise<T[] | undefined> {
  const graph = await initGraph();
  const res = await graph.query<T>(cypher, params, 'READ');
  return res?.map((record) => record.toObject());
}
// end::write[]

/**
 * Close any connections to Neo4j initiated in this file.
 *
 * @returns {Promise<void>}
 */
export async function close(): Promise<void> {
  if (graph) {
    await graph.close();
  }
}
