import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../bot';

export const voteKickCommand = {
    data: new SlashCommandBuilder()
        .setName('votekickk')
        .setDescription('Kick out a user from channel via vote')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to kick out')
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, bot: Bot) => {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.editReply('User not found.');
            return;
        }

        // Implement your votekick logic here
        await interaction.editReply(`Vote to kick ${user.tag} has started!`);
    }
};