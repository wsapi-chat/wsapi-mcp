import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

// MCP behaviour hints. Every tool talks to WhatsApp, so all are open-world.

/** Reads data; changes nothing. */
export const READ: ToolAnnotations = {
  readOnlyHint: true,
  openWorldHint: true,
};

/** Creates something new (a message, group, status); repeating it creates it again. */
export const CREATE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};

/** Sets a value or state; repeating it with the same input has no further effect. */
export const SET: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/** Deletes, revokes or removes something, usually irreversibly. */
export const DESTRUCTIVE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: true,
};
