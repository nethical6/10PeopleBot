import { Interaction, MessageFlags } from "discord.js";
import { Bot } from "../bot";
import { Matcher } from "../matching/matcher";
import { giveUserRole } from "../utils/discord-utils";
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
    giveUserRole(interaction.user.id, interaction.values, bot);
      await interaction.editReply({
            content: `✅ Your interests have been saved! You can now find a group.`,
      });
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
