import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { getEpisode, getEpisodes } from "./utils";
import type { Episode } from "./livestream.types";
import { initGraph } from "../graph";

export async function loadEpisodes() {
    const neo4j = await Neo4jGraph.initialize({
        url: import.meta.env.SECRET_NEO4J_URI as string,
        username: import.meta.env.SECRET_NEO4J_USERNAME as string,
        password: import.meta.env.SECRET_NEO4J_PASSWORD as string,
    })

    const episodes = await Promise.all((await getEpisodes())
        .map(async episode => {
            const details = await getEpisode(episode.url)

            return Object.assign({}, episode, details)
        }))


    return episodes
}

export async function saveEpisodes(episodes: Episode[]): Promise<string[]> {
    const neo4j = await initGraph()
    const res = await neo4j.query<{id: string}>(`
        UNWIND $episodes AS episode

        MERGE (e:Episode {url: episode.url})
        SET e += episode {
            .id, .title, .date, .description, .transcript
        }

        FOREACH (topic in episode.topics |
            MERGE (t:Topic {slug: topic.slug})
            SET t.name = topic.name
            MERGE (e)-[:MENTIONS_TOPIC]->(t)
        )

        FOREACH (resource in episode.resources |
            MERGE (r:Resource {url: resource.url})
            MERGE (e)-[:MENTIONS_RESOURCE]->(r)
        )

        FOREACH (chunk in episode.chunks |
            MERGE (c:Chunk {id: episode.url + '--'+ chunk.order})
            SET c += chunk { .start, .end, .text }

            MERGE (e)-[r:HAS_CHUNK]->(c)
            SET r.order = chunk.order
        )
        RETURN elementId(e) AS id
    `, { episodes })

    return res?.map(row => row.id) || []
}

async function nextChunk(neo4j: Neo4jGraph) {
    const res = await neo4j.query(`
        MATCH (e:Episode)
        WHERE not e:Chunked AND count { (e)-[:HAS_CHUNK]->() } > 0

        WITH e, [ (e)-[:HAS_CHUNK]->(c) | c ] AS nodes, [ (e)-[:HAS_CHUNK]->(c) | c.text ] AS text
        LIMIT 1

        CALL genai.vector.encodeBatch(text, "OpenAI", { token: $token, model: 'text-embedding-ada-002' })
        YIELD index, vector
        CALL db.create.setNodeVectorProperty(nodes[index], "embedding", vector)

        SET e:Chunked

        RETURN count(*) AS count
    `, { token: import.meta.env.SECRET_OPENAI_API_KEY })

    return res !== undefined && res.length != 0
}

export async function loadChunks() {
    const neo4j = await Neo4jGraph.initialize({
        url: import.meta.env.SECRET_NEO4J_URI as string,
        username: import.meta.env.SECRET_NEO4J_USERNAME as string,
        password: import.meta.env.SECRET_NEO4J_PASSWORD as string,
    })

    let n = await nextChunk(neo4j)

    while (n !== false) {
        n = await nextChunk(neo4j)
    }

    await neo4j.close()
}