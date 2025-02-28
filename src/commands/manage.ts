/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { CommandInt } from "../interfaces/commands/CommandInt";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleResetLevels } from "../modules/commands/subcommands/manage/handleResetLevels";
import { handleResetStars } from "../modules/commands/subcommands/manage/handleResetStars";
import { handleSuggestion } from "../modules/commands/subcommands/manage/handleSuggestion";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";

export const manage: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("manage")
    .setDescription("Commands for managing your server.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("resetlevels")
        .setDescription("Reset the leaderboard for your server.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("resetstars")
        .setDescription("Reset the star counts for your server.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("suggestion")
        .setDescription("Approve or deny a suggestion.")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("The action to take on the suggestion.")
            .addChoice("approve", "approve")
            .addChoice("deny", "deny")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The message id of the suggestion to update.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("The reason for approving/denying the suggestion.")
            .setRequired(true)
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subCommand = interaction.options.getSubcommand();

      switch (subCommand) {
        case "resetlevels":
          await handleResetLevels(Becca, interaction, config);
          break;
        case "resetstars":
          await handleResetStars(Becca, interaction, config);
          break;
        case "suggestion":
          await handleSuggestion(Becca, interaction, config);
          break;
        default:
          await interaction.editReply({
            content: Becca.responses.invalidCommand,
          });
          break;
      }
    } catch (err) {
      const errorId = await beccaErrorHandler(
        Becca,
        "manage group command",
        err,
        interaction.guild?.name
      );
      await interaction
        .reply({
          embeds: [errorEmbedGenerator(Becca, "manage group", errorId)],
          ephemeral: true,
        })
        .catch(
          async () =>
            await interaction.editReply({
              embeds: [errorEmbedGenerator(Becca, "manage group", errorId)],
            })
        );
    }
  },
};
