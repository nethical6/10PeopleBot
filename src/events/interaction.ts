import { Interaction, MessageFlags } from "discord.js";
import { Bot } from "../bot";
import { Matcher } from "../matching/matcher";
import { giveUserRole } from "../utils/discord-utils";
import { voteKickCommand } from "../commands/votekick";
import { kickMeComamnd } from "../commands/kickme";
import { CommandHandler } from "../commands/command-handler";

const commandHandler = new CommandHandler();


/**
 * Handles interactions such as selecting interests and joining groups.
 * @param interaction - The interaction object from Discord.
 * @param bot - The instance of the Bot class.
 */
export const InteractionCreateHandler = async (
  interaction: Interaction,
  bot: Bot
) => {
      if (interaction.isChatInputCommand()) {
        const command = commandHandler.getCommand(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction, bot);
        } catch (error) {
            console.error(error);
        }
        return;
    }

  //handle the interaction for selecting interests
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "interest_menu"
  ) {
    await interaction.deferReply({ ephemeral: true });
    await bot.db.saveUserInterests(interaction.user.id, interaction.values);
    giveUserRole(interaction.user.id, interaction.values, bot);
      const embed = {
        title: "Interests Saved",
        description: "✅ Your interests have been saved! You can now find a group by pressing the **Find Group** button.\nMake sure to set your presence to \"online\" or \"idle\" to find groups quicker.",
        color: 0x57F287 
      };
      await interaction.editReply({
        embeds: [embed],
      });
  }

  // Handle the button interaction for joining a group
  if (interaction.isButton() && interaction.customId === "join_button") {
    await interaction.deferReply({ ephemeral: true });
    const id = await bot.db.getUsersGroupId(interaction.user.id)
    if(id!=null){
      const embed = {
        title: "Already in a Group",
        description: "❌ You can only join one group at a time.\nUse the `/kickme` command in your current group to exit it.",
        color: 0xFF5555
      };
      return interaction.editReply({
        embeds: [embed]
      });
    }
    const selected = await bot.db.getUserInterests(interaction.user.id);
    if (selected === null || selected.length === 0) {
      return interaction.editReply({
        content: "❌ Please select your interests from the menu first!",
      });
    }

    await bot.db.addToWaitingPool(interaction.user.id);

    return interaction.editReply({
      content: `🔥 You're in the waiting pool! We'll find a group for you shortly. You can chat in #general until then!`,
    });
  }
};
