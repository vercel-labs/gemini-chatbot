import * as fs from 'fs/promises';
import * as path from 'path';

import { VertexAI } from '@google-cloud/vertexai';
import { Client } from 'pg';

// --- Configuration ---
const PROJECT_ID = 'YOUR_PROJECT_ID';
const LOCATION = 'YOUR_LOCATION';
const TEXT_MODEL_NAME = 'text-multilingual-embedding-002';
const IMAGE_MODEL_NAME = 'multimodalembedding';
const ALLOYDB_CONNECTION_STRING = 'YOUR_ALLOYDB_CONNECTION_STRING';
const FOLDER_PATH = './your_document_folder';

// --- Vertex AI Setup ---
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const textModel = vertexAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
const imageModel = vertexAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });

// --- AlloyDB Setup ---
const client = new Client({
  connectionString: ALLOYDB_CONNECTION_STRING,
});

interface EmbeddingData {
  id: string;
  embedding: number[];
  content: string;
}

async function generateTextEmbeddings(text: string): Promise<number[]> {
  const embeddingsResponse = await textModel.generateEmbeddings({
    contents: [text],
  });
  return embeddingsResponse[0].values;
}

async function generateImageEmbeddings(
  imagePath: string,
): Promise<number[] | null> {
  try {
    const fileContent = await fs.readFile(imagePath, { encoding: 'base64' });
    const embeddingsResponse = await imageModel.generateEmbeddings({
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg', // Adjust mime type as needed
            data: fileContent,
          },
        },
      ],
    });
    return embeddingsResponse[0].values;
  } catch (error) {
    console.error('Error generating image embeddings:', error);
    return null;
  }
}

async function processFiles(folderPath: string): Promise<EmbeddingData[]> {
  const files = await fs.readdir(folderPath);
  const embeddingsData: EmbeddingData[] = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStat = await fs.stat(filePath);

    if (fileStat.isFile()) {
      const fileExtension = path.extname(file).toLowerCase();
      let embedding: number[] | null;
      let content: string;

      if (['.txt', '.pdf', '.docx'].includes(fileExtension)) {
        content = await fs.readFile(filePath, 'utf-8');
        embedding = await generateTextEmbeddings(content);
      } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        embedding = await generateImageEmbeddings(filePath);
        content = 'image';
      }

      if (embedding) {
        embeddingsData.push({
          id: file,
          embedding: embedding,
          content: content,
        });
      }
    }
  }
  return embeddingsData;
}

async function uploadToAlloyDB(embeddingsData: EmbeddingData[]): Promise<void> {
  try {
    await client.connect();
    for (const data of embeddingsData) {
      const embeddingString = `[${data.embedding.join(',')}]`;
      const query = `
                INSERT INTO embeddings_table (id, embedding, content)
                VALUES ($1, $2, $3);
            `;
      await client.query(query, [data.id, embeddingString, data.content]);
    }
    console.log('Embeddings uploaded to AlloyDB successfully.');
  } catch (err) {
    console.error('Error uploading embeddings to AlloyDB:', err);
  } finally {
    await client.end();
  }
}

async function vectorSearch(queryEmbedding: number[]): Promise<void> {
  try {
    await client.connect();
    const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;
    const query = `
            SELECT id, content, embedding <-> $1 AS distance
            FROM embeddings_table
            ORDER BY distance
            LIMIT 5;
        `;
    const result = await client.query(query, [queryEmbeddingString]);
    console.log('Vector Search Results:', result.rows);
  } catch (err) {
    console.error('Error performing vector search:', err);
  } finally {
    await client.end();
  }
}

async function naturalLanguageSearch(
  naturalLanguageQuery: string,
): Promise<void> {
  try {
    const queryEmbedding = await generateTextEmbeddings(naturalLanguageQuery);
    await vectorSearch(queryEmbedding);
  } catch (error) {
    console.error('Error performing natural language search:', error);
  }
}

async function main(): Promise<void> {
  const embeddingsData = await processFiles(FOLDER_PATH);
  await uploadToAlloyDB(embeddingsData);

  // Natural Language Search Example
  const searchQuery = 'Find images of cats or documents about programming';
  await naturalLanguageSearch(searchQuery);
}

main();
