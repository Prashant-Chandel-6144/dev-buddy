import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
    return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

export async function saveChunksToPinecone(
    namespace: string,
    chunks: CodeChunk[]
) {
    const index = getPineconeIndex();
    const BATCH_SIZE = 80;

    for (let start = 0; start < chunks.length; start += BATCH_SIZE) {
        const batch = chunks.slice(start, start + BATCH_SIZE);
        const records = batch.map((chunk) => ({
            id: chunk.id,
            text: chunk.text,
            filePath: chunk.filePath,
        }));

        // namespace() scopes vectors so this PR never mixes with repo-wide sync data
        await index.namespace(namespace).upsertRecords({ records });
    }
}


export async function searchPrContext(namespace: string, query: string) {
    const index = getPineconeIndex();

    const response = await index.namespace(namespace).searchRecords({
        query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
    });

    const snippets: string[] = [];

    for (const hit of response.result.hits) {
        const fields = hit.fields as { text?: string; filePath?: string };
        if (!fields.text) {
            continue;
        }

        snippets.push(`File: ${fields.filePath}\n${fields.text}`);
    }

    return snippets;
}