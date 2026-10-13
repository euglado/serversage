import { ChannelType } from 'discord.js';
import { getLocalizedTemplate } from './templates.mjs';
import { discordAdapter } from './discord-adapter.mjs';

const guildQueues = new Map();

export class SetupError extends Error {
  constructor(code) {
    super(code);
    this.name = 'SetupError';
    this.code = code;
  }
}

function normalizedName(value) {
  return String(value).normalize('NFKC').toLocaleLowerCase('en-US');
}

function queueForGuild(guildId, operation) {
  const previous = guildQueues.get(guildId) ?? Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const queued = previous.then(() => gate);
  guildQueues.set(guildId, queued);

  return previous.then(operation).finally(() => {
    release();
    if (guildQueues.get(guildId) === queued) guildQueues.delete(guildId);
  });
}

function safeErrorCode(error) {
  if (typeof error?.code === 'number' || typeof error?.code === 'string') {
    return String(error.code).slice(0, 24);
  }
  return 'unknown';
}

function findCategory(channels, name) {
  return channels.find((channel) =>
    channel.type === ChannelType.GuildCategory
    && normalizedName(channel.name) === normalizedName(name)
  );
}

function findChildChannel(channels, categoryId, channelSpec) {
  const channelType = channelSpec.type === 'voice'
    ? ChannelType.GuildVoice
    : ChannelType.GuildText;
  return channels.find((channel) =>
    channel.type === channelType
    && channel.parentId === categoryId
    && normalizedName(channel.name) === normalizedName(channelSpec.name)
  );
}

function hasCustomPermissions(category) {
  return (category.permissionOverwrites?.cache?.size ?? 0) > 0;
}

function validateRequest(guild, templateId, language) {
  const template = getLocalizedTemplate(templateId, language);
  if (!template) throw new SetupError('unknown_template');
  if (!guild?.id) throw new SetupError('guild_required');
  return template;
}

function buildPlan(template, templateId, channels) {
  return {
    templateId,
    categories: template.categories.map((categorySpec) => {
      const existingCategory = findCategory(channels, categorySpec.name);
      const protectedCategory = Boolean(existingCategory && hasCustomPermissions(existingCategory));
      return {
        name: categorySpec.name,
        action: protectedCategory ? 'protected' : existingCategory ? 'reuse' : 'create',
        categoryId: existingCategory?.id ?? null,
        channels: categorySpec.channels.map((channelSpec) => ({
          name: channelSpec.name,
          type: channelSpec.type,
          action: protectedCategory
            ? 'blocked'
            : existingCategory && findChildChannel(channels, existingCategory.id, channelSpec)
              ? 'skip'
              : 'create'
        }))
      };
    })
  };
}

export async function inspectLayout({
  guild,
  templateId,
  language = 'en',
  adapter = discordAdapter
}) {
  const template = validateRequest(guild, templateId, language);
  const channels = [...await adapter.listChannels(guild)];
  return buildPlan(template, templateId, channels);
}

export async function createLayout({
  guild,
  templateId,
  language = 'en',
  canManageChannels = false,
  adapter = discordAdapter
}) {
  const template = validateRequest(guild, templateId, language);
  if (!canManageChannels) throw new SetupError('missing_manage_channels');

  return queueForGuild(guild.id, async () => {
    const channels = [...await adapter.listChannels(guild)];
    const plan = buildPlan(template, templateId, channels);
    const result = { created: [], skipped: [], protected: [], errors: [] };

    for (const categoryPlan of plan.categories) {
      const categoryName = categoryPlan.name;
      if (categoryPlan.action === 'protected') {
        result.protected.push({ kind: 'category', name: categoryName });
        for (const channelPlan of categoryPlan.channels) {
          result.protected.push({ kind: channelPlan.type, name: channelPlan.name });
        }
        continue;
      }
      let category = categoryPlan.categoryId
        ? channels.find((channel) => channel.id === categoryPlan.categoryId)
        : null;

      if (category) {
        result.skipped.push({ kind: 'category', name: categoryName });
      } else {
        try {
          category = await adapter.createCategory(guild, categoryName);
          channels.push(category);
          result.created.push({ kind: 'category', name: categoryName });
        } catch (error) {
          result.errors.push({
            kind: 'category',
            name: categoryName,
            code: safeErrorCode(error)
          });
          continue;
        }
      }

      for (const channelPlan of categoryPlan.channels) {
        const channelName = channelPlan.name;
        if (channelPlan.action === 'blocked') {
          result.protected.push({ kind: channelPlan.type, name: channelName });
          continue;
        }
        if (channelPlan.action === 'skip') {
          result.skipped.push({ kind: channelPlan.type, name: channelName });
          continue;
        }

        try {
          const created = await adapter.createChannel(
            guild,
            { name: channelName, type: channelPlan.type },
            category.id
          );
          channels.push(created);
          result.created.push({ kind: channelPlan.type, name: channelName });
        } catch (error) {
          result.errors.push({
            kind: channelPlan.type,
            name: channelName,
            code: safeErrorCode(error)
          });
        }
      }
    }

    return result;
  });
}
