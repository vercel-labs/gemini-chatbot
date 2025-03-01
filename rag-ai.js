const fs = require('fs').promises;
const path = require('path');

const aiplatform = require('@google-cloud/aiplatform');
const { VertexAI } = require('@google-cloud/vertexai');
const { Client } = require('pg');

// --- Configuration ---
const LOCATION = 'europe-central2';
const TEXT_MODEL_NAME = 'text-multilingual-embedding-002';
const RETRIEVAL_DOCUMENT_TASK_TYP = 'RETRIEVAL_DOCUMENT';
const RETRIEVAL_QUERY_TASK_TYPE = 'RETRIEVAL_QUERY';
const IMAGE_MODEL_NAME = 'multimodalembedding';
const ALLOYDB_CONNECTION_STRING = 'YOUR_ALLOYDB_CONNECTION_STRING';
const FOLDER_PATH = './your_document_folder';
const PROJECT_ID = 'gen-lang-client-0612957264';
const TEXTS = 'dupa śmierdzi';
const DIMENSIONALITY = 512;

// --- Vertex AI Setup ---
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const textModel = vertexAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
const imageModel = vertexAI.getGenerativeModel({ model: IMAGE_MODEL_NAME });

// --- AlloyDB Setup ---
const client = new Client({
  connectionString: ALLOYDB_CONNECTION_STRING,
});

async function generateVectors() {
  const { PredictionServiceClient } = aiplatform.v1;
  const { helpers } = aiplatform; // helps construct protobuf.Value objects.
	const clientOptions = {
		// sprawdzić inne endpointy
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
	};
	
	// sprawdzić jak powinna być lokalizacja
  const location = 'us-central1';
  const endpoint = `projects/${PROJECT_ID}/locations/${location}/publishers/google/models/${TEXT_MODEL_NAME}`;

  async function callPredict() {
    const instances = TEXTS.split(';').map((e) =>
      helpers.toValue({ content: e, task_type: RETRIEVAL_DOCUMENT_TASK_TYP }),
    );
    const parameters = helpers.toValue(
      DIMENSIONALITY > 0 ? { outputDimensionality: DIMENSIONALITY } : {},
    );
    const request = { endpoint, instances, parameters };
    const predictionClient = new PredictionServiceClient(clientOptions);
    const [response] = await predictionClient.predict(request);
    const predictions = response.predictions;
    const embeddings = predictions.map((p) => {
      const embeddingsProto = p.structValue.fields.embeddings;
      const valuesProto = embeddingsProto.structValue.fields.values;
      return valuesProto.listValue.values.map((v) => v.numberValue);
    });
    console.log('Got embeddings: \n' + JSON.stringify(embeddings));
  }

  try {
    await callPredict();
  } catch (e) {
    console.log(e);
  }
}

generateVectors();
// async function generateTextEmbeddings(text: string): Promise<number[]> {
//   const embeddingsResponse = await textModel.generateEmbeddings({
//     contents: [text],
//   });
//   return embeddingsResponse[0].values;
// }

// async function generateImageEmbeddings(
//   imagePath: string,
// ): Promise<number[] | null> {
//   try {
//     const fileContent = await fs.readFile(imagePath, { encoding: 'base64' });
//     const embeddingsResponse = await imageModel.generateEmbeddings({
//       contents: [
//         {
//           inlineData: {
//             mimeType: 'image/jpeg', // Adjust mime type as needed
//             data: fileContent,
//           },
//         },
//       ],
//     });
//     return embeddingsResponse[0].values;
//   } catch (error) {
//     console.error('Error generating image embeddings:', error);
//     return null;
//   }
// }

// async function processFiles(folderPath: string): Promise<EmbeddingData[]> {
//   const files = await fs.readdir(folderPath);
//   const embeddingsData: EmbeddingData[] = [];

//   for (const file of files) {
//     const filePath = path.join(folderPath, file);
//     const fileStat = await fs.stat(filePath);

//     if (fileStat.isFile()) {
//       const fileExtension = path.extname(file).toLowerCase();
//       let embedding: number[] | null;
//       let content: string;

//       if (['.txt', '.pdf', '.docx'].includes(fileExtension)) {
//         content = await fs.readFile(filePath, 'utf-8');
//         embedding = await generateTextEmbeddings(content);
//       } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
//         embedding = await generateImageEmbeddings(filePath);
//         content = 'image';
//       }

//       if (embedding) {
//         embeddingsData.push({
//           id: file,
//           embedding: embedding,
//           content: content,
//         });
//       }
//     }
//   }
//   return embeddingsData;
// }

// async function uploadToAlloyDB(embeddingsData: EmbeddingData[]): Promise<void> {
//   try {
//     await client.connect();
//     for (const data of embeddingsData) {
//       const embeddingString = `[${data.embedding.join(',')}]`;
//       const query = `
//                 INSERT INTO embeddings_table (id, embedding, content)
//                 VALUES ($1, $2, $3);
//             `;
//       await client.query(query, [data.id, embeddingString, data.content]);
//     }
//     console.log('Embeddings uploaded to AlloyDB successfully.');
//   } catch (err) {
//     console.error('Error uploading embeddings to AlloyDB:', err);
//   } finally {
//     await client.end();
//   }
// }

// async function vectorSearch(queryEmbedding: number[]): Promise<void> {
//   try {
//     await client.connect();
//     const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;
//     const query = `
//             SELECT id, content, embedding <-> $1 AS distance
//             FROM embeddings_table
//             ORDER BY distance
//             LIMIT 5;
//         `;
//     const result = await client.query(query, [queryEmbeddingString]);
//     console.log('Vector Search Results:', result.rows);
//   } catch (err) {
//     console.error('Error performing vector search:', err);
//   } finally {
//     await client.end();
//   }
// }

// async function naturalLanguageSearch(
//   naturalLanguageQuery: string,
// ): Promise<void> {
//   try {
//     const queryEmbedding = await generateTextEmbeddings(naturalLanguageQuery);
//     await vectorSearch(queryEmbedding);
//   } catch (error) {
//     console.error('Error performing natural language search:', error);
//   }
// }

// async function main(): Promise<void> {
//   const embeddingsData = await processFiles(FOLDER_PATH);
//   await uploadToAlloyDB(embeddingsData);

//   // Natural Language Search Example
//   const searchQuery = 'Find images of cats or documents about programming';
//   await naturalLanguageSearch(searchQuery);
// }

// main();
