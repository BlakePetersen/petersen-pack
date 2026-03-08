// ABOUTME: Custom Shiki TextMate theme mapping terminal palette colors to syntax scopes.
// ABOUTME: Used by the Velite rehype pipeline for build-time syntax highlighting.

import type { ThemeRegistration } from 'shiki'

export const terminalTheme: ThemeRegistration = {
  name: 'terminal',
  type: 'dark',
  colors: {
    'editor.background': '#0a0a0a',
    'editor.foreground': '#FAFAFA',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#6B7280', fontStyle: 'italic' },
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#F59E0B' },
    },
    {
      scope: ['keyword', 'keyword.control', 'storage.modifier'],
      settings: { foreground: '#F59E0B' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'storage.type'],
      settings: { foreground: '#06B6D4' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#10B981' },
    },
    {
      scope: ['variable', 'variable.other', 'variable.parameter'],
      settings: { foreground: '#FAFAFA' },
    },
    {
      scope: ['keyword.operator', 'punctuation.separator', 'punctuation.accessor'],
      settings: { foreground: '#9CA3AF' },
    },
    {
      scope: ['constant.numeric', 'constant.language'],
      settings: { foreground: '#06B6D4' },
    },
    {
      scope: ['meta.tag', 'entity.name.tag'],
      settings: { foreground: '#F59E0B' },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: { foreground: '#10B981' },
    },
  ],
}
