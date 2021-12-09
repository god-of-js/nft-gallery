import MarkdownIt from 'markdown-it';
import commonData from './langDir/all_lang.json';

const md = MarkdownIt({
  breaks: false
});

const vuei18nConfig = {
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  modifiers: {
    md: str => md.renderInline(str),
    common: str => str.split('.').reduce((o, i) => o[i], commonData as any)
  },
}

export default vuei18nConfig
