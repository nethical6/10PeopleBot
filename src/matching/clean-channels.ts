import { Bot } from "../bot";
import { CLEANUP_EXCEPTIONS } from "../constants";

export const cleanEmptyChannels = async (bot: Bot) => {
    bot.client.channels.cache.forEach(async (channel) => {
        if (channel.isTextBased() && !CLEANUP_EXCEPTIONS.includes(channel.id)) {
            const members = await bot.db.getAllGroupMembers(channel.id);
            if (members?.length === 0) {
                await channel.delete("Cleaning up empty channels");
                await bot.db.deleteGroup(channel.id); 
            }
        }
    });
};
