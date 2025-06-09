import { Client, GatewayIntentBits, Guild, Partials } from "discord.js";
import { MessageCreateHandler } from "./events/message";
import { InteractionCreateHandler } from "./events/interaction";
import { DatabaseService } from "./services/database-service";
import { BackgroundService } from "./services/background-service";
import { GuildMemberLeaveHandler } from "./events/member-leave";
import { GuildMemberJoinHandler } from "./events/member-join";

export class Bot {
  public client: Client;
  public db: DatabaseService;
  public guild?: Guild;
  private backgroundService: BackgroundService;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
      ],
      partials: [Partials.Channel],
    });

    this.setupEventHandlers();
    this.db = new DatabaseService();
    this.backgroundService = new BackgroundService(this);
  }

  setupEventHandlers() {
    this.client.once("ready", async () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
      this.backgroundService.startServices();
      this.guild = await this.client.guilds.fetch(
        process.env.GUILD_ID as string
      );
      
      // Leave any guilds that aren't the target guild
      this.client.guilds.cache.forEach(guild => {
        if (guild.id !== process.env.GUILD_ID) {
          console.log(`Leaving unauthorized guild: ${guild.name} (${guild.id})`);
          guild.leave();
        }
      });
    });
    // Handle new guild joins to immediately leave if it's not the target guild
    this.client.on("guildCreate", async (guild) => {
      if (guild.id !== process.env.GUILD_ID) {
        console.log(`Leaving unauthorized guild: ${guild.name} (${guild.id})`);
        await guild.leave();
      }
    });

    this.client.on("messageCreate", (msg) => MessageCreateHandler(msg, this));
    this.client.on("interactionCreate", (i) =>
      InteractionCreateHandler(i, this)
    );
    this.client.on("guildMemberRemove", (member) =>
      GuildMemberLeaveHandler(this, member)
    );
    this.client.on("guildMemberAdd", (member) => {
      GuildMemberJoinHandler(this, member);
    });
    // this.client.on('channelDelete', (channel) => channelDeleteHandler(channel, this));
  }

  cleanup() {
    this.backgroundService.cleanup();
  }
}
