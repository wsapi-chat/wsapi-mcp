import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  getUserSchema,
  updateMyProfileSchema,
  setPresenceSchema,
  setPrivacySettingSchema,
  bulkCheckUsersSchema,
} from "../validation/schemas.js";
import { READ, SET } from "./annotations.js";

const logger = createLogger("user-tools");

export const getMyProfile: ToolHandler = {
  name: "whatsapp_get_my_profile",
  description:
    "Get the connected number's own profile: name, about text and picture. Read-only. Returns the profile.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting my profile");
    const result = await wsapiClient.get("/users/me/profile");
    return { success: true, profile: result };
  },
};

export const updateMyProfile: ToolHandler = {
  name: "whatsapp_update_my_profile",
  description:
    "Change the connected number's own display name, about text or picture. Contacts see the change. Only the fields you pass are updated. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Display name" },
      status: { type: "string", description: "Status text" },
      picture: {
        type: "string",
        description: "Base64-encoded JPEG profile picture",
      },
    },
  },
  handler: async (args: any) => {
    const input = validateInput(updateMyProfileSchema, args);
    logger.info("Updating my profile");
    await wsapiClient.put("/users/me/profile", input);
    return { success: true, message: "Profile updated successfully" };
  },
};

export const setPresence: ToolHandler = {
  name: "whatsapp_set_presence",
  description:
    "Set this account as available or unavailable. Available makes it show online to contacts; for a typing indicator in one chat, use whatsapp_set_chat_presence. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      presence: {
        type: "string",
        enum: ["available", "unavailable"],
        description: "Presence state",
      },
    },
    required: ["presence"],
  },
  handler: async (args: any) => {
    const input = validateInput(setPresenceSchema, args);
    logger.info("Setting presence", { presence: input.presence });
    await wsapiClient.put("/users/me/presence", { presence: input.presence });
    return { success: true, message: "Presence updated" };
  },
};

export const getPrivacySettings: ToolHandler = {
  name: "whatsapp_get_privacy_settings",
  description:
    "Get the account's privacy settings: who can see last seen, profile picture, about, groups and read receipts. Read-only. Returns the settings.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting privacy settings");
    const result = await wsapiClient.get("/users/me/privacy");
    return { success: true, privacy: result };
  },
};

export const setPrivacySetting: ToolHandler = {
  name: "whatsapp_set_privacy_setting",
  description:
    "Change one privacy setting of the account, for example who can see the profile picture. Applies immediately to all contacts. Returns the updated settings.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      setting: {
        type: "string",
        enum: [
          "groupadd",
          "last",
          "status",
          "profile",
          "readreceipts",
          "online",
          "calladd",
        ],
        description: "Privacy setting to update",
      },
      value: {
        type: "string",
        enum: [
          "all",
          "contacts",
          "contact_blacklist",
          "match_last_seen",
          "known",
          "none",
        ],
        description: "Privacy level",
      },
    },
    required: ["setting", "value"],
  },
  handler: async (args: any) => {
    const input = validateInput(setPrivacySettingSchema, args);
    logger.info("Setting privacy", { setting: input.setting });
    const result = await wsapiClient.put("/users/me/privacy", input);
    return { success: true, privacy: result };
  },
};

export const checkUser: ToolHandler = {
  name: "whatsapp_check_user",
  description:
    "Check whether one phone number has WhatsApp, before sending to it. Read-only. Pass the number with country code, digits only. Returns whether it is registered and its user JID. For many numbers at once, use whatsapp_bulk_check_users.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string", description: "Phone number (e.g. 1234567890)" },
    },
    required: ["phone"],
  },
  handler: async (args: any) => {
    const input = validateInput(getUserSchema, args);
    logger.info("Checking user", { phone: input.phone });
    const result = await wsapiClient.get(`/users/${input.phone}/check`);
    return { success: true, ...result };
  },
};

export const bulkCheckUsers: ToolHandler = {
  name: "whatsapp_bulk_check_users",
  description:
    "Check many phone numbers at once for WhatsApp accounts. Read-only. Pass numbers with country code, digits only. Returns whether each number is registered, with its user JID.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      phones: {
        type: "array",
        items: { type: "string" },
        description: "List of phone numbers to check",
      },
    },
    required: ["phones"],
  },
  handler: async (args: any) => {
    const input = validateInput(bulkCheckUsersSchema, args);
    logger.info("Bulk checking users", { count: input.phones.length });
    const result = await wsapiClient.post("/users/check", {
      phones: input.phones,
    });
    return { success: true, results: result };
  },
};

export const getUserProfile: ToolHandler = {
  name: "whatsapp_get_user_profile",
  description:
    "Get another user's public profile by phone number: name, about text, picture and business status, as far as their privacy settings allow. Read-only. Returns the profile.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string", description: "Phone number (e.g. 1234567890)" },
    },
    required: ["phone"],
  },
  handler: async (args: any) => {
    const input = validateInput(getUserSchema, args);
    logger.info("Getting user profile", { phone: input.phone });
    const result = await wsapiClient.get(`/users/${input.phone}/profile`);
    return { success: true, profile: result };
  },
};

export const userTools = {
  getMyProfile,
  updateMyProfile,
  setPresence,
  getPrivacySettings,
  setPrivacySetting,
  checkUser,
  bulkCheckUsers,
  getUserProfile,
};
