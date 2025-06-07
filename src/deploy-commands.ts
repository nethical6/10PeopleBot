import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { kickMeComamnd } from './commands/kickme';
import { voteKickCommand } from './commands/votekick';
dotenv.config();

const commands = [kickMeComamnd.data,voteKickCommand.data];

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