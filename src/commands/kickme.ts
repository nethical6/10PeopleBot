import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const kickMeComamnd = {
    data: new SlashCommandBuilder()
        .setName('kickme')
        .setDescription('Kick yourself out of a channel'),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: false });
        
        // Implement your votekick logic here
        await interaction.editReply(`User ${interaction.user.tag} has left this group.`);
    }
};