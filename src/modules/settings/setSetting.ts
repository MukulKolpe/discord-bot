/* eslint-disable no-case-declarations */
import { ServerModelInt } from "../../database/models/ServerModel";
import { BeccaInt } from "../../interfaces/BeccaInt";
import { SettingsTypes } from "../../interfaces/settings/SettingsTypes";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { beccaLogHandler } from "../../utils/beccaLogHandler";

/**
 * This handles all of the logic for setting a server's config. Depending on
 * the type of the data stored, it will handle the array or string logic
 * as necessary.
 *
 * @param {BeccaInt} Becca Becca's Discord instance.
 * @param {string} serverID The ID of the server to modify settings for.
 * @param {string} serverName The current name of the server.
 * @param {SettingsTypes} key The name of the setting to modify.
 * @param {string} value The value to change the setting to.
 * @param {ServerModelInt} server The server config entry in the database.
 * @returns {ServerModelInt | null} ServerModel on success and null on error.
 */
export const setSetting = async (
  Becca: BeccaInt,
  serverID: string,
  serverName: string,
  key: SettingsTypes,
  value: string,
  server: ServerModelInt
): Promise<ServerModelInt | null> => {
  try {
    const parsedValue = value.replace(/\D/g, "");

    switch (key) {
      case "anti_links":
      case "permit_links":
        if (value === "all") {
          server[key] = ["all"];
          break;
        }
        if (server[key].includes(parsedValue)) {
          const index = server[key].indexOf(parsedValue);
          server[key].splice(index, 1);
        } else {
          server[key].push(parsedValue);
        }
        server.markModified(key);
        break;
      case "hearts":
      case "blocked":
      case "self_roles":
      case "link_roles":
      case "level_ignore":
        if (server[key].includes(parsedValue)) {
          const index = server[key].indexOf(parsedValue);
          server[key].splice(index, 1);
        } else {
          server[key].push(parsedValue);
        }
        server.markModified(key);
        break;
      case "allowed_links":
        if (server[key].includes(value)) {
          const index = server[key].indexOf(value);
          server[key].splice(index, 1);
        } else {
          server[key].push(value);
        }
        server.markModified(key);
        break;
      case "level_roles":
        const [level, role] = value.split(" ");
        const hasSetting = server[key].findIndex(
          (el) =>
            el.role === role.replace(/\D/g, "") &&
            el.level === parseInt(level, 10)
        );
        if (hasSetting === -1) {
          server[key].push({
            level: parseInt(level, 10),
            role: role.replace(/\D/g, ""),
          });
        } else {
          server[key].splice(hasSetting, 1);
        }
        server.markModified(key);
        break;
      case "custom_welcome":
      case "levels":
      case "thanks":
      case "link_message":
      case "leave_message":
        server[key] = value;
        break;
      case "welcome_channel":
      case "log_channel":
      case "level_channel":
      case "suggestion_channel":
      case "muted_role":
      case "join_role":
      case "report_channel":
        server[key] = value.replace(/\D/g, "");
        break;
      default:
        beccaLogHandler.log("error", "the setSettings logic broke horribly.");
    }

    await server.save();
    return server;
  } catch (err) {
    await beccaErrorHandler(Becca, "set setting module", err, serverName);
    return null;
  }
};
