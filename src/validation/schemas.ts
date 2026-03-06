import { z } from 'zod';

// Common patterns
const chatIdSchema = z.string().min(1);
const messageIdSchema = z.string().min(1);
const base64Schema = z.string().min(1);
const urlSchema = z.string().url();
const ephemeralExpirationSchema = z.enum(['off', '24h', '7d', '90d']).optional();

// ─── Messaging schemas ───────────────────────────────────────────

export const sendTextMessageSchema = z.object({
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
});

export const sendMediaMessageSchema = z.object({
  to: chatIdSchema,
  data: base64Schema.optional(),
  url: urlSchema.optional(),
  mimeType: z.string().optional(),
  caption: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  viewOnce: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
}).refine(data => data.data || data.url, {
  message: "Either data or url must be provided",
});

export const sendDocumentMessageSchema = z.object({
  to: chatIdSchema,
  data: base64Schema.optional(),
  url: urlSchema.optional(),
  mimeType: z.string().optional(),
  filename: z.string().min(1).max(255),
  caption: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
}).refine(data => data.data || data.url, {
  message: "Either data or url must be provided",
});

export const sendStickerMessageSchema = z.object({
  to: chatIdSchema,
  data: base64Schema.optional(),
  url: urlSchema.optional(),
  isAnimated: z.boolean().optional(),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
}).refine(data => data.data || data.url, {
  message: "Either data or url must be provided",
});

export const sendLocationMessageSchema = z.object({
  to: chatIdSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().optional(),
  address: z.string().optional(),
  url: urlSchema.optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
});

export const sendContactMessageSchema = z.object({
  to: chatIdSchema,
  displayName: z.string().optional(),
  vcard: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
}).refine(data => data.displayName || data.vcard, {
  message: "Either displayName or vcard must be provided",
});

export const sendLinkMessageSchema = z.object({
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
  url: urlSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  jpegThumbnail: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  replyTo: messageIdSchema.optional(),
  replyToSenderId: z.string().optional(),
  isForwarded: z.boolean().optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
});

export const sendReactionMessageSchema = z.object({
  messageId: messageIdSchema,
  to: chatIdSchema,
  senderId: z.string().optional(),
  reaction: z.string().max(10),
});

// ─── Message management schemas ──────────────────────────────────

export const editMessageSchema = z.object({
  messageId: messageIdSchema,
  to: chatIdSchema,
  text: z.string().min(1).max(4096),
  mentions: z.array(z.string()).optional(),
  ephemeralExpiration: ephemeralExpirationSchema,
});

export const deleteMessageSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: z.string().min(1),
});

export const deleteMessageForMeSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: z.string().optional(),
  isFromMe: z.boolean().optional(),
  timestamp: z.string().optional(),
});

export const markMessageAsReadSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: z.string().min(1),
  receiptType: z.enum(['delivered', 'sender', 'read', 'played']),
});

export const starMessageSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: z.string().min(1),
  starred: z.boolean().optional(),
});

export const pinMessageSchema = z.object({
  messageId: messageIdSchema,
  chatId: chatIdSchema,
  senderId: z.string().min(1),
  pinned: z.boolean().optional(),
  pinExpiration: z.string().optional(),
});

// ─── Contact schemas ─────────────────────────────────────────────

export const getContactSchema = z.object({
  id: z.string().min(1),
});

export const createContactSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1).max(255),
  firstName: z.string().max(255).optional(),
});

export const blockContactSchema = z.object({
  id: z.string().min(1),
});

// ─── Group schemas ───────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
  participants: z.array(z.string()).min(1),
});

export const getGroupSchema = z.object({
  id: z.string().min(1),
});

export const updateGroupNameSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
});

export const updateGroupDescriptionSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
});

export const setGroupPictureSchema = z.object({
  id: z.string().min(1),
  data: base64Schema,
});

export const updateGroupParticipantsSchema = z.object({
  id: z.string().min(1),
  participants: z.array(z.string()).min(1),
  action: z.enum(['add', 'remove', 'promote', 'demote']),
});

export const setBoolSettingSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

export const setMemberAddModeSchema = z.object({
  id: z.string().min(1),
  onlyAdminAdd: z.boolean(),
});

export const joinWithLinkSchema = z.object({
  code: z.string().min(1),
});

export const joinWithInviteSchema = z.object({
  groupId: z.string().min(1),
  inviterId: z.string().min(1),
  code: z.string().min(1),
  expiration: z.number().optional(),
});

export const getGroupInfoFromLinkSchema = z.object({
  code: z.string().min(1),
});

export const updateGroupRequestsSchema = z.object({
  id: z.string().min(1),
  participants: z.array(z.string()).min(1),
  action: z.enum(['approve', 'reject']),
});

// ─── Community schemas ───────────────────────────────────────────

