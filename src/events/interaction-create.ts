import { Interaction, MessageFlags } from "discord.js";
import { Bot } from "../bot";
import { Matcher } from "../matching/matcher";
/**
 * Handles interactions such as selecting interests and joining groups.
 * @param interaction - The interaction object from Discord.
 * @param bot - The instance of the Bot class.
 */
export const InteractionCreateHandler = async (
  interaction: Interaction,
  bot: Bot
) => {
  console.log(
    `Interaction received: ${interaction.id} from user ${interaction.user.id} ${interaction.type}`
  );
  //handle the interaction for selecting interests
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "interest_menu"
  ) {
    await interaction.deferReply({ ephemeral: true });
    await bot.db.saveUserInterests(interaction.user.id, interaction.values);
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
            (r) =>
              r.id !== guild.id && // Exclude @everyone
              r.name !== role.name &&
              !interaction.values.includes(r.name)
          );
          if (rolesToRemove.size > 0) {
            await member.roles.remove(rolesToRemove);
          }
          await interaction.editReply({
            content: `✅ Your interests have been saved! You can now find a group.`,
          });
        } catch (err) {
          console.error(
            `Failed to add role ${role.name} to user ${interaction.user.id}:`,
            err
          );

          await interaction.editReply({
            content: `An Error occurred while selecting interests. Please try again later.`,
          });
        }
      }
    }
  }

  // Handle the button interaction for joining a group
  if (interaction.isButton() && interaction.customId === "join_button") {
    await interaction.deferReply({ ephemeral: true });
    const selected = await bot.db.getUserInterests(interaction.user.id);
    if (selected === null || selected.length === 0) {
      return interaction.editReply({
        content: "❌ Please select your interests from the menu first!",
      });
    }

    await bot.db.addToWaitingPool(interaction.user.id);

    return interaction.editReply({
      content: `🔥 You're in the waiting pool! We'll find a group for you shortly.`,
    });
  }
};
