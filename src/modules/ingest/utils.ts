import * as cheerio from "cheerio";
import type { Chunk, Episode, Resource, Topic } from "./livestream.types";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

export async function getEpisodes(): Promise<
  Omit<Episode, "transcript" | "resources" | "topics" | "chunks">[]
> {
  const res = await fetch("https://www.learnwithjason.dev/episodes/");
  const html = await res.text();

  const $ = cheerio.load(html);

  return $("._preview_dno58_1")
    .map((_, el) => {
      const $a = $(el).find("h3 a").first();

      return {
        slug: $a.attr("href")?.split("/").reverse()[0] as string,
        url: ("https://www.learnwithjason.dev/" + $a.attr("href")) as string,
        title: $a.text(),
        description: $(el).find(".description").text(),
        date: $(el).find(".gradient-subheading").text(),
      };
    })
    .get()
    .filter((n) => n !== undefined);
}

export async function getEpisode(url: string): Promise<Episode> {
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);

  const title = $(".title").text();
  const description = $(".description").text();
  const topics = $(".tags a")
    .map((_, el) => {
      return {
        slug: $(el).attr("href"),
        name: $(el).text(),
      };
    })
    .get() as Topic[];
  const resources = $(".resources a")
    .map((_, el) => {
      return {
        url: $(el).attr("href"),
        // title: $(el).text(),
      };
    })
    .get() as Resource[];
  const transcript = $("details div").text();

  const { chunks } = await chunkText(transcript);

  return {
    url,
    slug: url.split('/').reverse()[0],
    title,
    description,
    chunks,
    topics,
    resources,
    transcript,
  };
}

async function chunkText(
  text: string
): Promise<{ documents: Document[]; chunks: Chunk[] }> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const documents = await textSplitter.createDocuments([text]);

  const chunks = documents.map((value, order) => ({
    order,
    text: value.pageContent,
    // metadata: value.metadata,
    start: value.metadata.loc.lines.from,
    end: value.metadata.loc.lines.to,
  }));

  return {
    documents,
    chunks,
  };
}
