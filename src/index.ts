import { Bot } from './bot';
import dotenv from "dotenv";
dotenv.config();
const bot = new Bot();
bot.client.login(process.env.TOKEN);
