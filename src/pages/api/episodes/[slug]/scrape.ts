import type { APIRoute } from "astro";
import { getEpisode } from "../../../../modules/ingest/utils";
import { saveEpisodes } from "../../../../modules/ingest";

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug as string;

  const res = await getEpisode(`https://www.learnwithjason.dev/${slug}`);
  const { transcript, chunks, ...episode } = res;

  const [elementId] = await saveEpisodes([res]);

  return new Response(JSON.stringify({ ...episode, elementId }, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
