import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import { Bot } from "../bot";
import { GUILD_ID } from "../constants";

export const GuildMemberLeaveHandler = async (bot: Bot,member: GuildMember | PartialGuildMember) => {
    const guild = bot.client.guilds.cache.get(GUILD_ID);

    console.log(`Member left: ${member.user.tag} (${member.id})`);
    const groupId = await bot.db.getJoinedGroupId(member.id)
    if(groupId===null) return;

    const channelData = await bot.db.getGroupById(groupId); 
    const channel = await guild?.channels.fetch(groupId).catch(() => null);

    if (!channel || !guild) return;
    const leaveEmbed = new EmbedBuilder()
        .setTitle("A member has left the server...")
        .setDescription(
          `${member.user.tag} has left the server. A new member might be joining soon!`
        ) 
        .setColor("#FF5555") 
        .setTimestamp();
    channelData.remaining_members = channelData.remaining_members.filter((id: string) => id !== member.id);
    await bot.db.updateGroupMembers(groupId, channelData.remaining_members);
    if(channel.isTextBased()){
        await channel.send({ embeds: [leaveEmbed] });
    }
    await bot.db.upsertToUserProfile(member.id, { joined_group: null });
}