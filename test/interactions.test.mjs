import test from 'node:test';
import assert from 'node:assert/strict';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { createInteractionHandler } from '../src/interactions.mjs';

function makeInteraction(overrides = {}) {
  const interaction = {
    commandName: 'server-setup',
    customId: '',
    values: [],
    user: { id: 'user-1' },
    guild: { id: 'guild-1' },
    guildId: 'guild-1',
    locale: 'en-US',
    guildLocale: 'en-US',
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.ManageGuild },
    appPermissions: {
      has: (permission) =>
        permission === PermissionFlagsBits.ManageChannels
        || permission === PermissionFlagsBits.ViewChannel
    },
    isChatInputCommand: () => true,
    isButton: () => false,
    isStringSelectMenu: () => false,
    inGuild: () => true,
    async reply(payload) { this.replyPayload = payload; },
    async update(payload) { this.updatePayload = payload; },
    async editReply(payload) { this.editPayload = payload; },
    async followUp(payload) { this.followUpPayload = payload; }
  };
  return Object.assign(interaction, overrides);
}

test('the command opens a private picker and does not create anything', async () => {
  let createCalls = 0;
  const handler = createInteractionHandler({
    layoutCreator: async () => { createCalls += 1; }
  });
  const interaction = makeInteraction();
  await handler(interaction);
  assert.equal(interaction.replyPayload.flags, MessageFlags.Ephemeral);
  assert.match(interaction.replyPayload.content, /Nothing changes/);
  assert.equal(interaction.replyPayload.components.length, 2);
  assert.equal(createCalls, 0);
});

test('the localized command opens the wizard in Turkish', async () => {
  const handler = createInteractionHandler();
  const interaction = makeInteraction({ commandName: 'sunucu-kurulum', locale: 'en-US' });
  await handler(interaction);
  assert.match(interaction.replyPayload.content, /Oluştur düğmesine/);
});

test('members without Manage Server cannot open the wizard', async () => {
  const handler = createInteractionHandler();
  const interaction = makeInteraction({
    memberPermissions: { has: () => false }
  });
  await handler(interaction);
  assert.match(interaction.replyPayload.content, /Manage Server/);
  assert.equal(interaction.replyPayload.components, undefined);
});

test('choosing a template only previews it and requires a separate confirmation', async () => {
  let createCalls = 0;
  const handler = createInteractionHandler({
    layoutCreator: async () => { createCalls += 1; },
    layoutInspector: async () => ({
      categories: [
        {
          name: 'Start Here',
          action: 'reuse',
          channels: [
            { name: 'welcome', type: 'text', action: 'skip' },
            { name: 'rules', type: 'text', action: 'create' }
          ]
        }
      ]
    })
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:template:user-1:en',
    values: ['gaming'],
    isChatInputCommand: () => false,
    isStringSelectMenu: () => true
  });
  await handler(interaction);
  assert.match(interaction.updatePayload.content, /Preview: Gaming/);
  assert.match(interaction.updatePayload.content, /Review the exact channels/);
  assert.match(interaction.updatePayload.content, /existing category will be reused/);
  assert.match(interaction.updatePayload.content, /welcome.*already exists/);
  assert.match(interaction.updatePayload.content, /rules.*will be created/);
  assert.equal(
    interaction.updatePayload.components[0].toJSON().components[0].custom_id,
    'ss:create:user-1:gaming:en'
  );
  assert.equal(createCalls, 0);
});

test('the preview marks categories with custom permissions as skipped for safety', async () => {
  const handler = createInteractionHandler({
    layoutInspector: async () => ({
      categories: [
        {
          name: 'Start Here',
          action: 'protected',
          channels: [
            { name: 'welcome', type: 'text', action: 'blocked' }
          ]
        }
      ]
    })
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:template:user-1:en',
    values: ['community'],
    isChatInputCommand: () => false,
    isStringSelectMenu: () => true
  });
  await handler(interaction);
  assert.match(interaction.updatePayload.content, /custom permissions; skipped for safety/);
  assert.match(interaction.updatePayload.content, /skipped for safety with its category/);
  assert.match(interaction.updatePayload.content, /Items skipped because a category has custom permissions: 2/);
});

test('another member cannot use the setup controls', async () => {
  let createCalls = 0;
  const handler = createInteractionHandler({
    layoutCreator: async () => { createCalls += 1; }
  });
  const interaction = makeInteraction({
    commandName: '',
    user: { id: 'user-2' },
    customId: 'ss:create:user-1:community:en',
    isChatInputCommand: () => false,
    isButton: () => true
  });
  await handler(interaction);
  assert.match(interaction.replyPayload.content, /person who opened/);
  assert.equal(interaction.replyPayload.flags, MessageFlags.Ephemeral);
  assert.equal(createCalls, 0);
});

test('the layout is created only after confirmation and reports its result', async () => {
  const events = [];
  const handler = createInteractionHandler({
    layoutCreator: async (options) => {
      events.push('create');
      assert.equal(options.templateId, 'study');
      assert.equal(options.canManageChannels, true);
      return {
        created: [{ kind: 'category', name: 'Study Space' }],
        skipped: [{ kind: 'text', name: 'welcome' }],
        protected: [],
        errors: []
      };
    }
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:create:user-1:study:en',
    isChatInputCommand: () => false,
    isButton: () => true,
    async update(payload) {
      events.push('acknowledge');
      this.updatePayload = payload;
    },
    async editReply(payload) {
      events.push('report');
      this.editPayload = payload;
    }
  });
  await handler(interaction);
  assert.deepEqual(events, ['acknowledge', 'create', 'report']);
  assert.match(interaction.editPayload.content, /Setup finished/);
  assert.match(interaction.editPayload.content, /Study Space/);
  assert.match(interaction.editPayload.content, /left unchanged/);
});

test('a protected-only result explains that the category was intentionally skipped', async () => {
  const handler = createInteractionHandler({
    layoutCreator: async () => ({
      created: [],
      skipped: [],
      protected: [
        { kind: 'category', name: 'Start Here' },
        { kind: 'text', name: 'welcome' }
      ],
      errors: []
    })
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:create:user-1:community:en',
    isChatInputCommand: () => false,
    isButton: () => true
  });
  await handler(interaction);
  assert.match(interaction.editPayload.content, /protected categories skipped for safety/);
  assert.match(interaction.editPayload.content, /Start Here/);
});

test('missing Manage Channels stops before channel creation', async () => {
  let createCalls = 0;
  const handler = createInteractionHandler({
    layoutCreator: async () => { createCalls += 1; }
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:create:user-1:community:en',
    isChatInputCommand: () => false,
    isButton: () => true,
    appPermissions: { has: () => false }
  });
  await handler(interaction);
  assert.match(interaction.updatePayload.content, /needs View Channels and Manage Channels/);
  assert.equal(createCalls, 0);
});

test('the preview is unavailable when the bot cannot view existing channels', async () => {
  let inspectionCalls = 0;
  const handler = createInteractionHandler({
    layoutInspector: async () => {
      inspectionCalls += 1;
      return { categories: [] };
    }
  });
  const interaction = makeInteraction({
    commandName: '',
    customId: 'ss:template:user-1:en',
    values: ['community'],
    isChatInputCommand: () => false,
    isStringSelectMenu: () => true,
    appPermissions: { has: (permission) => permission === PermissionFlagsBits.ManageChannels }
  });
  await handler(interaction);
  assert.match(interaction.updatePayload.content, /needs View Channels and Manage Channels/);
  assert.equal(inspectionCalls, 0);
});
