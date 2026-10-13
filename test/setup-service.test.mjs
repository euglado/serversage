import test from 'node:test';
import assert from 'node:assert/strict';
import { ChannelType } from 'discord.js';
import { createLayout, inspectLayout, SetupError } from '../src/setup-service.mjs';

function createAdapter({ initial = [], failCategory, failChannel } = {}) {
  const channels = [...initial];
  const calls = { list: 0, categories: [], children: [] };
  let nextId = 1;

  return {
    channels,
    calls,
    async listChannels() {
      calls.list += 1;
      return [...channels];
    },
    async createCategory(_guild, name) {
      calls.categories.push(name);
      if (name === failCategory) throw Object.assign(new Error('private detail'), { code: 50013 });
      const channel = {
        id: 'category-' + nextId++,
        name,
        type: ChannelType.GuildCategory,
        parentId: null
      };
      channels.push(channel);
      return channel;
    },
    async createChannel(_guild, channel, parentId) {
      calls.children.push({ ...channel, parentId });
      if (channel.name === failChannel) throw Object.assign(new Error('private detail'), { code: 50013 });
      const created = {
        id: 'channel-' + nextId++,
        name: channel.name,
        type: channel.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
        parentId
      };
      channels.push(created);
      return created;
    }
  };
}

const guild = { id: 'guild-1' };

test('creates the chosen layout only after permission preflight', async () => {
  const adapter = createAdapter();
  const result = await createLayout({
    guild,
    templateId: 'community',
    language: 'en',
    canManageChannels: true,
    adapter
  });
  assert.equal(result.created.length, 10);
  assert.equal(result.created.filter((item) => item.kind === 'category').length, 3);
  assert.equal(result.created.filter((item) => item.kind === 'text').length, 6);
  assert.equal(result.created.filter((item) => item.kind === 'voice').length, 1);
  assert.equal(result.skipped.length, 0);
  assert.equal(result.errors.length, 0);
  assert.equal(adapter.calls.list, 1);
});

test('a second run skips everything already created without duplicates', async () => {
  const adapter = createAdapter();
  const options = { guild, templateId: 'gaming', canManageChannels: true, adapter };
  const first = await createLayout(options);
  const second = await createLayout(options);
  assert.equal(first.created.length, 10);
  assert.equal(second.created.length, 0);
  assert.equal(second.skipped.length, 10);
  assert.equal(adapter.channels.length, 10);
});

test('inspection labels existing and new items without creating anything', async () => {
  const existingCategory = {
    id: 'cat-start',
    name: 'Start Here',
    type: ChannelType.GuildCategory,
    parentId: null
  };
  const existingWelcome = {
    id: 'channel-welcome',
    name: 'welcome',
    type: ChannelType.GuildText,
    parentId: 'cat-start'
  };
  const adapter = createAdapter({ initial: [existingCategory, existingWelcome] });
  const plan = await inspectLayout({
    guild,
    templateId: 'community',
    language: 'en',
    adapter
  });
  assert.equal(plan.categories[0].action, 'reuse');
  assert.equal(plan.categories[0].channels[0].action, 'skip');
  assert.equal(plan.categories[0].channels[1].action, 'create');
  assert.equal(plan.categories[1].action, 'create');
  assert.equal(adapter.calls.categories.length, 0);
  assert.equal(adapter.calls.children.length, 0);
  assert.equal(adapter.channels.length, 2);
});

test('categories with custom permissions and their channels are skipped for safety', async () => {
  const protectedCategory = {
    id: 'cat-private',
    name: 'Start Here',
    type: ChannelType.GuildCategory,
    parentId: null,
    permissionOverwrites: { cache: { size: 1 } }
  };
  const adapter = createAdapter({ initial: [protectedCategory] });
  const plan = await inspectLayout({
    guild,
    templateId: 'community',
    language: 'en',
    adapter
  });
  assert.equal(plan.categories[0].action, 'protected');
  assert.equal(plan.categories[0].channels.every((channel) => channel.action === 'blocked'), true);

  const result = await createLayout({
    guild,
    templateId: 'community',
    canManageChannels: true,
    adapter
  });
  assert.equal(result.protected.length, 4);
  assert.equal(result.protected[0].name, 'Start Here');
  assert.equal(adapter.calls.categories.includes('Start Here'), false);
  assert.equal(adapter.calls.children.some((channel) => channel.parentId === 'cat-private'), false);
  assert.equal(adapter.channels.find((channel) => channel.id === 'cat-private').permissionOverwrites.cache.size, 1);
});

