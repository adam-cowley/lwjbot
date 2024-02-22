import { BaseLanguageModel } from "langchain/base_language";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

// tag::function[]
export default async function initCypherGenerationChain(
  graph: Neo4jGraph,
  llm: BaseLanguageModel
) {
  // tag::prompt[]
  // Create Prompt Template
  const cypherPrompt = PromptTemplate.fromTemplate(`
    You are a Neo4j Developer translating user questions into Cypher to answer questions.
    Convert the user's question into a Cypher statement based on the schema.

    You must:
    * Only use the nodes, relationships and properties mentioned in the schema.
    * When required, \`IS NOT NULL\` to check for property existence, and not the exists() function.
    * Use the \`elementId()\` function to return the unique identifier for a node or relationship as \`_id\`.
      For example:
      \`\`\`
      MATCH (a:Person)-[:ACTED_IN]->(m:Movie)
      WHERE a.name = 'Emil Eifrem'
      RETURN m.title AS title, elementId(m) AS _id, a.role AS role
      \`\`\`
    * Include extra information about the nodes that may help an LLM provide a more informative answer,
      for example the release date, rating or budget.
    * When returning speculative answers, limit the maximum number of results to 20.
    * Respond with only a Cypher statement.  No preamble.
    * Return the episode number, date and URL when mentioning any episode
    * The latest episodes are the most important, so order by episode.date in reverse order

    Topics: {topics}



    Schema:
    {schema}

    Question:
    {question}
  `);
  // end::prompt[]

  // tag::sequence[]
  // Create the runnable sequence
  // tag::startsequence[]
  return RunnableSequence.from<string, string>([
    // end::startsequence[]
    // tag::assign[]
    {
      // Take the input and assign it to the question key
      question: new RunnablePassthrough(),
      // Get the schema
      schema: () => graph.getSchema(),

      topics: () => graph.query("MATCH (n:Topic) RETURN n.slug AS slug, n.name AS name")
        .then(res => res?.map(r => r.slug))
        .then(res => res?.join(", "))
    },
    // end::assign[]
    // tag::rest[]
    cypherPrompt,
    llm,
    new StringOutputParser(),
    // end::rest[]
  ]);
  // end::sequence[]
}
// end::function[]
