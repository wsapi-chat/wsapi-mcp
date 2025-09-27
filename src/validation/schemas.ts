import { z } from 'zod';

// Common patterns
const phoneNumberSchema = z.string().regex(/^\d{10,15}(@s\.whatsapp\.net)?$/);
const groupIdSchema = z.string().regex(/@g\.us$/);
const chatIdSchema = z.union([phoneNumberSchema, groupIdSchema]);
const messageIdSchema = z.string().min(1);
const base64Schema = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/);
const urlSchema = z.string().url();

// Messaging schemas
export const sendTextMessageSchema = z.object({
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
});

export const sendImageMessageSchema = z.object({
  to: chatIdSchema,
  imageBase64: base64Schema.optional(),
  imageURL: urlSchema.optional(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  caption: z.string().max(1024).optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
  viewOnce: z.boolean().optional(),
}).refine(data => data.imageBase64 || data.imageURL, {
  message: "Either imageBase64 or imageURL must be provided",
});

export const sendVideoMessageSchema = z.object({
  to: chatIdSchema,
  videoBase64: base64Schema.optional(),
  videoURL: urlSchema.optional(),
  mimeType: z.enum(['video/mp4', 'video/3gp', 'video/mov', 'video/avi']),
  caption: z.string().max(1024).optional(),
  viewOnce: z.boolean().optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
}).refine(data => data.videoBase64 || data.videoURL, {
  message: "Either videoBase64 or videoURL must be provided",
});

export const sendAudioMessageSchema = z.object({
  to: chatIdSchema,
  audioBase64: base64Schema.optional(),
  audioURL: urlSchema.optional(),
  mimeType: z.enum(['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav']),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
  viewOnce: z.boolean().optional(),
}).refine(data => data.audioBase64 || data.audioURL, {
  message: "Either audioBase64 or audioURL must be provided",
});

export const sendVoiceMessageSchema = z.object({
  to: chatIdSchema,
  voiceBase64: base64Schema.optional(),
  voiceURL: urlSchema.optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
  viewOnce: z.boolean().optional(),
}).refine(data => data.voiceBase64 || data.voiceURL, {
  message: "Either voiceBase64 or voiceURL must be provided",
});

export const sendDocumentMessageSchema = z.object({
  to: chatIdSchema,
  documentBase64: base64Schema.optional(),
  documentURL: urlSchema.optional(),
  fileName: z.string().min(1).max(255),
  caption: z.string().max(1024).optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
}).refine(data => data.documentBase64 || data.documentURL, {
  message: "Either documentBase64 or documentURL must be provided",
});

export const sendStickerMessageSchema = z.object({
  to: chatIdSchema,
  stickerBase64: base64Schema.optional(),
  stickerURL: urlSchema.optional(),
  mimeType: z.enum(['image/webp']),
  isAnimated: z.boolean().optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
}).refine(data => data.stickerBase64 || data.stickerURL, {
  message: "Either stickerBase64 or stickerURL must be provided",
});

export const sendLocationMessageSchema = z.object({
  to: chatIdSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().max(1000).optional(),
  address: z.string().max(1000).optional(),
  url: urlSchema.optional(),
});

export const sendContactMessageSchema = z.object({
  to: chatIdSchema,
  displayName: z.string().min(1).max(255).optional(),
  vCard: z.string().min(1).optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
}).refine(data => data.displayName || data.vCard, {
  message: "Either displayName or vCard must be provided",
});

export const sendReactionMessageSchema = z.object({
  messageId: messageIdSchema,
  to: chatIdSchema,
  senderId: phoneNumberSchema,
  reaction: z.string().min(1).max(10), // Emoji
});

export const sendLinkMessageSchema = z.object({
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
  url: urlSchema,
  title: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  jpegThumbnail: base64Schema.optional(),
  mentions: z.array(phoneNumberSchema).optional(),
  replyTo: messageIdSchema.optional(),
  isForwarded: z.boolean().optional(),
});

// Message management schemas
export const editMessageSchema = z.object({
  messageId: messageIdSchema,
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
});

export const deleteMessageSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: phoneNumberSchema,
});

export const deleteMessageForMeSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: phoneNumberSchema,
  ifFromMe: z.boolean(),
  time: z.string().datetime(),
});

