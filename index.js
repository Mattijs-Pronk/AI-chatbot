import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY
});

// Define the Chat Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  { role: "system", content: "You are a helpful assistant that translates {input_language} to {output_language}." },
  { role: "user", content: "{input}" },
]);

const chain = prompt.pipe(llm);

const response1 = await chain.invoke({
  input_language: "English",
  output_language: "French",
  input: "I love programming.",
});

// Log the first translation result
console.log("Translation:", response1.content);