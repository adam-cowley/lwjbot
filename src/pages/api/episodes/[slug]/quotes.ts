import type { APIRoute } from "astro";
import { getEpisode } from "../../../../modules/ingest/utils";
import { saveEpisodes } from "../../../../modules/ingest";
import { PromptTemplate } from "langchain/prompts";
import { Ollama } from "@langchain/community/llms/ollama";
import { RunnableSequence } from "langchain/runnables";
import { initGraph } from "../../../../modules/graph";
import type { Episode } from "../../../../modules/ingest/livestream.types";
import { JsonOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import { OpenAI } from "@langchain/openai";

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug as string;

  const res = await getEpisode(`https://www.learnwithjason.dev/${slug}`);
  const { transcript, chunks, ...episode } = res;

  const graph = await initGraph()
  // const model = new Ollama({
  //   model: 'llama2'
  // })
  const model = new OpenAI({
    openAIApiKey: import.meta.env.SECRET_OPENAI_API_KEY
  })

  const prompt = PromptTemplate.fromTemplate(`
Identify quotes that can be used to promote the following show on social media.
Include a citation where possible.


Return the output as an array of JSON objects:
{{ text: "There is no human bliss equal to twelve hours of work with only six hours in which to do it.",
 "by": "Anthony Trollope", "episode" "https://learnwithjason.dev/stoism-with-anthony-trollope" }}

Episode: {title}
URL: {url}
Description: {description}

Text:
{text}

  `)

  const chain = RunnableSequence.from([
    prompt,
    model,
    new JsonOutputParser(),
  ])


  let output: any[] = []

  for (const chunk of chunks.slice(0, 20)) {

    console.log(chunk);
    try {

      const quotes = await chain.invoke({
        title: episode.title,
        url: episode.url,
        description: episode.description,
        text: chunk.text
      })

      console.log(quotes);


      output = output.concat(quotes)
    }
    catch (e) {
      console.log(e);

    }

  }

  // const [elementId] = await saveEpisodes([res]);

  return new Response(JSON.stringify(output, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
