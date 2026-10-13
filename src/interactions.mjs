import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { TEMPLATE_IDS, getLocalizedTemplate, resolveLanguage } from './templates.mjs';
import { createLayout, inspectLayout, SetupError } from './setup-service.mjs';

const COPY = {
  en: {
    choose: 'Choose a starter layout. Nothing changes until you press Create layout.',
    previewLead: 'Preview: ',
    previewTail: 'Review the exact channels below. Hidden categories may not appear if ServerSage cannot view them.',
    previewSummary: 'Categories to add: ',
    previewChannels: 'Channels to add: ',
    previewExisting: 'Existing channels to leave alone: ',
    previewProtected: 'Items skipped because a category has custom permissions: ',
    categoryCreate: 'new category',
    categoryReuse: 'existing category will be reused',
    categoryProtected: 'existing category has custom permissions; skipped for safety',
    itemCreate: 'will be created',
    itemSkip: 'already exists; will be left alone',
    itemProtected: 'skipped for safety with its category',
    create: 'Create layout',
    change: 'Choose another',
    cancel: 'Cancel',
    cancelled: 'Setup cancelled. Your server was not changed.',
    progress: 'Creating the layout you approved. This may take a few seconds...',
    complete: 'Setup finished.',
    noChanges: 'Everything in this layout already exists. Nothing was changed.',
    safeSkipped: 'Setup finished with protected categories skipped for safety.',
    created: 'Created',
    skipped: 'Already existed and left unchanged',
    protected: 'Skipped for safety',
    errors: 'Could not create',
    partial: 'Some items were not created. Check the bot permissions and try again. Items already created will be skipped safely on retry.',
    manageServer: 'Only members with Manage Server can use this setup wizard.',
    manageChannels: 'ServerSage needs View Channels and Manage Channels to safely check and create this layout. Ask a server administrator to grant both permissions, then try again.',
    previewError: 'ServerSage could not check the existing channels. Confirm that it has View Channels, then choose the template again.',
    wrongUser: 'Only the person who opened this setup can use these buttons.',
    unknown: 'That setup choice is no longer available. Run /server-setup again.',
    genericError: 'Discord could not finish the setup. Check that ServerSage has View Channels and Manage Channels, then retry. Anything already created will be left in place.',
    category: 'category',
    text: 'text channel',
    voice: 'voice channel'
  },
  tr: {
    choose: 'Bir hazır düzen seçin. Oluştur düğmesine basana kadar sunucuda değişiklik yapılmaz.',
    previewLead: 'Önizleme: ',
    previewTail: 'Oluşacak kanalları kontrol edin. ServerSage’in göremediği gizli kategoriler önizlemede görünmeyebilir.',
    previewSummary: 'Oluşturulacak kategori sayısı: ',
    previewChannels: 'Oluşturulacak kanal sayısı: ',
    previewExisting: 'Olduğu gibi bırakılacak kanal sayısı: ',
    previewProtected: 'Özel kategori izinleri nedeniyle güvenlik için atlanacak öğe sayısı: ',
    categoryCreate: 'yeni kategori oluşturulacak',
    categoryReuse: 'var olan kategori kullanılacak',
    categoryProtected: 'özel izinli mevcut kategori; güvenlik için atlandı',
    itemCreate: 'oluşturulacak',
    itemSkip: 'zaten var, olduğu gibi bırakılacak',
    itemProtected: 'özel izinli kategorisiyle birlikte güvenlik için atlanacak',
    create: 'Düzeni oluştur',
    change: 'Başka düzen seç',
    cancel: 'Vazgeç',
    cancelled: 'Kurulum iptal edildi. Sunucunuzda değişiklik yapılmadı.',
    progress: 'Onayladığınız düzen oluşturuluyor. Biraz sürebilir...',
    complete: 'Kurulum tamamlandı.',
    noChanges: 'Bu düzendeki her şey zaten var. Hiçbir değişiklik yapılmadı.',
    safeSkipped: 'Kurulum tamamlandı; özel izinli kategoriler güvenlik için atlandı.',
    created: 'Oluşturuldu',
    skipped: 'Zaten vardı, olduğu gibi bırakıldı',
    protected: 'Güvenlik için atlandı',
    errors: 'Oluşturulamadı',
    partial: 'Bazı öğeler oluşturulamadı. Bot izinlerini kontrol edip yeniden deneyin. Oluşturulmuş öğeler tekrar denemede güvenle atlanır.',
    manageServer: 'Bu kurulum sihirbazını yalnızca Sunucuyu Yönet izni olan üyeler kullanabilir.',
    manageChannels: 'ServerSage bu düzeni güvenle kontrol edip oluşturmak için Kanalları Görüntüle ve Kanalları Yönet izinlerine ihtiyaç duyar. Sunucu yöneticinizden iki izni de isteyip yeniden deneyin.',
    previewError: 'ServerSage var olan kanalları kontrol edemedi. Kanalları Görüntüle iznini doğrulayıp şablonu yeniden seçin.',
    wrongUser: 'Bu düğmeleri yalnızca kurulumu başlatan kişi kullanabilir.',
    unknown: 'Bu kurulum seçeneği artık kullanılamıyor. /sunucu-kurulum komutunu yeniden çalıştırın.',
    genericError: 'Discord kurulumu tamamlayamadı. ServerSage için Kanalları Görüntüle ve Kanalları Yönet izinlerini kontrol edip yeniden deneyin. Oluşturulmuş öğeler yerinde kalır.',
    category: 'kategori',
    text: 'yazı kanalı',
    voice: 'ses kanalı'
  }
};

