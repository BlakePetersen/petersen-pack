---
name: Obsidian Vault — Monodex Pattern
description: Obsidian core + community plugin config, daily-note template, reading-column CSS — single-vault Monodex setup
type: config
merge: replace
destination: ~/Obsidian/Monodex/.obsidian/app.json
---

{
"useMarkdownLinks": true,
"newLinkFormat": "shortest",
"attachmentFolderPath": "Attachments",
"alwaysUpdateLinks": true,
"showLineNumber": true,
"showInlineTitle": true,
"useTab": false,
"tabSize": 2,
"showFrontmatter": true,
"trashOption": "local",
"spellcheck": true,
"promptDelete": false,
"readableLineLength": true,
"strictLineBreaks": false,
"autoConvertHtml": true,
"fileSortOrder": "alphabetical",
"showUnsupportedFiles": false,
"userIgnoreFilters": [
"node_modules/",
"dist/",
".next/"
]
}

---

**File:** `.obsidian/core-plugins.json` — enable the bundled plugins that earn their spot for a Monodex workflow.

```json
{
  "file-explorer": true,
  "global-search": true,
  "switcher": true,
  "graph": true,
  "backlink": true,
  "outgoing-link": true,
  "tag-pane": true,
  "page-preview": true,
  "daily-notes": true,
  "templates": true,
  "note-composer": true,
  "command-palette": true,
  "editor-status": true,
  "bookmarks": true,
  "outline": true,
  "word-count": true,
  "properties": true,
  "file-recovery": true,
  "sync": false,
  "publish": false
}
```

**File:** `.obsidian/community-plugins.json` — the small curated set that does heavy lifting.

```json
["templater-obsidian", "dataview", "obsidian-git"]
```

**File:** `.obsidian/daily-notes.json` — date-stamped daily notes wired to the Templater template.

```json
{
  "folder": "Daily",
  "format": "YYYY-MM-DD",
  "template": "Templates/Daily",
  "autorun": true
}
```

**File:** `Templates/Daily.md` — Templater-powered daily-note skeleton.

```markdown
---
date: <% tp.date.now("YYYY-MM-DD") %>
tags: [daily]
---

# <% tp.date.now("dddd, MMMM Do YYYY") %>

## In flight

-

## Decisions

-

## Notes

-

## Tomorrow

-
```

**File:** `.obsidian/snippets/no-fluff.css` — reading column at 760px and a monospace prose font.

```css
.markdown-source-view.mod-cm6 .cm-line {
  max-width: 760px;
}
.cm-content {
  font-family: 'JetBrains Mono', 'iA Writer Mono', monospace;
}
.markdown-preview-view {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.HyperMD-codeblock {
  font-size: 0.9em;
}
```

**File:** `.obsidian/appearance.json` — enable the snippet plus dark mode.

```json
{
  "baseFontSize": 16,
  "theme": "obsidian",
  "enabledCssSnippets": ["no-fluff"]
}
```

**File:** `.gitignore` (vault root) — keep per-machine UI state and trash out of git.

```gitignore
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/plugins/*/data.json
.trash/
```
