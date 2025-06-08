import { ChannelType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { Bot } from "../bot";

export const kickMeComamnd = {
    data: new SlashCommandBuilder()
        .setName('kickme')
        .setDescription('Kick yourself out of a channel'),
    execute: async (interaction: ChatInputCommandInteraction,bot: Bot) => {
        if(!interaction.channel) return
        await interaction.deferReply({ ephemeral: false });

        await interaction.editReply(`User ${interaction.user.tag} has left this group.`);
        await bot.db.removeMemberFromGroup(interaction.member as GuildMember)
        // Implement your votekick logic here
        
        if (interaction.channel.type === ChannelType.GuildText) {
            await interaction.channel.permissionOverwrites.edit(interaction.user, {
              ViewChannel: false,
              SendMessages: false,
            });
        }
    }
};