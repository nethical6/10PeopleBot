import { Bot } from "../bot";

export const giveUserRole = async (memberId: string, interests: string[], bot: Bot) => {
    const guild = bot.guild;
    if(!guild) return
    const member = await guild.members.fetch(memberId).catch((err) => {
        console.error(`Failed to fetch member ${memberId}:`, err);
        return null;
    });
    
    if (!member) {
        console.error(`Member ${memberId} not found in guild ${guild.id}`);
        return;
    }

    for (const interest of interests) {
        let role = guild.roles.cache.find(
        (r) => r.name.toLowerCase() === interest.toLowerCase()
        );
        if (!role) {
        try {
            role = await guild.roles.create({
            name: interest,
            color: "Random",
            reason: "Interest role created by bot",
            });
        } catch (err) {
            console.error(`Failed to create role ${interest} in guild ${guild.id}:`, err);
            continue;
        }}

        try {
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
            }
            //remove roles that are not in the interests
            const rolesToRemove = member.roles.cache.filter(
                (r) => r.id !== guild.id && // Exclude @everyone
                r.name !== role.name && // Exclude the current role
                !interests.includes(r.name) // Exclude roles that are not in the interests
            );
            if (rolesToRemove.size > 0) {
                await member.roles.remove(rolesToRemove);
            }
        } catch (err) {
            console.error(`Failed to add role ${role.name} to user ${memberId}:`, err);
        }
    }
}

