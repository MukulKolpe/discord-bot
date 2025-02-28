import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";

import { BeccaInt } from "../interfaces/BeccaInt";

import { beccaErrorHandler } from "./beccaErrorHandler";
import { beccaLogHandler } from "./beccaLogHandler";

/**
 * Takes both the commands and contexts, parses the `data` properties as needed,
 * and builds an array of all command data. Then, posts the data to the Discord endpoint
 * for registering commands.
 *
 * Will register commands globally if in a production environment, otherwise defaults to the
 * home guild only.
 *
 * @param {BeccaInt} Becca Becca's Discord instance.
 * @returns {boolean} True if the commands were registered, false on error.
 */
export const registerCommands = async (Becca: BeccaInt): Promise<boolean> => {
  try {
    const rest = new REST({ version: "9" }).setToken(Becca.configs.token);

    const commandData: {
      name: string;
      description?: string;
      type?: number;
      options?: APIApplicationCommandOption[];
    }[] = [];

    Becca.commands.forEach((command) =>
      commandData.push(command.data.toJSON())
    );
    Becca.contexts.forEach((context) => commandData.push(context.data));
    if (process.env.NODE_ENV === "production") {
      beccaLogHandler.log("debug", "registering commands globally!");
      await rest.put(Routes.applicationCommands(Becca.configs.id), {
        body: commandData,
      });
    } else {
      beccaLogHandler.log("debug", "registering to home guild only");
      await rest.put(
        Routes.applicationGuildCommands(
          Becca.configs.id,
          Becca.configs.homeGuild
        ),
        { body: commandData }
      );
    }
    return true;
  } catch (err) {
    await beccaErrorHandler(Becca, "slash command register", err);
    return false;
  }
};
