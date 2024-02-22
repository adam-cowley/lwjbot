import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { JsonOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import { Neo4jVectorStore } from "langchain/vectorstores/neo4j_vector";

export default async function callVectorStore(input: string): Promise<string> {
  const model = new ChatOllama({
    model: 'mistral'
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

  const prompt = PromptTemplate.fromTemplate(`
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

    Respond in the first person using a friendly but concise tone.

    Use only the information in the context to answer the question.

    Do not attempt to answer any questions that don't relate to web development.

    Remember to use episode URLs, titles, and descriptions to provide context for your answers.
    Provide a link where possible.




    Context:
    {context}


    User question: {question}


  `)



  const chain = RunnableSequence.from<string, string>([
    {
      question: new RunnablePassthrough(),
      context: retriever.pipe(documents => JSON.stringify(documents)),
    },

  (input) => {
    console.log(input)

    return input
  },

    prompt,
    model,

    new StringOutputParser()


  ])

  const response = await chain.invoke(input)


  return response

}