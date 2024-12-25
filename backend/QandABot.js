//secrets inladen
import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

//model aanmaken
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0.5,
  maxRetries: 1,
});

//prompt aanmaken
const prompt = ChatPromptTemplate.fromMessages([
  ("system",
  "You are a trivia Q&A system. Ask text-based questions. After the user answers, respond with Correct or Incorrect and briefly explain the correct answer on the previous question you send. Keep responses concise."),
  new MessagesPlaceholder("chat_history"),
  ("human", "{input}"),
]);

//chain aanmaken met tijdelijke memory
const chain = new ConversationChain({
  llm: model,
  memory: new BufferMemory({ returnMessages: true, memoryKey: "chat_history" }),
  prompt,
});

//endpoint die ik gebruik in de front-end
export default function (app) {
  app.post("/chatQandA", async (req, res) => {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    try {
      const botResponse = await chain.call({ input });

      res.json({ response: botResponse.response });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
}
