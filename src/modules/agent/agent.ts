/* eslint-disable indent */
import { Embeddings } from "@langchain/core/embeddings";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import initRephraseChain, {
  RephraseQuestionInput,
} from "./chains/rephrase-question.chain";
import { BaseChatModel } from "langchain/chat_models/base";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { getHistory } from "./history";
import initTools from "./tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// tag::function[]
export default async function initAgent(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
) {
  // TODO: Initiate tools
  // const tools = ...

  // TODO: Pull the prompt from the hub
  // const prompt = ...

  // TODO: Create an agent
  // const agent = ...

  // TODO: Create an agent executor
  // const executor = ...

  // TODO: Create a rephrase question chain
  // const rephraseQuestionChain = ...

  // tag::tools[]
  const tools = await initTools(llm, embeddings, graph);
  // end::tools[]

  // tag::prompt[]
  const prompt = await pull<ChatPromptTemplate>(
    "hwchase17/openai-functions-agent"
  );
  // end::prompt[]

  // tag::agent[]
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });
  // end::agent[]

  // tag::executor[]
  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });
  // end::executor[]

  // tag::rephrasechain[]
  const rephraseQuestionChain = await initRephraseChain(llm);
  // end::rephrasechain[]

  // tag::history[]
  return (
    RunnablePassthrough.assign<{ input: string; sessionId: string }, any>({
      // Get Message History
      history: async (_input, options) => {
        const history = await getHistory(
          options?.config.configurable.sessionId
        );

        return history;
      },
    })
      // end::history[]
      // tag::rephrase[]
      .assign({
        // Use History to rephrase the question
        rephrasedQuestion: (input: RephraseQuestionInput, config: any) =>
          rephraseQuestionChain.invoke(input, config),
      })
      // end::rephrase[]

      // tag::execute[]
      // Pass to the executor
      .pipe(executor)
      // end::execute[]
      // tag::output[]
      .pick("output")
  );
  // end::output[]
}
// end::function[]
