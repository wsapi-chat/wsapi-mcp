import type { ToolHandler } from '../server.js';
import { wsapiClient } from '../client/index.js';
import { createLogger } from '../utils/logger.js';
import {
  validateInput,
  createCommunitySchema,
  getCommunitySchema,
  updateGroupNameSchema,
  updateGroupDescriptionSchema,
  setGroupPictureSchema,
  setBoolSettingSchema,
  updateGroupParticipantsSchema,
  createCommunityGroupSchema,
  linkGroupToCommunitySchema,
  unlinkCommunityGroupSchema,
} from '../validation/schemas.js';

const logger = createLogger('community-tools');

export const listCommunities: ToolHandler = {
  name: 'whatsapp_list_communities',
  description: 'List all joined communities.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    logger.info('Listing communities');
    const result = await wsapiClient.get('/communities');
    return { success: true, communities: result, count: result.length };
  },
};

export const createCommunity: ToolHandler = {
  name: 'whatsapp_create_community',
  description: 'Create a new WhatsApp community.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Community name' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Initial participant JIDs' },
      approvalMode: { type: 'string', description: 'Join approval mode' },
    },
    required: ['name'],
  },
  handler: async (args: any) => {
    const input = validateInput(createCommunitySchema, args);
    logger.info('Creating community', { name: input.name });
    const result = await wsapiClient.post('/communities', input);
    return { success: true, communityId: result.id, message: 'Community created' };
  },
};

export const getCommunity: ToolHandler = {
  name: 'whatsapp_get_community',
  description: 'Get community info.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    const result = await wsapiClient.get(`/communities/${input.id}`);
    return { success: true, community: result };
  },
};

export const leaveCommunity: ToolHandler = {
  name: 'whatsapp_leave_community',
  description: 'Leave a community.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    await wsapiClient.post(`/communities/${input.id}/leave`, {});
    return { success: true, message: 'Left community' };
  },
};

export const setCommunityName: ToolHandler = {
  name: 'whatsapp_set_community_name',
  description: 'Set community name.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      name: { type: 'string', description: 'New name' },
    },
    required: ['id', 'name'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupNameSchema, args);
    await wsapiClient.put(`/communities/${input.id}/name`, { name: input.name });
    return { success: true, message: 'Community name updated' };
  },
};

export const setCommunityDescription: ToolHandler = {
  name: 'whatsapp_set_community_description',
  description: 'Set community description.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      description: { type: 'string', description: 'New description' },
    },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupDescriptionSchema, args);
    await wsapiClient.put(`/communities/${input.id}/description`, { description: input.description });
    return { success: true, message: 'Community description updated' };
  },
};

export const setCommunityPicture: ToolHandler = {
  name: 'whatsapp_set_community_picture',
  description: 'Set community profile picture.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      data: { type: 'string', description: 'Base64-encoded JPEG image' },
    },
    required: ['id', 'data'],
  },
  handler: async (args: any) => {
    const input = validateInput(setGroupPictureSchema, args);
    const result = await wsapiClient.post(`/communities/${input.id}/picture`, { data: input.data });
    return { success: true, pictureId: result.pictureId, message: 'Community picture updated' };
  },
};

export const setCommunityLocked: ToolHandler = {
  name: 'whatsapp_set_community_locked',
  description: 'Set community locked mode (only admins can edit info).',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      enabled: { type: 'boolean', description: 'Enable or disable' },
    },
    required: ['id', 'enabled'],
  },
  handler: async (args: any) => {
    const input = validateInput(setBoolSettingSchema, args);
    await wsapiClient.put(`/communities/${input.id}/settings/locked`, { enabled: input.enabled });
    return { success: true, message: 'Community locked mode updated' };
  },
};

export const getCommunityParticipants: ToolHandler = {
  name: 'whatsapp_get_community_participants',
  description: 'Get community participants.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    const result = await wsapiClient.get(`/communities/${input.id}/participants`);
    return { success: true, participants: result };
  },
};

export const updateCommunityParticipants: ToolHandler = {
  name: 'whatsapp_update_community_participants',
  description: 'Add, remove, promote, or demote community participants.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Participant JIDs' },
      action: { type: 'string', enum: ['add', 'remove', 'promote', 'demote'], description: 'Action' },
    },
    required: ['id', 'participants', 'action'],
  },
  handler: async (args: any) => {
    const input = validateInput(updateGroupParticipantsSchema, args);
    await wsapiClient.put(`/communities/${input.id}/participants`, { participants: input.participants, action: input.action });
    return { success: true, message: 'Community participants updated' };
  },
};

export const getCommunityInviteLink: ToolHandler = {
  name: 'whatsapp_get_community_invite_link',
  description: 'Get community invite link.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    const result = await wsapiClient.get(`/communities/${input.id}/invite-link`);
    return { success: true, link: result.link };
  },
};

export const resetCommunityInviteLink: ToolHandler = {
  name: 'whatsapp_reset_community_invite_link',
  description: 'Reset community invite link.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    const result = await wsapiClient.post(`/communities/${input.id}/invite-link/reset`, {});
    return { success: true, link: result.link };
  },
};

export const getCommunitySubGroups: ToolHandler = {
  name: 'whatsapp_get_community_sub_groups',
  description: 'Get community sub-groups.',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'Community JID' } },
    required: ['id'],
  },
  handler: async (args: any) => {
    const input = validateInput(getCommunitySchema, args);
    const result = await wsapiClient.get(`/communities/${input.id}/groups`);
    return { success: true, groups: result };
  },
};

export const createCommunityGroup: ToolHandler = {
  name: 'whatsapp_create_community_group',
  description: 'Create a new sub-group inside a community.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      name: { type: 'string', description: 'Group name' },
      participants: { type: 'array', items: { type: 'string' }, description: 'Participant JIDs' },
    },
    required: ['id', 'name'],
  },
  handler: async (args: any) => {
    const input = validateInput(createCommunityGroupSchema, args);
    const result = await wsapiClient.post(`/communities/${input.id}/groups`, { name: input.name, participants: input.participants });
    return { success: true, groupId: result.id, message: 'Community group created' };
  },
};

export const linkGroupToCommunity: ToolHandler = {
  name: 'whatsapp_link_group_to_community',
  description: 'Link an existing group to a community.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      groupId: { type: 'string', description: 'Group JID to link' },
    },
    required: ['id', 'groupId'],
  },
  handler: async (args: any) => {
    const input = validateInput(linkGroupToCommunitySchema, args);
    await wsapiClient.post(`/communities/${input.id}/groups/link`, { groupId: input.groupId });
    return { success: true, message: 'Group linked to community' };
  },
};

export const unlinkCommunityGroup: ToolHandler = {
  name: 'whatsapp_unlink_community_group',
  description: 'Unlink a group from a community.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Community JID' },
      groupId: { type: 'string', description: 'Group JID to unlink' },
    },
    required: ['id', 'groupId'],
  },
  handler: async (args: any) => {
    const input = validateInput(unlinkCommunityGroupSchema, args);
    await wsapiClient.delete(`/communities/${input.id}/groups/${input.groupId}`);
    return { success: true, message: 'Group unlinked from community' };
  },
};

export const communityTools = {
  listCommunities, createCommunity, getCommunity, leaveCommunity,
  setCommunityName, setCommunityDescription, setCommunityPicture, setCommunityLocked,
  getCommunityParticipants, updateCommunityParticipants,
  getCommunityInviteLink, resetCommunityInviteLink,
  getCommunitySubGroups, createCommunityGroup, linkGroupToCommunity, unlinkCommunityGroup,
};
