import dotenv from "dotenv";
import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

dotenv.config();

const app = express();
const port = process.env.HOST_PORT || 3000;
app.use(express.json());

const chatMemories = {};

//model aanmaken
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 1,
  apiKey: process.env.GOOGLE_API_KEY,
});

//prompt aanmaken
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that keeps answers short."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

//chain aanmaken met memory, gebonden aan chatId
function getConversationChain(chatId) {
  if (!chatMemories[chatId]) {
    chatMemories[chatId] = new BufferMemory({ returnMessages: true, memoryKey: "history" });
  }

  return new ConversationChain({
    llm: model,
    memory: chatMemories[chatId],
    prompt: chatPrompt,
  });
}

//endpoint die ik gebruik in postman
app.post("/chat", async (req, res) => {
  const { chatId, input  } = req.body;

  if (!chatId || !input) {
    return res.status(400).json({ error: "Input and chatId are required" });
  }

  try {
    const chain = getConversationChain(chatId);
    const botResponse = await chain.call({ input });

    res.json({ response: botResponse.response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



// call naar: http://localhost:3000/chat
// body met: { "chatId": "1", "input": "Hi my name is mattijs" }
// AI output: { "response": "Hi Mattijs.\n" }
// body met: { "chatId": "1", "input": "What was my name again?" }
// AI output: { "response": "Mattijs.\n" }

// call naar: http://localhost:3000/chat
// body met: { "chatId": "2", "input": "Hi my name is bert" }
// AI output: { "response": "Hi Bert.\n" }
// body met: { "chatId": "2", "input": "What was my name again?" }
// AI output: { "response": "Bert.\n" }
