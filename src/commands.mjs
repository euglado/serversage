import {
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';

export const setupCommand = new SlashCommandBuilder()
  .setName('server-setup')
  .setNameLocalizations({ tr: 'sunucu-kurulum' })
  .setDescription('Preview a starter layout and create it after confirmation.')
  .setDescriptionLocalizations({
    tr: 'Hazır bir sunucu düzenini önizleyin ve onaylayınca oluşturun.'
  })
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export const commands = Object.freeze([setupCommand]);
