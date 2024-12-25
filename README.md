# AI POC Using Langchain and GenAI

## 1. Chat Bot

**File:** [./backend/chatBot.js](./backend/chatBot.js)  
**Model:** The chatbot uses GenAI (Google AI)  
**POC Video:** [Watch here](https://imgur.com/a/langchain-chatbot-poc-1vMpVQG)

### Functionalities:

- **ChatMemory:** Chat history is stored in a Redis database, preserving history across restarts or chat switches.
- **Agents and Tools:** Utilizes tools like "Trivaliy" for real-time information such as weather or recent news. Also includes a web scraper tool to answer specific input questions.
- **Agent Configuration:** The model, prompt, chat history, tools, and input are provided to the Agent.

## 2. Q&A Bot

**File:** [./backend/QandABot.js](./backend/QandABot.js)  
**Model:** The Q&A bot uses GenAI (Google AI)  
**POC Video:** [Watch here](https://imgur.com/a/langchain-q-abot-poc-BuSVIOM)

### Functionalities:

- **Buffer Memory:** Since this involves individual question-and-answer prompts, chat history is not stored in the database but as buffer memory.
- **Conversation Chain:** The bot uses a conversation chain where the model, prompt, chat history, and input are provided.
- **Front-end:** Connected to a simple front-end where the user can select a question category from a dropdown. The bot then generates a question, and the user can provide an answer, to which the bot responds with "Correct" or "Incorrect" along with a brief explanation.