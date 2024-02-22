import type { APIRoute } from "astro";
import { llm } from "../../../../modules/llm";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { initGraph } from "../../../../modules/graph";
import { PromptTemplate } from "langchain/prompts";
import { JsonOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import type { Episode } from "../../../../modules/ingest/livestream.types";
import { loadSummarizationChain } from "langchain/chains";
import { TokenTextSplitter } from "langchain/text_splitter";

export const GET: APIRoute = async ({ params, request }) => {
  const graph = await initGraph();

  const res = await graph.query<Episode>(`
    MATCH (e:Episode {slug: $slug})
    RETURN e.transcript AS transcript
  `, { slug: params.slug as string });

  if (!res?.length) {
    return new Response(JSON.stringify({ error: "Episode not found" }), {
      status: 404,
    })
  }

  const transcript = res[0].transcript;


  const splitter = new TokenTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 250,
  });

  const chunks = await splitter.createDocuments([
    transcript
  ]);




  const questionPrompt = PromptTemplate.fromTemplate(`
    You are an expert in summarizing YouTube videos.
    Your goal is to create a summary of a podcast.
    Below you find the transcript of a podcast:
    --------
    {text}
    --------

    The transcript of the podcast will also be used as the basis for a question and answer bot.
    Provide some examples questions and answers that could be asked about the podcast. Make these questions very specific.

    Total output will be a summary of the video and a list of example questions the user could ask of the video.

    SUMMARY AND QUESTIONS:
  `)

  const summarizeChain = loadSummarizationChain(llm, { type: "map_reduce" });


  const summary = await summarizeChain.invoke({input_documents: chunks});


  return new Response(JSON.stringify(summary), {
    headers: {
      "content-type": "application/json",
    },
  });
};
