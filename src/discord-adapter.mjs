import { ChannelType } from 'discord.js';

export const discordAdapter = Object.freeze({
  async listChannels(guild) {
    const channels = await guild.channels.fetch();
    return [...channels.values()];
  },

  createCategory(guild, name) {
    return guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      reason: 'ServerSage setup wizard confirmed by a server manager'
    });
  },

  createChannel(guild, channel, parentId) {
    return guild.channels.create({
      name: channel.name,
      type: channel.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
      parent: parentId,
      reason: 'ServerSage setup wizard confirmed by a server manager'
    });
  }
});
