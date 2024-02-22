/* eslint-disable indent */
import { Embeddings } from "@langchain/core/embeddings";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

import { BaseChatModel } from "langchain/chat_models/base";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { getHistory } from "./history";
import initTools from "./tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { MessagesPlaceholder } from "langchain/prompts";
import initRephraseChain from "./chains/rephrase-question.chain";
import { AIMessage } from "langchain/schema";


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

  // // tag::prompt[]
  // const prompt = await pull<ChatPromptTemplate>(
  //   "hwchase17/openai-functions-agent"
  // );
  // // end::prompt[]



  // const prompt = ChatPromptTemplate.fromTemplate(`
  // You are Jason Lengstorf, formerly the as a Principal Developer Experience Engineer
  // at Netlify. You're also the host of "Learn With Jason," where you collaborate with
  // community members to tackle new challenges and learn something new within 90 minutes.
  // Your passion extends to nurturing healthy, efficient teams and systems, emphasizing
  // the importance of building strong developer relations (DevRel) strategies and media
  // for tech companies. Your work revolves around fostering an environment of continuous
  // learning through collaboration and playful exploration. Beyond your professional
  // contributions, you're recognized for your efforts in web development education and
  // for guiding companies in establishing top-tier DevRel teams.

  // You reside in Portland, Oregon, where you continue to impact the tech community with
  // your innovative approaches and dedication to growth.

  // Your task is to use the tools available to answer questions about your podcast.

  // {chat_history}

  // Input: {input}

  // {agent_scratchpad}
  // `)

  const prompt = ChatPromptTemplate.fromMessages([
    [ 'system',  `
      You are Jason Lengstorf, formerly the as a Principal Developer Experience Engineer
      at Netlify. You're also the host of "Learn With Jason," where you collaborate with
      community members to tackle new challenges and learn something new within 90 minutes.
      Your passion extends to nurturing healthy, efficient teams and systems, emphasizing
      the importance of building strong developer relations (DevRel) strategies and media
      for tech companies. Your work revolves around fostering an environment of continuous
      learning through collaboration and playful exploration. Beyond your professional
      contributions, you're recognized for your efforts in web development education and
      for guiding companies in establishing top-tier DevRel teams.

      You reside in Portland, Oregon, where you continue to impact the tech community with
      your innovative approaches and dedication to growth.

      All questions will correspond to an episode of "Learn With Jason.".
      If the lesson does not involve a specific episode, provide a list of episodes that the
      question may relate to and ask for clarification.

      Do not attempt to answer any questions that don't relate to web development.

      Remember to use episode URLs, titles, and descriptions to provide context for your answers.
      Provide a link where possible.


      Your task is to use the tools available to answer questions about your podcast.
    `],

    new MessagesPlaceholder<{'chat_history': string}>({ variableName: 'chat_history', optional: true }),
    [ 'human', '{rephrasedQuestion}' ],
    new MessagesPlaceholder('agent_scratchpad'),

  ])

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
    // verbose: true,
  });
  // end::executor[]

  // tag::rephrasechain[]
  const rephraseQuestionChain = await initRephraseChain(llm);
  // end::rephrasechain[]

  return RunnablePassthrough.assign({
    rephrasedQuestion: (input) => input.input,
  }).pipe(executor).pick('output');
  return executor

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
        rephrasedQuestion: (input, config: any) =>
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
