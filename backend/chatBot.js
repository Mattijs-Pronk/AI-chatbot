//secrets inladen
import dotenv from "dotenv";
dotenv.config();

//imports voor langchain
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";

//imports voor tools
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createRetrieverTool } from "langchain/tools/retriever";

//imports voor chatgeschiedenis
import { BufferMemory } from "langchain/memory";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";

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

//chatgeschiedenis ophalen
const upstashMessageHistory = new UpstashRedisChatMessageHistory({
  //"mysession" zou in een echte applicatie een unieke identifier zijn voor de openstaande chat
  sessionId: "mysession",
  config: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REST_TOKEN,
  },
});

//chatgeschiedenis opslaan
const memory = new BufferMemory({
  memoryKey: "chat_history",
  chatHistory: upstashMessageHistory,
});

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

//chatgeschiedenis formateren zodat chat_history het kan lezen
function formatChatHistory(historyString) {
  const lines = historyString.split("\n");
  const messages = [];
  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i].startsWith("Human:")) {
      messages.push({
        role: "human",
        content: lines[i].replace("Human: ", ""),
      });
    } else if (lines[i].startsWith("AI:")) {
      messages.push({ role: "ai", content: lines[i].replace("AI: ", "") });
    }
  }
  return messages;
}

//endpoint die ik gebruik in postman
export default function (app) {
  app.post("/chat", async (req, res) => {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    try {
      const chatHistory = await memory.loadMemoryVariables();
      const formattedHistory = formatChatHistory(
        chatHistory.chat_history || ""
      );

      const botResponse = await agentExecutor.invoke({
        input: input,
        chat_history: formattedHistory,
      });

      await memory.saveContext(
        { input: input },
        { output: botResponse.output }
      );

      res.json({ response: botResponse.output });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
}
