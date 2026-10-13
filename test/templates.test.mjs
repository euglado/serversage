import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEMPLATE_IDS,
  formatTemplateTree,
  getLocalizedTemplate,
  getTemplate,
  resolveLanguage
} from '../src/templates.mjs';

test('each starter layout has three categories and seven channels', () => {
  assert.deepEqual(TEMPLATE_IDS, ['community', 'gaming', 'study']);
  for (const id of TEMPLATE_IDS) {
    const template = getTemplate(id);
    assert.equal(template.categories.length, 3);
    assert.equal(
      template.categories.reduce((count, category) => count + category.channels.length, 0),
      7
    );
  }
});

test('layouts include localized names and a readable preview', () => {
  assert.equal(getLocalizedTemplate('community', 'tr').label, 'Topluluk');
  assert.match(formatTemplateTree('study', 'en'), /Study Space/);
  assert.match(formatTemplateTree('study', 'en'), /🔊 Study Hall/);
  assert.match(formatTemplateTree('study', 'tr'), /Ders Çalışma/);
});

test('unknown layouts return no template and language defaults to English', () => {
  assert.equal(getTemplate('not-a-template'), null);
  assert.equal(getLocalizedTemplate('not-a-template', 'en'), null);
  assert.equal(resolveLanguage('fr'), 'en');
  assert.equal(resolveLanguage('tr'), 'tr');
});
