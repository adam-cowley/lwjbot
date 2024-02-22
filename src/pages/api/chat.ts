import type { APIRoute } from "astro";
import { call } from "../../modules/agent";
import callVectorStore from "../../modules/retriever";
import callVectorStoreWithBasicMemory from "../../modules/retriever/with-basic-memory";

const wait = (ms: number = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const POST: APIRoute = async ({ request }) => {
  const input = await request.json()

  Simulate a delay
  await wait(1000);

  return new Response(
    JSON.stringify({
      ...input
    }),
    { status: 200 }
  );
};