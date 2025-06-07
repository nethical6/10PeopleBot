import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { CommandHandler } from './commands/command-handler';

dotenv.config();

const commandHandler = new CommandHandler();

const commands = commandHandler.getCommands().map(command => command.data);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();