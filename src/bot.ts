import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { MessageCreateHandler } from './events/message-create';
import { InteractionCreateHandler } from './events/interaction-create';
import { DatabaseService } from './services/database-service';
dotenv.config();

export class Bot {
    public client: Client;
    public db: DatabaseService

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            partials: [Partials.Channel]
        });

        this.setupEventHandlers();
        this.db = new DatabaseService();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);
        });
        this.client.on('messageCreate', (msg) => MessageCreateHandler(msg, this));
        this.client.on('interactionCreate', (i) => InteractionCreateHandler(i, this));
        // this.client.on('guildMemberRemove', (member) => guildMemberRemoveHandler(member, this));
        // this.client.on('channelDelete', (channel) => channelDeleteHandler(channel, this));
    }

    // Other methods like handleInteraction, sendInterestMenu, etc...
}