export const createCommunitySchema = z.object({
  name: z.string().min(1),
  participants: z.array(z.string()).optional(),
  approvalMode: z.string().optional(),
});

export const getCommunitySchema = z.object({
  id: z.string().min(1),
});

export const createCommunityGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  participants: z.array(z.string()).optional(),
});

export const linkGroupToCommunitySchema = z.object({
  id: z.string().min(1),
  groupId: z.string().min(1),
});

export const unlinkCommunityGroupSchema = z.object({
  id: z.string().min(1),
  groupId: z.string().min(1),
});

// ─── Chat schemas ────────────────────────────────────────────────

export const getChatSchema = z.object({
  chatId: chatIdSchema,
});

export const setChatPresenceSchema = z.object({
  chatId: chatIdSchema,
  state: z.enum(['typing', 'recording', 'paused']),
});

export const updateChatArchiveSchema = z.object({
  chatId: chatIdSchema,
  archived: z.boolean(),
});

export const updateChatPinSchema = z.object({
  chatId: chatIdSchema,
  pinned: z.boolean(),
});

export const updateChatEphemeralSchema = z.object({
  chatId: chatIdSchema,
  expiration: z.enum(['off', '24h', '7d', '90d']),
});

export const updateChatMuteSchema = z.object({
  chatId: chatIdSchema,
  duration: z.enum(['8h', '1w', 'always', 'off']),
});

export const markChatAsReadSchema = z.object({
  chatId: chatIdSchema,
  read: z.boolean(),
});

export const requestChatMessagesSchema = z.object({
  chatId: chatIdSchema,
  lastMessageId: z.string().min(1),
  lastMessageSenderId: z.string().min(1),
  count: z.number().min(1).max(500).optional(),
});

// ─── Session schemas ─────────────────────────────────────────────

export const getSessionLoginCodeSchema = z.object({
  phone: z.string().min(7).max(15),
});

// ─── User schemas ────────────────────────────────────────────────

export const getUserSchema = z.object({
  phone: z.string().min(7).max(15),
});

export const updateMyProfileSchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
  picture: z.string().optional(),
});

export const setPresenceSchema = z.object({
  presence: z.enum(['available', 'unavailable']),
});

export const setPrivacySettingSchema = z.object({
  setting: z.enum(['groupadd', 'last', 'status', 'profile', 'readreceipts', 'online', 'calladd']),
  value: z.enum(['all', 'contacts', 'contact_blacklist', 'match_last_seen', 'known', 'none']),
});

export const bulkCheckUsersSchema = z.object({
  phones: z.array(z.string()).min(1),
});

// ─── Call schemas ────────────────────────────────────────────────

export const rejectCallSchema = z.object({
  callId: z.string().min(1),
  callerId: z.string().min(1),
});

// ─── Media schemas ───────────────────────────────────────────────

export const downloadMediaSchema = z.object({
  id: z.string().min(1),
});

// ─── Newsletter schemas ──────────────────────────────────────────

export const createNewsletterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  picture: z.string().optional(),
});

export const getNewsletterSchema = z.object({
  id: z.string().min(1),
});

export const getNewsletterByInviteSchema = z.object({
  code: z.string().min(1),
});

export const setNewsletterSubscriptionSchema = z.object({
  id: z.string().min(1),
  subscribed: z.boolean(),
});

export const muteNewsletterSchema = z.object({
  id: z.string().min(1),
  mute: z.boolean(),
});

// ─── Status schemas ──────────────────────────────────────────────

export const postTextStatusSchema = z.object({
  text: z.string().min(1),
});

export const postMediaStatusSchema = z.object({
  data: z.string().optional(),
  url: urlSchema.optional(),
  mimeType: z.string().optional(),
  caption: z.string().optional(),
}).refine(data => data.data || data.url, {
  message: "Either data or url must be provided",
});

export const deleteStatusSchema = z.object({
  messageId: z.string().min(1),
});

// ─── Validation helper ───────────────────────────────────────────

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  return result.data;
}

// ─── Type exports ────────────────────────────────────────────────

export type SendTextMessageInput = z.infer<typeof sendTextMessageSchema>;
export type SendMediaMessageInput = z.infer<typeof sendMediaMessageSchema>;
export type SendDocumentMessageInput = z.infer<typeof sendDocumentMessageSchema>;
export type SendStickerMessageInput = z.infer<typeof sendStickerMessageSchema>;
export type SendLocationMessageInput = z.infer<typeof sendLocationMessageSchema>;
export type SendContactMessageInput = z.infer<typeof sendContactMessageSchema>;
export type SendLinkMessageInput = z.infer<typeof sendLinkMessageSchema>;
export type SendReactionMessageInput = z.infer<typeof sendReactionMessageSchema>;