test('permission and template failures happen before Discord calls', async () => {
  const adapter = createAdapter();
  await assert.rejects(
    createLayout({ guild, templateId: 'study', adapter }),
    (error) => error instanceof SetupError && error.code === 'missing_manage_channels'
  );
  await assert.rejects(
    createLayout({ guild, templateId: 'unknown', canManageChannels: true, adapter }),
    (error) => error instanceof SetupError && error.code === 'unknown_template'
  );
  assert.equal(adapter.calls.list, 0);
  assert.equal(adapter.calls.categories.length, 0);
});

test('only a matching channel inside the matching category is skipped', async () => {
  const existingCategory = {
    id: 'cat-start',
    name: 'start here',
    type: ChannelType.GuildCategory,
    parentId: null
  };
  const existingWelcome = {
    id: 'channel-welcome',
    name: 'WELCOME',
    type: ChannelType.GuildText,
    parentId: 'cat-start'
  };
  const sameNameElsewhere = {
    id: 'other-category',
    name: 'Other',
    type: ChannelType.GuildCategory,
    parentId: null
  };
  const unrelatedWelcome = {
    id: 'unrelated-welcome',
    name: 'welcome',
    type: ChannelType.GuildText,
    parentId: 'other-category'
  };
  const adapter = createAdapter({
    initial: [existingCategory, existingWelcome, sameNameElsewhere, unrelatedWelcome]
  });
  const result = await createLayout({
    guild,
    templateId: 'community',
    canManageChannels: true,
    adapter
  });
  assert.equal(result.skipped.some((item) => item.name === 'welcome'), true);
  assert.equal(adapter.calls.children.some((item) => item.name === 'welcome'), false);
  assert.equal(adapter.channels.filter((item) => item.id === 'unrelated-welcome').length, 1);
});

test('a category failure is reported and its child channels are not attempted', async () => {
  const adapter = createAdapter({ failCategory: 'Start Here' });
  const result = await createLayout({
    guild,
    templateId: 'community',
    canManageChannels: true,
    adapter
  });
  assert.equal(result.errors.length, 1);
  assert.deepEqual(result.errors[0], { kind: 'category', name: 'Start Here', code: '50013' });
  assert.equal(adapter.calls.children.some((item) => item.name === 'welcome'), false);
  assert.equal(result.created.some((item) => item.name === 'Community'), true);
});

test('a partial channel failure can be retried without duplicating completed work', async () => {
  let failedOnce = false;
  const adapter = createAdapter();
  const originalCreateChannel = adapter.createChannel;
  adapter.createChannel = async (...args) => {
    if (args[1].name === 'general' && !failedOnce) {
      failedOnce = true;
      throw Object.assign(new Error('private detail'), { code: 50013 });
    }
    return originalCreateChannel(...args);
  };
  const options = { guild, templateId: 'community', canManageChannels: true, adapter };
  const first = await createLayout(options);
  const second = await createLayout(options);
  assert.equal(first.errors.length, 1);
  assert.equal(first.errors[0].name, 'general');
  assert.equal(first.errors[0].code, '50013');
  assert.equal(second.errors.length, 0);
  assert.equal(second.created.length, 1);
  assert.equal(adapter.channels.filter((item) => item.name === 'general').length, 1);
});

test('simultaneous setup requests for one server are serialized', async () => {
  const adapter = createAdapter();
  const options = { guild, templateId: 'study', canManageChannels: true, adapter };
  const [first, second] = await Promise.all([createLayout(options), createLayout(options)]);
  assert.equal(first.created.length + second.created.length, 10);
  assert.equal(first.skipped.length + second.skipped.length, 10);
  assert.equal(adapter.channels.length, 10);
});
