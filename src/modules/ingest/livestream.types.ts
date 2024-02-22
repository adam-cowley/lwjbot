export interface Topic {
    slug: string;
    name: string;
}

export interface Resource {
    url: string;
    title: string;
}

export interface Episode {
    url: string;
    slug: string;
    title: string;
    date?: string;
    description: string;
    resources: Resource[];
    topics: Topic[];
    transcript: string;
    chunks: Chunk[]
}

export interface Chunk {
    order: number;
    text: string;
    start: number;
    end: number;
}
