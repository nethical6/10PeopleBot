import { Client, GatewayIntentBits, Guild, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { MessageCreateHandler } from './events/message-create';
import { InteractionCreateHandler } from './events/interaction-create';
import { DatabaseService } from './services/database-service';
import { Matcher } from './matching/matcher';
dotenv.config();

export class Bot {
    public client: Client;
    public db: DatabaseService;
    private isMatcherRunning: boolean = false;
    private matcherTimeout?: NodeJS.Timeout;


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
            this.runMatcher();

        });
        this.client.on('messageCreate', (msg) => MessageCreateHandler(msg, this));
        this.client.on('interactionCreate', (i) => InteractionCreateHandler(i, this));
        // this.client.on('guildMemberRemove', (member) => guildMemberRemoveHandler(member, this));
        // this.client.on('channelDelete', (channel) => channelDeleteHandler(channel, this));
    }

    private async runMatcher() {
        if (this.isMatcherRunning) {
            return;
        }

        try {
            this.isMatcherRunning = true;
            await Matcher(this);
        } catch (error) {
            console.error("Matcher error:", error);
        } finally {
            this.isMatcherRunning = false;
            // Schedule next run after current one finishes
            this.matcherTimeout = setTimeout(() => this.runMatcher(), 5000);
        }
    }
    
    cleanup() {
        if (this.matcherTimeout) {
            clearTimeout(this.matcherTimeout);
        }
    }
}
