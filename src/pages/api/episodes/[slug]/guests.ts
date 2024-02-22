import type { APIRoute } from "astro";
import { getEpisode } from "../../../../modules/ingest/utils";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/runnables";
import { initGraph } from "../../../../modules/graph";
import { JsonOutputParser } from "langchain/schema/output_parser";
import { OpenAI } from "@langchain/openai";

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug as string;

  const res = await getEpisode(`https://www.learnwithjason.dev/${slug}`);
  const { transcript, chunks, resources, ...episode } = res;

  const graph = await initGraph()
  const model = new OpenAI({
    openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY
  })

  const prompt = PromptTemplate.fromTemplate(`
Use the following information to produce a JSON list of guests in the episode
their personal information and areas of expertise.
Include their communication style and sentiment.

Example format:
{{
  "name": "Jason Lengstorf",
  "website": "https://learnwithjason.dev",
  "location": "Portland, Ohio, USA",
  "company": "Learn with Jason",
  "expertise": ["Web Development", "Smash Burgers"]
}}

{episode}
  `)

  const chain = RunnableSequence.from([
    {
      episode: input => JSON.stringify(input),
    },
    prompt,
    model,
    new JsonOutputParser(),
  ])

  const guests = await chain.invoke({
    ...episode,
    transcript: transcript.substring(0, 1000)
  })

  await graph.query(`
    MATCH (e:Episode {slug: $slug})
    UNWIND $guests AS guest
    MERGE (g:Guest {name: guest.name})
    SET g += guest

    MERGE (g)-[:APPEARED_ON]->(e)

  `, { ...episode, guests })

  return new Response(JSON.stringify(guests, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
