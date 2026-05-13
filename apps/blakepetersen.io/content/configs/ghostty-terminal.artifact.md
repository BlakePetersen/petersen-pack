---
name: Ghostty Terminal Config
description: Ghostty config — Catppuccin Mocha theme, JetBrains Mono, tmux-friendly keybindings, true-color forwarding
type: config
merge: replace
destination: ~/.config/ghostty/config
---

# ABOUTME: Ghostty config for a tmux + Vim + dark-mode macOS workflow.

# ABOUTME: Reload with: ghostty --reload-config

# ─────────────────────────────────────────────

# Font

# ─────────────────────────────────────────────

font-family = "JetBrains Mono"
font-size = 14
font-thicken = true
adjust-cell-height = 10%

# ─────────────────────────────────────────────

# Theme + window chrome

# ─────────────────────────────────────────────

theme = "catppuccin-mocha"
background-opacity = 1.0
window-padding-x = 12
window-padding-y = 10
window-padding-balance = true
window-padding-color = "background"
window-decoration = true
macos-titlebar-style = "tabs"
macos-option-as-alt = true

# ─────────────────────────────────────────────

# Cursor

# ─────────────────────────────────────────────

cursor-style = "bar"
cursor-style-blink = false
cursor-color = "#cba6f7"

# ─────────────────────────────────────────────

# TERM — advertise xterm-256color so tmux + every tool just works

# ─────────────────────────────────────────────

term = "xterm-256color"

# ─────────────────────────────────────────────

# Shell integration

# ─────────────────────────────────────────────

shell-integration = "detect"
shell-integration-features = "cursor,sudo,title"

# ─────────────────────────────────────────────

# Scrollback + clipboard

# ─────────────────────────────────────────────

scrollback-limit = 100000
copy-on-select = "clipboard"
mouse-hide-while-typing = true
mouse-shift-capture = false
clipboard-read = "allow"
clipboard-write = "allow"
clipboard-paste-protection = true
clipboard-paste-bracketed-safe = true

# ─────────────────────────────────────────────

# Keybindings — disable tab/split shortcuts so tmux owns multiplexing

# ─────────────────────────────────────────────

keybind = cmd+t=unbind
keybind = cmd+shift+t=unbind
keybind = cmd+d=unbind
keybind = cmd+shift+d=unbind
keybind = cmd+left=unbind
keybind = cmd+right=unbind
keybind = clear_default=ctrl+tab
keybind = clear_default=ctrl+shift+tab

# Keep the basics that don't fight tmux

keybind = cmd+c=copy_to_clipboard
keybind = cmd+v=paste_from_clipboard
keybind = cmd+k=clear_screen
keybind = cmd+plus=increase_font_size:1
keybind = cmd+minus=decrease_font_size:1
keybind = cmd+zero=reset_font_size

# ─────────────────────────────────────────────

# Misc

# ─────────────────────────────────────────────

confirm-close-surface = false
quit-after-last-window-closed = true
window-save-state = "always"
