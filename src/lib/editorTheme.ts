import { createTheme } from '@uiw/codemirror-themes'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

/** Code theme drawn from the app palette: ink surface, lime caret, violet selection. */
export const vaultTheme = [
  createTheme({
    theme: 'dark',
    settings: {
      background: 'transparent',
      foreground: '#d9d7d1',
      caret: '#c6ff3d',
      selection: 'rgba(107, 77, 255, 0.35)',
      selectionMatch: 'rgba(107, 77, 255, 0.18)',
      lineHighlight: 'rgba(255, 255, 255, 0.035)',
      gutterBackground: 'transparent',
      gutterForeground: 'rgba(255, 255, 255, 0.22)',
      gutterActiveForeground: 'rgba(255, 255, 255, 0.6)',
      gutterBorder: 'transparent',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    },
    styles: [
      { tag: [t.comment, t.lineComment, t.blockComment], color: '#6b6963', fontStyle: 'italic' },
      { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.modifier, t.operatorKeyword], color: '#a996ff' },
      { tag: [t.string, t.special(t.string), t.regexp], color: '#cff27a' },
      { tag: [t.number, t.bool, t.null, t.atom, t.unit], color: '#ffae85' },
      { tag: [t.tagName, t.angleBracket], color: '#ff8f66' },
      { tag: t.attributeName, color: '#8cc8ff' },
      { tag: t.attributeValue, color: '#cff27a' },
      { tag: [t.propertyName, t.definition(t.propertyName)], color: '#8cc8ff' },
      { tag: [t.className, t.labelName, t.constant(t.name)], color: '#ffd479' },
      { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#e9e7e2' },
      { tag: [t.variableName, t.name], color: '#d9d7d1' },
      { tag: [t.operator, t.punctuation, t.separator, t.bracket], color: '#8a8780' },
      { tag: t.color, color: '#ffae85' },
    ],
  }),
  EditorView.theme({
    '&': { fontSize: '12px' },
    '.cm-scroller': { lineHeight: '1.65', fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
    '.cm-content': { padding: '10px 0 24px' },
    '.cm-gutters': { paddingLeft: '6px', borderRight: '1px solid rgba(255,255,255,0.06)', marginRight: '6px' },
    '.cm-activeLine': { boxShadow: 'inset 2px 0 0 #c6ff3d' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 4px', minWidth: '24px', fontSize: '11px' },
    '.cm-line': { padding: '0 12px 0 2px' },
    '.cm-cursor': { borderLeftWidth: '2px' },
    '.cm-placeholder': { color: 'rgba(255,255,255,0.28)', fontStyle: 'normal' },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: 'rgba(198,255,61,0.14)', outline: 'none' },
    '.cm-tooltip': { backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'rgba(107,77,255,0.45)' },
  }),
]
