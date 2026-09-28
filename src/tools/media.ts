import type { ToolHandler } from "../server.js";
import { wsapiClient } from "../client/index.js";
import { createLogger } from "../utils/logger.js";
import { validateInput, downloadMediaSchema } from "../validation/schemas.js";
import { READ } from "./annotations.js";

const logger = createLogger("media-tools");

export const downloadMedia: ToolHandler = {
  name: "whatsapp_download_media",
  description:
    "Download the file attached to a received message, using media.id from the message event. Read-only. Returns the file as binary content, with its MIME type.",
  annotations: READ,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Media ID from a received message event",
      },
    },
    required: ["id"],
  },
  handler: async (args: any) => {
    const input = validateInput(downloadMediaSchema, args);
    logger.info("Downloading media", { id: input.id });
    const result = await wsapiClient.getBinary("/media/download", {
      id: input.id,
    });
    return {
      content: [
        {
          type: "resource",
          resource: {
            uri: `wsapi://media/${encodeURIComponent(input.id)}`,
            mimeType: result.mimeType,
            blob: result.data,
          },
        },
      ],
    };
  },
};

export const mediaTools = { downloadMedia };
