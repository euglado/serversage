import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags
} from 'discord.js';
import { createInteractionHandler } from './interactions.mjs';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN is missing. Copy .env.example to .env and add your bot token.');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});
const handleInteraction = createInteractionHandler();

client.once(Events.ClientReady, (readyClient) => {
  console.log('ServerSage is ready as ' + readyClient.user.tag + '.');
  console.log('Use /server-setup or /sunucu-kurulum in a server where you have Manage Server.');
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    const code = String(error?.code ?? 'unknown').slice(0, 24);
    console.error('Interaction failed with code ' + code + '.');
    if (!interaction.isRepliable?.()) return;
    const reply = {
      content: 'Something went wrong while handling this command. Check the bot setup and try again.',
      flags: MessageFlags.Ephemeral
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord connection error with code ' + String(error?.code ?? 'unknown').slice(0, 24) + '.');
});

await client.login(token);
