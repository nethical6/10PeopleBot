import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import { Bot } from "../bot";
import { GUILD_ID } from "../constants";

export const GuildMemberLeaveHandler = async (bot: Bot,member: GuildMember | PartialGuildMember) => {
    const guild = bot.guild;

    const groupId = await bot.db.removeMemberFromGroup(member as GuildMember)
    if(groupId===null) return;

    const channel = await guild?.channels.fetch(groupId).catch(() => null);

    if (!channel) return;
    const leaveEmbed = new EmbedBuilder()
        .setTitle("A member has left the server...")
        .setDescription(
          `${member.user.tag} has left the server. A new member might be joining soon!`
        ) 
        .setColor("#FF5555") 
        .setTimestamp();
    if(channel.isTextBased()){
        await channel.send({ embeds: [leaveEmbed] });
    }
}