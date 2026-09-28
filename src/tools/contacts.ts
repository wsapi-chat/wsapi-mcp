import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  getContactSchema,
  createContactSchema,
  blockContactSchema,
} from "../validation/schemas.js";
import { READ, SET } from "./annotations.js";

const logger = createLogger("contact-tools");

export const getContacts: ToolHandler = {
  name: "whatsapp_get_contacts",
  description:
    "List the contacts saved on the connected number. Read-only. To check whether a phone number has WhatsApp, use whatsapp_check_user. Returns the contacts and their count.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting contacts list");
    const result = await wsapiClient.get("/contacts");
    return {
      success: true,
      contacts: result,
      count: result.length,
      message: `Retrieved ${result.length} contacts`,
    };
  },
};

export const getContact: ToolHandler = {
  name: "whatsapp_get_contact",
  description:
    "Get one saved contact by JID: saved name, push name and business name. Read-only. Returns the contact object.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: { id: { type: "string", description: "Contact JID" } },
    required: ["id"],
  },
  handler: async (args: any) => {
    const input = validateInput(getContactSchema, args);
    logger.info("Getting contact info", { id: input.id });
    const result = await wsapiClient.get(`/contacts/${input.id}`);
    return {
      success: true,
      contact: result,
      message: "Contact information retrieved successfully",
    };
  },
};

export const createContact: ToolHandler = {
  name: "whatsapp_create_contact",
  description:
    "Save a contact on the connected number, or update its name if it already exists. Only affects this account's address book. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Phone number or JID of the contact" },
      fullName: { type: "string", description: "Full name of the contact" },
      firstName: { type: "string", description: "First name (optional)" },
    },
    required: ["id", "fullName"],
  },
  handler: async (args: any) => {
    const input = validateInput(createContactSchema, args);
    logger.info("Creating contact", { id: input.id });
    await wsapiClient.post("/contacts", input);
    return { success: true, message: "Contact created successfully" };
  },
};

export const syncContacts: ToolHandler = {
  name: "whatsapp_sync_contacts",
  description:
    "Re-sync the address book from the WhatsApp servers. Use it when whatsapp_get_contacts looks outdated. It runs in the background. Returns an acknowledgement, not the contacts.",
  annotations: SET,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Syncing contacts");
    await wsapiClient.post("/contacts/sync", {});
    return { success: true, message: "Contact sync triggered" };
  },
};

export const getBlocklist: ToolHandler = {
  name: "whatsapp_get_blocklist",
  description:
    "List the contacts this number has blocked. Read-only. To change it, use whatsapp_block_contact or whatsapp_unblock_contact. Returns the blocked JIDs.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting blocklist");
    const result = await wsapiClient.get("/contacts/blocklist");
    return {
      success: true,
      blocklist: result,
      message: "Blocklist retrieved successfully",
    };
  },
};

export const blockContact: ToolHandler = {
  name: "whatsapp_block_contact",
  description:
    "Block a contact by user JID: they can no longer message or call this number, and they are not notified. Reversible with whatsapp_unblock_contact. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: { id: { type: "string", description: "Contact JID to block" } },
    required: ["id"],
  },
  handler: async (args: any) => {
    const input = validateInput(blockContactSchema, args);
    logger.info("Blocking contact", { id: input.id });
    await wsapiClient.put(`/contacts/${input.id}/block`, {});
    return { success: true, message: "Contact blocked successfully" };
  },
};

export const unblockContact: ToolHandler = {
  name: "whatsapp_unblock_contact",
  description:
    "Unblock a previously blocked contact, so they can message and call this number again. Returns a success confirmation.",
  annotations: SET,
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Contact JID to unblock" },
    },
    required: ["id"],
  },
  handler: async (args: any) => {
    const input = validateInput(blockContactSchema, args);
    logger.info("Unblocking contact", { id: input.id });
    await wsapiClient.put(`/contacts/${input.id}/unblock`, {});
    return { success: true, message: "Contact unblocked successfully" };
  },
};

export const contactTools = {
  getContacts,
  getContact,
  createContact,
  syncContacts,
  getBlocklist,
  blockContact,
  unblockContact,
};
