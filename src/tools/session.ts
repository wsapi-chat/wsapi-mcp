import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import {
  validateInput,
  getSessionLoginCodeSchema,
  submitPasskeySchema,
} from "../validation/schemas.js";
import { CREATE, DESTRUCTIVE, READ, SET } from "./annotations.js";

const logger = createLogger("session-tools");

export const getSessionStatus: ToolHandler = {
  name: "whatsapp_get_session_status",
  description:
    "Check whether the WhatsApp session is connected and logged in. Read-only. Call it first when other tools fail, to tell a logged-out session from another error, and poll it while pairing: passkeyStatus shows when WhatsApp asks for a passkey (see whatsapp_get_passkey_state). Returns the connection and login state, plus passkeyStatus.",
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
    "Get the login QR code as a text string, to pair a phone with this instance. Only works while logged out, and each code expires within about a minute. Fails with 409 while a passkey step is pending; stop polling and use whatsapp_get_passkey_state instead. For an image, use whatsapp_get_qr_code_image; to pair by phone number, use whatsapp_get_pair_code. Returns the QR string.",
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
    "Get the login QR code as a PNG image, to scan from WhatsApp on the phone (Linked devices). Only works while logged out, and each code expires within about a minute. Fails with 409 while a passkey step is pending; stop polling and use whatsapp_get_passkey_state instead. Returns the image.",
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
    "Get an 8-character pairing code for a phone number, to link it without scanning a QR (WhatsApp, Linked devices, Link with phone number). Only works while logged out. Fails with 409 while a passkey step is pending; use whatsapp_get_passkey_state instead of requesting a new code. Returns the code.",
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

// What the agent should tell the user next, per passkey status.
const PASSKEY_NEXT_STEP: Record<string, string> = {
  none: "No passkey step is pending.",
  required:
    "WhatsApp is waiting for the owner's passkey. Ask the user to sign `challenge` in a browser on https://web.whatsapp.com and send back the assertion JSON, then call whatsapp_submit_passkey.",
  submitted:
    "Assertion sent; waiting for WhatsApp to finish linking. Poll whatsapp_get_session_status.",
  confirmation_required:
    "Show `confirmationCode` to the user: it must match the code on their phone, where they approve the link. The confirmation is sent automatically.",
  error:
    "The passkey step failed or expired (see `error`). Generate a new QR or pair code, or call whatsapp_request_passkey_challenge.",
};

function passkeyResult(state: any, message: string) {
  return {
    success: true,
    passkey: state,
    nextStep: PASSKEY_NEXT_STEP[state?.status] ?? "",
    message,
  };
}

export const getPasskeyState: ToolHandler = {
  name: "whatsapp_get_passkey_state",
  description:
    "Get the passkey (WebAuthn) verification step of pairing. Read-only. Some accounts must verify with the owner's passkey before a device links: after the QR scan or pair code, status becomes required and a WebAuthn challenge appears. You cannot sign it yourself: WebAuthn binds the origin, so the account owner must sign it with navigator.credentials.get() in a browser on https://web.whatsapp.com (an extension or a DevTools console snippet there), then give you the PublicKeyCredential.toJSON() output for whatsapp_submit_passkey. The step expires 5 minutes after it is requested. While it is pending, the QR and pair-code tools fail with 409. Returns status (none, required, submitted, confirmation_required or error), challenge, origin, confirmationCode, error, expiresAt and a suggested next step.",
  annotations: READ,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Getting passkey state");
    const result = await wsapiClient.get("/session/passkey");
    return passkeyResult(result, "Passkey state retrieved successfully");
  },
};

export const requestPasskeyChallenge: ToolHandler = {
  name: "whatsapp_request_passkey_challenge",
  description:
    "Ask WhatsApp for a passkey challenge for this unpaired instance. Use it when the account uses a passkey but no challenge arrived after the QR scan or pair code, or to link with a passkey alone (no QR or pair code). Opens a connection if needed. If a challenge is already pending it is returned unchanged, so repeating is safe. Expect confirmation_required after submitting. Fails if already paired (400), if WhatsApp cannot be reached (409), or if the account has no passkey (502). Returns the passkey state with the challenge to sign on https://web.whatsapp.com.",
  annotations: SET,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Requesting passkey challenge");
    const result = await wsapiClient.post("/session/passkey/request", {});
    return passkeyResult(result, "Passkey challenge requested successfully");
  },
};

export const submitPasskey: ToolHandler = {
  name: "whatsapp_submit_passkey",
  description:
    "Submit the passkey assertion the account owner produced in a browser on https://web.whatsapp.com, to finish pairing. Pass the PublicKeyCredential.toJSON() object exactly as the browser returned it. Only valid while the passkey status is required and not expired (409 otherwise). The assertion is checked first: a wrong origin, type or challenge returns 400, nothing is sent and the user can retry; if WhatsApp rejects it (502) the step fails. Returns the new passkey state, usually submitted or confirmation_required.",
  annotations: CREATE,
  inputSchema: {
    type: "object",
    properties: {
      assertion: {
        type: "object",
        description:
          "WebAuthn assertion from PublicKeyCredential.toJSON(), binary fields base64url-encoded",
        properties: {
          id: { type: "string", description: "Credential ID" },
          rawId: { type: "string", description: "Raw credential ID" },
          type: { type: "string", description: "Usually public-key" },
          response: {
            type: "object",
            properties: {
              clientDataJSON: { type: "string" },
              authenticatorData: { type: "string" },
              signature: { type: "string" },
              userHandle: { type: ["string", "null"] },
            },
            required: ["clientDataJSON", "signature"],
          },
        },
        required: ["rawId", "response"],
      },
    },
    required: ["assertion"],
  },
  handler: async (args: any) => {
    const input = validateInput(submitPasskeySchema, args);
    logger.info("Submitting passkey assertion");
    const result = await wsapiClient.post("/session/passkey", input.assertion);
    return passkeyResult(result, "Passkey assertion submitted successfully");
  },
};

export const confirmPasskey: ToolHandler = {
  name: "whatsapp_confirm_passkey",
  description:
    "Compatibility tool, rarely needed: send the passkey pairing confirmation to WhatsApp. The server already sends it automatically when the status becomes confirmation_required (confirmationSent is true), so normally just show confirmationCode to the user and let them approve on their phone. Repeating it is a no-op once sent. Fails with 409 if no step awaits confirmation. Returns a success confirmation.",
  annotations: SET,
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    logger.info("Confirming passkey pairing");
    await wsapiClient.post("/session/passkey/confirm", {});
    return { success: true, message: "Passkey confirmation sent" };
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
  getPasskeyState,
  requestPasskeyChallenge,
  submitPasskey,
  confirmPasskey,
  logout,
  flushHistory,
};
