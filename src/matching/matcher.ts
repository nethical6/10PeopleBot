import { Bot } from "../bot";
import { jaccard } from "../utils/jaccard";
import {
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

export const Matcher = async (bot: Bot) => {
  const allWaiters = await bot.db.getWaitingPool();
  console.log(`Found ${allWaiters.length} users in waiting pool`);
  if (allWaiters === null) {
    return;
  }

  // Match waiters with existing groups based on interests
  const groups = await bot.db.getActiveGroups();
  let existingGroups: { id: string; members: string[], isFull:boolean }[] = [];
  for (const group of groups) {
    const members = await bot.db.getAllGroupMembers(group.group_id)
    if(members===null) continue
    existingGroups.push({
      id: group.group_id,
      members: members,
      isFull: false
    });
  }
  let matchedUserIds: string[] = [];
  for (const waiter of allWaiters) {
    if (matchedUserIds.includes(waiter)) continue; // Skip if already matched
    const bannedGroups = await bot.db.getBannedGroups(waiter)

    const waiterInterests = await bot.db.getUserInterests(waiter);
    for (const group of existingGroups) {
      if (matchedUserIds.includes(waiter) || bannedGroups.includes(group.id)) break; 
      let averageGroupMatch = 0;
      for (const member of group.members) {
        const memberInterest = await bot.db.getUserInterests(member);
        const match = jaccard(
          new Set(waiterInterests),
          new Set(memberInterest)
        );
        averageGroupMatch += match;
      }
      averageGroupMatch /= group.members.length;
      console.log(
        `Average match for group ${group.id} with waiter ${waiter}: ${averageGroupMatch}`
      );
      if (averageGroupMatch >= 0.3) {
        matchedUserIds.push(waiter);
        await bot.db.addUserToGroup(group.id,waiter)
        await addToDiscordGroup(bot, group.id, waiter, averageGroupMatch * 100);
        await bot.db.removeFromWaitingPool(waiter);
        group.members.push(waiter)
        existingGroups.push({
          id: group.id,
          members: group.members,
          isFull: group.members.length>=10
        });
        break; // Exit inner loop once matched
      }
    }

    //match with other waiters if none found in existing groups
    if (matchedUserIds.includes(waiter)) continue; // Skip if already matched
    if (allWaiters.length <= 1) continue; // No other waiters to match with
    for (const otherWaiter of allWaiters) {
      if (waiter === otherWaiter || matchedUserIds.includes(otherWaiter))
        continue;

      const otherInterests = await bot.db.getUserInterests(otherWaiter);
      const waiterInterestSet = new Set(waiterInterests);
      const otherInterestSet = new Set(otherInterests);
      const match = jaccard(
        new Set(waiterInterestSet),
        new Set(otherInterestSet)
      );

      if (match >= 0.3) {
        const topInterest = new Set(
          [...waiterInterestSet].filter((x) => otherInterestSet.has(x))
        );
        // Create a new group with matched users
        const interestsArr = Array.from(topInterest);
        const randomInterest =
          interestsArr[Math.floor(Math.random() * interestsArr.length)] ||
          "Group";
        const groupName = `${randomInterest}-${Math.floor(
          Math.random() * 10000
        )}`;
        const members: string[] = [waiter, otherWaiter];
        const channelId = await createGroup(
          bot,
          groupName,
          members,
          match * 100
        );

        if (channelId === null) return;
        matchedUserIds.push(waiter, otherWaiter);
        existingGroups.push({
          id: channelId,
          members: [waiter, otherWaiter],
          isFull: false
        });
        await bot.db.createGroup(channelId, members);
        for (const cleanupWaiter of [waiter, otherWaiter]) {
          await bot.db.removeFromWaitingPool(cleanupWaiter);
        }
        await bot.db.removeFromWaitingPool(otherWaiter);
        console.log(
          `Matched ${waiter} and ${otherWaiter} into group ${groupName}`
        );
        break; // Exit inner loop once matched
      }
    }
  }
};

const createGroup = async (
  bot: Bot,
  groupName: string,
  members: string[],
  matchPercentage: number
): Promise<string | null> => {
  const guild = await bot.guild?.fetch();
  if (!guild) return null;
  const memberObjects = await Promise.all(
    members.map(async (id) => await guild.members.fetch(id).catch(() => null))
  );

  // Filter out any null results from failed fetches
  const validMembers = memberObjects.filter(
    (member): member is NonNullable<typeof member> => member !== null
  );

  const channel = await guild.channels.create({
    name: groupName,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      ...validMembers.map((member) => ({
        id: member.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      })),
    ],
  });

  if (channel) {
    console.log(
      `Group ${groupName} created with members: ${members.join(", ")}`
    );
    if (channel.isTextBased()) {
      const welcomeEmbed = new EmbedBuilder()
        .setTitle("🎉 New Group Formed! 🎉")
        .setDescription(
          `Welcome! We've matched you based on your similar interests. More people might join soon!\n\n<@${members.join(
            ">, <@"
          )}>`
        )
        .addFields({
          name: "Match Rate",
          value: matchPercentage.toFixed(2) + "%",
        })
        .setFooter({ text: "Happy chatting!" })
        .setColor("#5865F2")
        .setTimestamp();

      await channel.send({ embeds: [welcomeEmbed] });
    }
    return channel.id;
  } else {
    console.error(`Failed to create group ${groupName}`);
    return null;
  }
};
const addToDiscordGroup = async (
  bot: Bot,
  groupId: string,
  userId: string,
  matchPercentage: number
) => {
  const guild = await bot.guild?.fetch();
  const channel = await guild?.channels.fetch(groupId).catch(() => null);
  const user = await guild?.members.fetch(userId).catch(() => null);

  if (!channel || !guild || !user) return;

  const welcomeEmbed = new EmbedBuilder()
    .setTitle("🎉 New Member Joined! 🎉")
    .setDescription(
      `Say hi to our new member <@${userId}>! We matched them based on their interests with this group.`
    )
    .addFields({ name: "Match Rate", value: matchPercentage.toFixed(2) + "%" })
    .setFooter({ text: "Happy chatting!" })
    .setColor("#5865F2")
    .setTimestamp();
  if (channel.type === ChannelType.GuildText) {
    await channel.permissionOverwrites.edit(user, {
      ViewChannel: true,
      SendMessages: true,
    });
    await channel.send({ embeds: [welcomeEmbed] });
  }
};
