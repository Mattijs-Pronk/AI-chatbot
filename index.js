//secrets inladen
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

//imports voor tools
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createRetrieverTool } from "langchain/tools/retriever";

const app = express();
const port = process.env.HOST_PORT || 3000;
app.use(express.json());

// chat geschiedenis map
const chatHistories = new Map();

const loader = new CheerioWebBaseLoader(
  "https://js.langchain.com/docs/how_to/#langchain-expression-language-lcel"
);
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
});

const splitDocs = await splitter.splitDocuments(docs);

const embeddings = new GoogleGenerativeAIEmbeddings();

const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

const retriever = vectorStore.asRetriever({
  k: 2,
});

//tools aanmaken
const searchTool = new TavilySearchResults();
const retrieverTool = createRetrieverTool(retriever, {
  name: "lcel_search",
  description:
    "Use this tool when searching for information about Lanchain Expression Language (LCEL)",
});
const tools = [retrieverTool, searchTool];

//model aanmaken
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0.5,
  maxRetries: 1,
});

//prompt aanmaken
const prompt = ChatPromptTemplate.fromMessages([
  ("system", "You are a helpful assistant that keeps the answers short."),
  new MessagesPlaceholder("chat_history"),
  ("human", "{input}"),
  new MessagesPlaceholder("agent_scratchpad"),
]);

//agent aanmaken met model, tools en prompt
const agent = createToolCallingAgent({
  llm: model,
  tools,
  prompt,
});

//agentExecutor aanmaken
const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

//endpoint die ik gebruik in postman
app.post("/chat", async (req, res) => {
  const { chatId, input } = req.body;

  if (!chatId || !input) {
    return res.status(400).json({ error: "Input and chatId are required" });
  }

  if (!chatHistories.has(chatId)) {
    chatHistories.set(chatId, []);
  }
  const chatHistory = chatHistories.get(chatId);

  try {
    const botResponse = await agentExecutor.invoke({
      input: input,
      chat_history: chatHistory,
    });

    chatHistory.push(new HumanMessage(input));
    chatHistory.push(new AIMessage(botResponse.output));

    res.json({ response: botResponse.output });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
