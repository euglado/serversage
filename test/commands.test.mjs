import test from 'node:test';
import assert from 'node:assert/strict';
import { InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { setupCommand } from '../src/commands.mjs';

test('the setup command is localized and limited to server managers', () => {
  const command = setupCommand.toJSON();
  assert.equal(command.name, 'server-setup');
  assert.equal(command.name_localizations.tr, 'sunucu-kurulum');
  assert.equal(command.default_member_permissions, String(PermissionFlagsBits.ManageGuild));
  assert.deepEqual(command.contexts, [InteractionContextType.Guild]);
});
