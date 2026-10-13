import { REST, Routes } from 'discord.js';
import { setupCommand } from '../src/commands.mjs';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID in your private .env file first.');
}

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

const command = await rest.post(route, { body: setupCommand.toJSON() });
console.log('Registered /' + command.name + (guildId ? ' for the selected test server.' : ' globally.'));
