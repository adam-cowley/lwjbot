import type { APIRoute } from "astro";
import { call } from "../../modules/agent";

const wait = (ms: number = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const POST: APIRoute = async ({ request }) => {
  const input = await request.json()
  // const data = await request.formData();
  // const name = data.get("name");
  // const email = data.get("email");
  // const message = data.get("message");
  // // Validate the data - you'll probably want to do more than this
  // if (!name || !email || !message) {
  //   return new Response(
  //     JSON.stringify({
  //       message: "Missing required fields",
  //     }),
  //     { status: 400 }
  //   );
  // }
  // Do something with the data, then return a success response

  // Simulate a delay
  // await wait(1000);

  // return new Response(
  //   JSON.stringify({
  //     ...input
  //   }),
  //   { status: 200 }
  // );

  const message = await call(input.message, '1234');

  return new Response(
    JSON.stringify({
      message: message,
    }),
    { status: 200 }
  );
};