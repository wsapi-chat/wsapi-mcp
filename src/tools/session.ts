import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  getSessionLoginCodeSchema,
} from "../validation/schemas.js";
import { DESTRUCTIVE, READ, SET } from "./annotations.js";

const logger = createLogger("session-tools");

export const getSessionStatus: ToolHandler = {
  name: "whatsapp_get_session_status",
  description:
    "Check whether the WhatsApp session is connected and logged in. Read-only. Call it first when other tools fail, to tell a logged-out session from another error. Returns the connection and login state.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting session status");
    const result = await wsapiClient.get("/session/status");
    return {
      success: true,
      status: result,
      message: "Session status retrieved successfully",
    };
  },
};

export const getQRCode: ToolHandler = {
  name: "whatsapp_get_qr_code",
  description:
    "Get the login QR code as a text string, to pair a phone with this instance. Only works while logged out, and each code expires within about a minute. For an image, use whatsapp_get_qr_code_image; to pair by phone number, use whatsapp_get_pair_code. Returns the QR string.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting QR code text");
    const result = await wsapiClient.get("/session/qr/text");
    return {
      success: true,
      qrCode: result,
      message: "QR code retrieved successfully",
    };
  },
};

export const getQRCodeImage: ToolHandler = {
  name: "whatsapp_get_qr_code_image",
  description:
    "Get the login QR code as a PNG image, to scan from WhatsApp on the phone (Linked devices). Only works while logged out, and each code expires within about a minute. Returns the image.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting QR code image");
    const result = await wsapiClient.getBinary("/session/qr");
    return {
      content: [
        { type: "image", data: result.data, mimeType: result.mimeType },
      ],
    };
  },
};

export const getPairCode: ToolHandler = {
  name: "whatsapp_get_pair_code",
  description:
    "Get an 8-character pairing code for a phone number, to link it without scanning a QR (WhatsApp, Linked devices, Link with phone number). Only works while logged out. Returns the code.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      phone: { type: "string", description: "Phone number (7-15 digits)" },
    },
    required: ["phone"],
  },
  handler: async (args: any) => {
    const input = validateInput(getSessionLoginCodeSchema, args);
    logger.info("Getting pair code", { phone: input.phone });
    const result = await wsapiClient.get(`/session/pair-code/${input.phone}`);
    return {
      success: true,
      pairCode: result,
      message: "Pair code retrieved successfully",
    };
  },
};

export const logout: ToolHandler = {
  name: "whatsapp_logout",
  description:
    "Log this instance out of WhatsApp and unlink it from the phone. Every other tool stops working until the number is paired again with a QR or pair code. Returns a success confirmation.",
  annotations: DESTRUCTIVE,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Logging out");
    await wsapiClient.post("/session/logout", {});
    return { success: true, message: "Logged out successfully" };
  },
};

export const flushHistory: ToolHandler = {
  name: "whatsapp_flush_history",
  description:
    "Re-publish the history sync messages cached for this instance as events. It does not return messages: they arrive later through the event stream. Returns an acknowledgement.",
  annotations: SET,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Flushing history");
    const result = await wsapiClient.post("/session/flush-history", {});
    return { success: true, result, message: "History flush initiated" };
  },
};

export const sessionTools = {
  getSessionStatus,
  getQRCode,
  getQRCodeImage,
  getPairCode,
  logout,
  flushHistory,
};
