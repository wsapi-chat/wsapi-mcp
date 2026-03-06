import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  createGroupSchema,
  getGroupSchema,
  updateGroupNameSchema,
  updateGroupDescriptionSchema,
  setGroupPictureSchema,
  updateGroupParticipantsSchema,
  setBoolSettingSchema,
  setMemberAddModeSchema,
  joinWithLinkSchema,
  joinWithInviteSchema,
  getGroupInfoFromLinkSchema,
  updateGroupRequestsSchema,
} from '../validation/schemas.js';

const logger = createLogger('group-tools');

export const getGroups: ToolHandler = {
  name: 'whatsapp_get_groups',
  description: 'Get list of all WhatsApp groups.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Getting groups list');
    const result = await wsapiClient.get('/groups');
    return { success: true, groups: result, count: result.length };
  },
};

export const createGroup: ToolHandler = {
  name: 'whatsapp_create_group',
  description: 'Create a new WhatsApp group.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Group name' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Participant JIDs' },
    },
    required: ['name', 'participants'],
  },
  handler: async (args: any) => {
    const input = validateInput(createGroupSchema, args);
    logger.info('Creating group', { name: input.name });
    const result = await wsapiClient.post('/groups', input);
    return { success: true, groupId: result.id, message: 'Group created successfully' };
  },
};

export const getGroup: ToolHandler = {
  name: 'whatsapp_get_group',
  description: 'Get information about a specific group.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.get(`/groups/${input.id}`);
    return { success: true, group: result };
  },
};

export const updateGroupName: ToolHandler = {
  name: 'whatsapp_update_group_name',
  description: 'Update group name.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      name: { type: 'string', description: 'New group name' },
    },
    required: ['id', 'name'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupNameSchema, args);
    await wsapiClient.put(`/groups/${input.id}/name`, { name: input.name });
    return { success: true, message: 'Group name updated successfully' };
  },
};

export const updateGroupDescription: ToolHandler = {
  name: 'whatsapp_update_group_description',
  description: 'Update group description.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      description: { type: 'string', description: 'New group description' },
    },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupDescriptionSchema, args);
    await wsapiClient.put(`/groups/${input.id}/description`, { description: input.description });
    return { success: true, message: 'Group description updated successfully' };
  },
};

export const setGroupPicture: ToolHandler = {
  name: 'whatsapp_set_group_picture',
  description: 'Set group profile picture.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      data: { type: 'string', description: 'Base64-encoded JPEG image' },
    },
    required: ['id', 'data'],
  },
  handler: async (args: any) => {
    const input = validateInput(setGroupPictureSchema, args);
    const result = await wsapiClient.post(`/groups/${input.id}/picture`, { data: input.data });
    return { success: true, pictureId: result.pictureId, message: 'Group picture updated' };
  },
};

export const leaveGroup: ToolHandler = {
  name: 'whatsapp_leave_group',
  description: 'Leave a group.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    await wsapiClient.post(`/groups/${input.id}/leave`, {});
    return { success: true, message: 'Left group successfully' };
  },
};

export const getGroupParticipants: ToolHandler = {
  name: 'whatsapp_get_group_participants',
  description: 'Get group participants.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.get(`/groups/${input.id}/participants`);
    return { success: true, participants: result };
  },
};

export const updateGroupParticipants: ToolHandler = {
  name: 'whatsapp_update_group_participants',
  description: 'Add, remove, promote, or demote group participants.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Participant JIDs' },
      action: { type: 'string', enum: ['add', 'remove', 'promote', 'demote'], description: 'Action to perform' },
    },
    required: ['id', 'participants', 'action'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupParticipantsSchema, args);
    await wsapiClient.put(`/groups/${input.id}/participants`, { participants: input.participants, action: input.action });
    return { success: true, message: 'Participants updated successfully' };
  },
};

export const getGroupInviteLink: ToolHandler = {
  name: 'whatsapp_get_group_invite_link',
  description: 'Get group invite link.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.get(`/groups/${input.id}/invite-link`);
    return { success: true, link: result.link };
  },
};

export const resetGroupInviteLink: ToolHandler = {
  name: 'whatsapp_reset_group_invite_link',
  description: 'Reset group invite link.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.post(`/groups/${input.id}/invite-link/reset`, {});
    return { success: true, link: result.link };
  },
};

export const setGroupAnnounce: ToolHandler = {
  name: 'whatsapp_set_group_announce',
  description: 'Set group announce mode (only admins can send messages).',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      enabled: { type: 'boolean', description: 'Enable or disable' },
    },
    required: ['id', 'enabled'],
  },
  handler: async (args: any) => {
    const input = validateInput(setBoolSettingSchema, args);
    await wsapiClient.put(`/groups/${input.id}/settings/announce`, { enabled: input.enabled });
    return { success: true, message: 'Group announce mode updated' };
  },
};

