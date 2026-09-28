import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  createNewsletterSchema,
  getNewsletterSchema,
  getNewsletterByInviteSchema,
  setNewsletterSubscriptionSchema,
  muteNewsletterSchema,
} from "../validation/schemas.js";
import { CREATE, READ, SET } from "./annotations.js";

const logger = createLogger("newsletter-tools");

export const listNewsletters: ToolHandler = {
  name: "whatsapp_list_newsletters",
  description:
    "List the channels (newsletters) this number follows or owns. Read-only. Returns the channels and their JIDs.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Listing newsletters");
    const result = await wsapiClient.get("/newsletters");
    return { success: true, newsletters: result, count: result.length };
  },
};

export const createNewsletter: ToolHandler = {
  name: "whatsapp_create_newsletter",
  description:
    "Create a new WhatsApp channel (newsletter) owned by this number, with a name and optional description and picture. It is public once created. Returns the new channel JID.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Newsletter name" },
      description: { type: "string", description: "Newsletter description" },
      picture: {
        type: "string",
        description: "Base64-encoded profile picture",
      },
    },
    required: ["name"],
  },
  handler: async (args: any) => {
    const input = validateInput(createNewsletterSchema, args);
    logger.info("Creating newsletter", { name: input.name });
    const result = await wsapiClient.post("/newsletters", input);
    return {
      success: true,
      newsletterId: result.id,
      message: "Newsletter created",
    };
  },
};

export const getNewsletterByInvite: ToolHandler = {
  name: "whatsapp_get_newsletter_by_invite",
  description:
    "Look up a channel by its invite code, without following it. Read-only. Returns the channel info and JID.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Newsletter invite code" },
    },
    required: ["code"],
  },
  handler: async (args: any) => {
    const input = validateInput(getNewsletterByInviteSchema, args);
    const result = await wsapiClient.get(`/newsletters/invite/${input.code}`);
    return { success: true, newsletter: result };
  },
};

export const getNewsletter: ToolHandler = {
  name: "whatsapp_get_newsletter",
  description:
    "Get a channel's details by JID: name, description and follower count. Read-only. Returns the channel object.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: { id: { type: "string", description: "Newsletter JID" } },
    required: ["id"],
  },
  handler: async (args: any) => {
    const input = validateInput(getNewsletterSchema, args);
    const result = await wsapiClient.get(`/newsletters/${input.id}`);
    return { success: true, newsletter: result };
  },
};

export const setNewsletterSubscription: ToolHandler = {
  name: "whatsapp_set_newsletter_subscription",
  description:
    "Follow or unfollow a channel by JID. Following adds its updates to this account; the channel owner only sees the follower count. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Newsletter JID" },
      subscribed: {
        type: "boolean",
        description: "True to subscribe, false to unsubscribe",
      },
    },
    required: ["id", "subscribed"],
  },
  handler: async (args: any) => {
    const input = validateInput(setNewsletterSubscriptionSchema, args);
    logger.info("Setting newsletter subscription", {
      id: input.id,
      subscribed: input.subscribed,
    });
    await wsapiClient.put(`/newsletters/${input.id}/subscription`, {
      subscribed: input.subscribed,
    });
    return {
      success: true,
      message: `Newsletter ${input.subscribed ? "subscribed" : "unsubscribed"}`,
    };
  },
};

export const muteNewsletter: ToolHandler = {
  name: "whatsapp_mute_newsletter",
  description:
    "Mute or unmute a channel's notifications on this account. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Newsletter JID" },
      mute: { type: "boolean", description: "True to mute, false to unmute" },
    },
    required: ["id", "mute"],
  },
  handler: async (args: any) => {
    const input = validateInput(muteNewsletterSchema, args);
    logger.info("Setting newsletter mute", { id: input.id, mute: input.mute });
    await wsapiClient.put(`/newsletters/${input.id}/mute`, {
      mute: input.mute,
    });
    return {
      success: true,
      message: `Newsletter ${input.mute ? "muted" : "unmuted"}`,
    };
  },
};

export const newsletterTools = {
  listNewsletters,
  createNewsletter,
  getNewsletterByInvite,
  getNewsletter,
  setNewsletterSubscription,
  muteNewsletter,
};
