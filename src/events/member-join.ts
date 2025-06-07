import { GuildMember, PartialGuildMember } from "discord.js";
import { Bot } from "../bot";
import { giveUserRole } from "../utils/discord-utils";

export const GuildMemberJoinHandler = async (bot: Bot,member: GuildMember| PartialGuildMember) => {    
    // Check if the member has any interests set
    const interests = await bot.db.getUserInterests(member.id);
    if (interests && interests.length > 0) {
        // If interests are set, give the user roles based on their interests
        giveUserRole(member.id, interests, bot);
    }
}
