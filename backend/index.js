import express from 'express';
import cors from 'cors';

//bots inladen
import chatBot from "./chatBot.js"
import QandABot from './QandABot.js';

//app aanmaken
const app = express();
const port = 3000;
app.use(cors({
  origin: 'http://localhost:8080'
}));
app.use(express.json());

//server aanmaken
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//bots inlezen
chatBot(app);
QandABot(app);