export const markMessageAsReadSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: phoneNumberSchema,
  receiptType: z.enum(['delivered', 'sender', 'read', 'played']),
});

export const starMessageSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: phoneNumberSchema,
});

// Contact management schemas
export const getContactSchema = z.object({
  contactId: phoneNumberSchema,
});

export const createContactSchema = z.object({
  id: phoneNumberSchema,
  fullName: z.string().min(1).max(255),
  firstName: z.string().min(1).max(255),
});

export const updateContactSchema = z.object({
  contactId: phoneNumberSchema,
  fullName: z.string().min(1).max(255),
  firstName: z.string().min(1).max(255),
});

export const updateContactFullNameSchema = z.object({
  contactId: phoneNumberSchema,
  fullName: z.string().min(1).max(255),
});

// Group management schemas
export const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
  participants: z.array(phoneNumberSchema).min(1),
});

export const getGroupSchema = z.object({
  groupId: groupIdSchema,
});

export const updateGroupNameSchema = z.object({
  groupId: groupIdSchema,
  name: z.string().min(1).max(255),
});

export const updateGroupDescriptionSchema = z.object({
  groupId: groupIdSchema,
  description: z.string().max(512),
});

export const updateGroupParticipantsSchema = z.object({
  groupId: groupIdSchema,
  participants: z.array(phoneNumberSchema).min(1),
});

export const setGroupPictureSchema = z.object({
  groupId: groupIdSchema,
  pictureBase64: base64Schema,
});

// Chat management schemas
export const getChatSchema = z.object({
  chatId: chatIdSchema,
});

export const setChatPresenceSchema = z.object({
  chatId: chatIdSchema,
  state: z.enum(['typing', 'recording', 'paused']),
});

export const updateChatEphemeralSchema = z.object({
  chatId: chatIdSchema,
  ephemeralExpiration: z.enum(['off', '24h', '7d', '90d']),
});

export const updateChatMuteSchema = z.object({
  chatId: chatIdSchema,
  duration: z.string().nullable().optional(),
});

export const updateChatPinSchema = z.object({
  chatId: chatIdSchema,
  pinned: z.boolean(),
});

export const updateChatArchiveSchema = z.object({
  chatId: chatIdSchema,
  archived: z.boolean(),
});

export const markChatAsReadSchema = z.object({
  chatId: chatIdSchema,
  read: z.boolean(),
});

// Account management schemas
export const setAccountNameSchema = z.object({
  name: z.string().min(1).max(255),
});

export const setAccountPictureSchema = z.object({
  pictureBase64: base64Schema,
});

export const setAccountPresenceSchema = z.object({
  status: z.enum(['available', 'unavailable']),
});

export const setAccountStatusSchema = z.object({
  status: z.string().max(139),
});

// Session management schemas
export const getSessionLoginCodeSchema = z.object({
  phone: z.string().regex(/^\d{10,15}$/),
});

// Instance management schemas
export const updateInstanceSettingsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  pullMode: z.boolean().optional(),
});

// Call management schemas
export const rejectCallSchema = z.object({
  callId: z.string().min(1),
  callerId: phoneNumberSchema,
});

// Media download schema
export const downloadMediaSchema = z.object({
  id: z.string().min(1),
});

// User management schemas
export const getUserSchema = z.object({
  phone: z.string().regex(/^\d{10,15}$/),
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  return result.data;
}

// Type exports
export type SendTextMessageInput = z.infer<typeof sendTextMessageSchema>;
export type SendImageMessageInput = z.infer<typeof sendImageMessageSchema>;
export type SendVideoMessageInput = z.infer<typeof sendVideoMessageSchema>;
export type SendAudioMessageInput = z.infer<typeof sendAudioMessageSchema>;
export type SendVoiceMessageInput = z.infer<typeof sendVoiceMessageSchema>;
export type SendDocumentMessageInput = z.infer<typeof sendDocumentMessageSchema>;
export type SendStickerMessageInput = z.infer<typeof sendStickerMessageSchema>;
export type SendLocationMessageInput = z.infer<typeof sendLocationMessageSchema>;
export type SendContactMessageInput = z.infer<typeof sendContactMessageSchema>;
export type SendReactionMessageInput = z.infer<typeof sendReactionMessageSchema>;
export type SendLinkMessageInput = z.infer<typeof sendLinkMessageSchema>;