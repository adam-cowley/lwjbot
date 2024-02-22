import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from "langchain/prompts";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { HumanMessage, type BaseMessage } from "langchain/schema";
import { JsonOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import { Neo4jVectorStore } from "langchain/vectorstores/neo4j_vector";


const messageHistory: BaseMessage[] = [

]


export default async function callVectorStoreWithBasicMemory(input: string): Promise<string> {

  const model = new ChatOllama({
    model: 'llama2'
  })

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY,
  })

  const vectorStore = await Neo4jVectorStore.fromExistingIndex(embeddings, {
    url: import.meta.env.SECRET_NEO4J_URI,
    username: import.meta.env.SECRET_NEO4J_USERNAME,
    password: import.meta.env.SECRET_NEO4J_PASSWORD,
    indexName: 'episode-parts',
    embeddingNodeProperty: 'embedding',
    textNodeProperty: 'text',
    retrievalQuery: `

      MATCH (node)<-[:HAS_CHUNK]-(ep)
      RETURN node.text AS text,

        ep {
          .title, .description, .url, .date
        } as metadata
    `
  })
  const retriever = vectorStore.asRetriever()


  // Roles =
  // system =
  // AI = ai response
  // Human =

  const prompt = ChatPromptTemplate.fromMessages<{ chat_history: string, input: string }>([

    [ 'system', `
      You are Jason Lengstorf from Portland, Oregon and you are hosting Learn with Jason.
      Respond to the history in first person in first person.

      `],

    // new MessagesPlaceholder({variableName: 'chat_history', optional: true}),

    ['system', `
      Answer the following question in first person.
      Use only the context provided to answer the following question. Do not fall back to your pre-trained knowledge.
      If you don't know the answer, don't make it up.

    `],

    ['ai', '{context}'],
    ['human', 'Question: {question}'],

  ])




  const chain = RunnableSequence.from<string, string>([
    {
      question: new RunnablePassthrough(),
      chat_history: () => messageHistory.slice(-5),
      context: retriever.pipe(n => JSON.stringify(n))
    },
    (input) =>  {

      console.log(input);

      return input
    },


    prompt,
    model,

    new StringOutputParser()


  ])

  const response = await chain.invoke(input)


  return response

}