function languageFor(interaction) {
  if (interaction.commandName === 'sunucu-kurulum') return 'tr';
  const userLocale = interaction.locale?.toLowerCase();
  if (userLocale?.startsWith('tr')) return 'tr';
  if (userLocale?.startsWith('en')) return 'en';
  if (interaction.guildLocale?.toLowerCase().startsWith('tr')) return 'tr';
  return 'en';
}

function isServerManager(interaction) {
  return Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild));
}

function pickerComponents(userId, language) {
  const copy = COPY[language];
  const select = new StringSelectMenuBuilder()
    .setCustomId('ss:template:' + userId + ':' + language)
    .setPlaceholder(language === 'tr' ? 'Bir düzen seçin' : 'Select a layout')
    .addOptions(TEMPLATE_IDS.map((id) => {
      const template = getLocalizedTemplate(id, language);
      return new StringSelectMenuOptionBuilder()
        .setLabel(template.label)
        .setDescription(template.description)
        .setValue(id);
    }));

  return [
    new ActionRowBuilder().addComponents(select),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ss:cancel:' + userId + ':' + language)
        .setLabel(copy.cancel)
        .setStyle(ButtonStyle.Secondary)
    )
  ];
}

function previewComponents(userId, templateId, language) {
  const copy = COPY[language];
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ss:create:' + userId + ':' + templateId + ':' + language)
        .setLabel(copy.create)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ss:back:' + userId + ':' + language)
        .setLabel(copy.change)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ss:cancel:' + userId + ':' + language)
        .setLabel(copy.cancel)
        .setStyle(ButtonStyle.Danger)
    )
  ];
}

function previewText(templateId, language, plan) {
  const copy = COPY[language];
  const template = getLocalizedTemplate(templateId, language);
  if (!template) return copy.unknown;
  const createCategories = plan.categories.filter((category) => category.action === 'create').length;
  const createChannels = plan.categories.reduce((count, category) =>
    count + category.channels.filter((channel) => channel.action === 'create').length, 0);
  const skipChannels = plan.categories.reduce((count, category) =>
    count + category.channels.filter((channel) => channel.action === 'skip').length, 0);
  const protectedItems = plan.categories.reduce((count, category) =>
    count + (category.action === 'protected' ? 1 + category.channels.length : 0), 0);
  const lines = [
    copy.previewLead + template.label,
    '',
    copy.previewSummary + createCategories + '\n'
      + copy.previewChannels + createChannels + '\n'
      + copy.previewExisting + skipChannels + '\n'
      + copy.previewProtected + protectedItems + '.',
    ''
  ];

  for (const category of plan.categories) {
    const categoryAction = category.action === 'create'
      ? copy.categoryCreate
      : category.action === 'protected'
        ? copy.categoryProtected
        : copy.categoryReuse;
    lines.push('▸ ' + category.name + ' — ' + categoryAction);
    for (const channel of category.channels) {
      const marker = channel.type === 'voice' ? '🔊' : '#';
      const channelAction = channel.action === 'create'
        ? copy.itemCreate
        : channel.action === 'blocked'
          ? copy.itemProtected
          : copy.itemSkip;
      lines.push('  ' + marker + ' ' + channel.name + ' — ' + channelAction);
    }
    lines.push('');
  }

  lines.push(copy.previewTail);
  return lines.join('\n');
}

function formatResult(result, language) {
  const copy = COPY[language];
  if (result.created.length === 0 && result.errors.length === 0 && result.protected.length === 0) {
    return copy.noChanges;
  }

  const lines = [
    result.errors.length
      ? copy.partial
      : result.protected.length
        ? copy.safeSkipped
        : copy.complete
  ];
  if (result.created.length) {
    lines.push('', copy.created + ':');
    for (const item of result.created) {
      lines.push('• ' + item.name + ' (' + copy[item.kind] + ')');
    }
  }
  if (result.skipped.length) {
    lines.push('', copy.skipped + ':');
    for (const item of result.skipped) {
      lines.push('• ' + item.name + ' (' + copy[item.kind] + ')');
    }
  }
  if (result.protected.length) {
    lines.push('', copy.protected + ':');
    for (const item of result.protected) {
      lines.push('• ' + item.name + ' (' + copy[item.kind] + ')');
    }
  }
  if (result.errors.length) {
    lines.push('', copy.errors + ':');
    for (const item of result.errors) {
      lines.push('• ' + item.name + ' (' + copy[item.kind] + '; code ' + item.code + ')');
    }
  }
  return lines.join('\n');
}

