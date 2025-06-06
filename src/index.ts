import { Bot } from './bot';

const bot = new Bot();
bot.client.login(process.env.TOKEN);
