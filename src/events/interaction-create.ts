import { Interaction, MessageFlags } from "discord.js";
import { Bot } from "../bot";
export const InteractionCreateHandler = async (
  interaction: Interaction,
  bot: Bot
) => {
    //handle the interaction for selecting interests
    if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "interest_menu"
  ) {
    bot.db.saveUserInterests(interaction.user.id, interaction.values);
    const guild = interaction.guild;
    if (guild) {
      for (const interest of interaction.values) {
        // Try to find a role with the same name as the interest value (case-insensitive)
        let role = guild.roles.cache.find(
          (r) => r.name.toLowerCase() === interest.toLowerCase()
        );
        if (!role) {
          // Create the role if it doesn't exist
          try {
            role = await guild.roles.create({
              name: interest,
              color: "Random",
              reason: "Interest role created by bot",
            });
          } catch (err) {
            console.error(
              `Failed to create role ${interest} in guild ${guild.id}:`,
              err
            );
            continue;
          }
        }
        try {
          const member = await guild.members.fetch(interaction.user.id);
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
          }
          const rolesToRemove = member.roles.cache.filter(
            (r) => r.name !== role.name && interaction.values.includes(r.name)
          );
            if (rolesToRemove.size > 0) {
                await member.roles.remove(rolesToRemove);
            }
        } catch (err) {
          console.error(
            `Failed to add role ${role.name} to user ${interaction.user.id}:`,
            err
          );
        }
      }
    }

    return interaction.reply({
      content: `✅ Your interests are set to: **${interaction.values.join(
        ", "
      )}**. \nNow press the "Find a Group" Button to start search!`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Handle the button interaction for joining a group
  if (interaction.isButton() && interaction.customId === "join_button") {
    const selected = await bot.db.getUserInterests(interaction.user.id);
    if (selected === null || selected.length === 0) {
      return interaction.reply({
        content: "❌ Please select your interests from the menu first!",
        flags: MessageFlags.Ephemeral,
      });
    }

    bot.db.addToWaitingPool(interaction.user.id);

    return interaction.reply({
      content: `🔥 You're in the waiting pool! We'll find a group for you shortly.`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