function safeCode(error) {
  return String(error?.code ?? 'unknown').slice(0, 24);
}

export function createInteractionHandler({
  layoutCreator = createLayout,
  layoutInspector = inspectLayout,
  adapter,
  logger = console
} = {}) {
  return async function handleInteraction(interaction) {
    if (interaction.isChatInputCommand?.()) {
      if (!['server-setup', 'sunucu-kurulum'].includes(interaction.commandName)) return;
      const language = languageFor(interaction);
      if (!interaction.inGuild?.() || !interaction.guild) {
        await interaction.reply({
          content: COPY[language].unknown,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      if (!isServerManager(interaction)) {
        await interaction.reply({
          content: COPY[language].manageServer,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      await interaction.reply({
        content: COPY[language].choose,
        components: pickerComponents(interaction.user.id, language),
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!interaction.isButton?.() && !interaction.isStringSelectMenu?.()) return;
    const parts = String(interaction.customId ?? '').split(':');
    if (parts[0] !== 'ss') return;
    const action = parts[1];
    const ownerId = parts[2];
    if (interaction.user?.id !== ownerId) {
      const language = resolveLanguage(parts.at(-1));
      const response = { content: COPY[language].wrongUser, flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) await interaction.followUp(response);
      else await interaction.reply(response);
      return;
    }

    if (action === 'cancel') {
      const language = resolveLanguage(parts[3] ?? languageFor(interaction));
      await interaction.update({ content: COPY[language].cancelled, components: [] });
      return;
    }

    if (action === 'template' && interaction.isStringSelectMenu?.()) {
      const language = resolveLanguage(parts[3]);
      const templateId = interaction.values?.[0];
      if (!getLocalizedTemplate(templateId, language)) {
        await interaction.update({ content: COPY[language].unknown, components: [] });
        return;
      }
      if (!interaction.inGuild?.() || !interaction.guild) {
        await interaction.update({ content: COPY[language].unknown, components: [] });
        return;
      }
      if (!isServerManager(interaction)) {
        await interaction.update({ content: COPY[language].manageServer, components: [] });
        return;
      }
      const canViewChannels = Boolean(
        interaction.appPermissions?.has(PermissionFlagsBits.ViewChannel)
      );
      if (!canViewChannels) {
        await interaction.update({ content: COPY[language].manageChannels, components: [] });
        return;
      }
      try {
        const options = { guild: interaction.guild, templateId, language };
        if (adapter) options.adapter = adapter;
        const plan = await layoutInspector(options);
        await interaction.update({
          content: previewText(templateId, language, plan),
          components: previewComponents(ownerId, templateId, language)
        });
      } catch (error) {
        logger.error?.('ServerSage preview failed with code ' + safeCode(error));
        await interaction.update({ content: COPY[language].previewError, components: [] });
      }
      return;
    }

    if (action === 'back' && interaction.isButton?.()) {
      const language = resolveLanguage(parts[3]);
      await interaction.update({
        content: COPY[language].choose,
        components: pickerComponents(ownerId, language)
      });
      return;
    }

    if (action === 'create' && interaction.isButton?.()) {
      const templateId = parts[3];
      const language = resolveLanguage(parts[4]);
      if (!getLocalizedTemplate(templateId, language)) {
        await interaction.update({ content: COPY[language].unknown, components: [] });
        return;
      }
      if (!isServerManager(interaction)) {
        await interaction.update({ content: COPY[language].manageServer, components: [] });
        return;
      }
      const canManageChannels = Boolean(
        interaction.appPermissions?.has(PermissionFlagsBits.ManageChannels)
        && interaction.appPermissions?.has(PermissionFlagsBits.ViewChannel)
      );
      if (!canManageChannels) {
        await interaction.update({ content: COPY[language].manageChannels, components: [] });
        return;
      }

      await interaction.update({ content: COPY[language].progress, components: [] });
      try {
        const options = {
          guild: interaction.guild,
          templateId,
          language,
          canManageChannels
        };
        if (adapter) options.adapter = adapter;
        const result = await layoutCreator(options);
        await interaction.editReply({ content: formatResult(result, language), components: [] });
      } catch (error) {
        logger.error?.('ServerSage setup failed with code ' + safeCode(error));
        const message = error instanceof SetupError && error.code === 'missing_manage_channels'
          ? COPY[language].manageChannels
          : COPY[language].genericError;
        await interaction.editReply({ content: message, components: [] });
      }
    }
  };
}

export const interactionCopy = COPY;