export const setGroupLocked: ToolHandler = {
  name: 'whatsapp_set_group_locked',
  description: 'Set group locked mode (only admins can edit info).',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      enabled: { type: 'boolean', description: 'Enable or disable' },
    },
    required: ['id', 'enabled'],
  },
  handler: async (args: any) => {
    const input = validateInput(setBoolSettingSchema, args);
    await wsapiClient.put(`/groups/${input.id}/settings/locked`, { enabled: input.enabled });
    return { success: true, message: 'Group locked mode updated' };
  },
};

export const setGroupJoinApproval: ToolHandler = {
  name: 'whatsapp_set_group_join_approval',
  description: 'Set group join approval mode (new members require admin approval).',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      enabled: { type: 'boolean', description: 'Enable or disable' },
    },
    required: ['id', 'enabled'],
  },
  handler: async (args: any) => {
    const input = validateInput(setBoolSettingSchema, args);
    await wsapiClient.put(`/groups/${input.id}/settings/join-approval`, { enabled: input.enabled });
    return { success: true, message: 'Group join approval mode updated' };
  },
};

export const setGroupMemberAddMode: ToolHandler = {
  name: 'whatsapp_set_group_member_add_mode',
  description: 'Control whether only admins can add members.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      onlyAdminAdd: { type: 'boolean', description: 'Only admins can add members' },
    },
    required: ['id', 'onlyAdminAdd'],
  },
  handler: async (args: any) => {
    const input = validateInput(setMemberAddModeSchema, args);
    await wsapiClient.put(`/groups/${input.id}/settings/member-add-mode`, { onlyAdminAdd: input.onlyAdminAdd });
    return { success: true, message: 'Member add mode updated' };
  },
};

export const joinGroupWithLink: ToolHandler = {
  name: 'whatsapp_join_group_with_link',
  description: 'Join a group via invite link code.',
  inputSchema: {
    type: 'object',
    properties: { code: { type: 'string', description: 'Invite link code' } },
    required: ['code'],
  },
  handler: async (args: any) => {
    const input = validateInput(joinWithLinkSchema, args);
    const result = await wsapiClient.post('/groups/join/link', { code: input.code });
    return { success: true, groupId: result.id, message: 'Joined group successfully' };
  },
};

export const joinGroupWithInvite: ToolHandler = {
  name: 'whatsapp_join_group_with_invite',
  description: 'Accept a group invite received via direct message.',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: { type: 'string', description: 'Group JID' },
      inviterId: { type: 'string', description: 'Inviter JID' },
      code: { type: 'string', description: 'Invite code' },
      expiration: { type: 'number', description: 'Invite expiration timestamp' },
    },
    required: ['groupId', 'inviterId', 'code'],
  },
  handler: async (args: any) => {
    const input = validateInput(joinWithInviteSchema, args);
    await wsapiClient.post('/groups/join/invite', input);
    return { success: true, message: 'Joined group successfully' };
  },
};

export const getGroupInfoFromLink: ToolHandler = {
  name: 'whatsapp_get_group_info_from_link',
  description: 'Preview group information from an invite code without joining.',
  inputSchema: {
    type: 'object',
    properties: { code: { type: 'string', description: 'Invite link code' } },
    required: ['code'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupInfoFromLinkSchema, args);
    const result = await wsapiClient.get(`/groups/invite/${input.code}`);
    return { success: true, group: result };
  },
};

export const getGroupRequests: ToolHandler = {
  name: 'whatsapp_get_group_requests',
  description: 'Get pending join requests for a group.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Group JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getGroupSchema, args);
    const result = await wsapiClient.get(`/groups/${input.id}/requests`);
    return { success: true, requests: result };
  },
};

export const updateGroupRequests: ToolHandler = {
  name: 'whatsapp_update_group_requests',
  description: 'Approve or reject pending join requests.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Group JID' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Participant JIDs' },
      action: { type: 'string', enum: ['approve', 'reject'], description: 'Action to perform' },
    },
    required: ['id', 'participants', 'action'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupRequestsSchema, args);
    await wsapiClient.put(`/groups/${input.id}/requests`, { participants: input.participants, action: input.action });
    return { success: true, message: 'Join requests updated' };
  },
};

export const groupTools = {
  getGroups, createGroup, getGroup, updateGroupName, updateGroupDescription,
  setGroupPicture, leaveGroup, getGroupParticipants, updateGroupParticipants,
  getGroupInviteLink, resetGroupInviteLink, setGroupAnnounce, setGroupLocked,
  setGroupJoinApproval, setGroupMemberAddMode, joinGroupWithLink, joinGroupWithInvite,
  getGroupInfoFromLink, getGroupRequests, updateGroupRequests,
};
