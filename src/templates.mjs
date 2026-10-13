const definitions = {
  community: {
    label: { en: 'Community', tr: 'Topluluk' },
    description: {
      en: 'A welcoming place for announcements, introductions, and chat.',
      tr: 'Duyurular, tanışma ve sohbet için sıcak bir başlangıç.'
    },
    categories: [
      {
        names: { en: 'Start Here', tr: 'Başlangıç' },
        channels: [
          { type: 'text', names: { en: 'welcome', tr: 'hos-geldin' } },
          { type: 'text', names: { en: 'rules', tr: 'kurallar' } },
          { type: 'text', names: { en: 'announcements', tr: 'duyurular' } }
        ]
      },
      {
        names: { en: 'Community', tr: 'Topluluk' },
        channels: [
          { type: 'text', names: { en: 'general', tr: 'sohbet' } },
          { type: 'text', names: { en: 'introductions', tr: 'tanisma' } },
          { type: 'text', names: { en: 'questions', tr: 'sorular' } }
        ]
      },
      {
        names: { en: 'Voice', tr: 'Ses Kanalları' },
        channels: [
          { type: 'voice', names: { en: 'Lounge', tr: 'Sohbet Odası' } }
        ]
      }
    ]
  },
  gaming: {
    label: { en: 'Gaming', tr: 'Oyun' },
    description: {
      en: 'Find teammates, share clips, and join voice chat.',
      tr: 'Takım arkadaşı bulun, klip paylaşın ve sesli sohbete katılın.'
    },
    categories: [
      {
        names: { en: 'Start Here', tr: 'Başlangıç' },
        channels: [
          { type: 'text', names: { en: 'welcome', tr: 'hos-geldin' } },
          { type: 'text', names: { en: 'rules', tr: 'kurallar' } },
          { type: 'text', names: { en: 'announcements', tr: 'duyurular' } }
        ]
      },
      {
        names: { en: 'Gaming', tr: 'Oyun' },
        channels: [
          { type: 'text', names: { en: 'general', tr: 'sohbet' } },
          { type: 'text', names: { en: 'looking-for-group', tr: 'takim-arkadasi' } },
          { type: 'text', names: { en: 'highlights', tr: 'klipler' } }
        ]
      },
      {
        names: { en: 'Voice', tr: 'Ses Kanalları' },
        channels: [
          { type: 'voice', names: { en: 'Party Room', tr: 'Takım Odası' } }
        ]
      }
    ]
  },
  study: {
    label: { en: 'Study', tr: 'Eğitim' },
    description: {
      en: 'Organize study rooms, questions, and useful resources.',
      tr: 'Çalışma odalarını, soruları ve kaynakları düzenleyin.'
    },
    categories: [
      {
        names: { en: 'Start Here', tr: 'Başlangıç' },
        channels: [
          { type: 'text', names: { en: 'welcome', tr: 'hos-geldin' } },
          { type: 'text', names: { en: 'rules', tr: 'kurallar' } },
          { type: 'text', names: { en: 'announcements', tr: 'duyurular' } }
        ]
      },
      {
        names: { en: 'Study Space', tr: 'Ders Çalışma' },
        channels: [
          { type: 'text', names: { en: 'study-room', tr: 'ders-odasi' } },
          { type: 'text', names: { en: 'questions', tr: 'sorular' } },
          { type: 'text', names: { en: 'resources', tr: 'kaynaklar' } }
        ]
      },
      {
        names: { en: 'Voice', tr: 'Ses Kanalları' },
        channels: [
          { type: 'voice', names: { en: 'Study Hall', tr: 'Sessiz Çalışma' } }
        ]
      }
    ]
  }
};

export const TEMPLATE_IDS = Object.freeze(Object.keys(definitions));
export const TEMPLATES = Object.freeze(definitions);

export function resolveLanguage(value) {
  return value === 'tr' ? 'tr' : 'en';
}

export function getTemplate(templateId) {
  return definitions[templateId] ?? null;
}

export function getLocalizedTemplate(templateId, language = 'en') {
  const template = getTemplate(templateId);
  if (!template) return null;
  const locale = resolveLanguage(language);
  return {
    id: templateId,
    label: template.label[locale],
    description: template.description[locale],
    categories: template.categories.map((category) => ({
      name: category.names[locale],
      channels: category.channels.map((channel) => ({
        name: channel.names[locale],
        type: channel.type
      }))
    }))
  };
}

export function formatTemplateTree(templateId, language = 'en') {
  const template = getLocalizedTemplate(templateId, language);
  if (!template) return '';
  return template.categories.map((category) => {
    const children = category.channels.map((channel) => {
      const marker = channel.type === 'voice' ? '🔊' : '#';
      return '  ' + marker + ' ' + channel.name;
    });
    return '▸ ' + category.name + '\n' + children.join('\n');
  }).join('\n\n');
}
