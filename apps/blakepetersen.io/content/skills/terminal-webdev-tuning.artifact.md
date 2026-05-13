---
name: Terminal Web-Dev Tuning
description: Additive tmux.conf block and full Ghostty config for refining a baseline terminal setup against day-to-day Next.js / fullstack web-dev work.
type: skill
merge: replace
destination: .claude/skills/terminal-webdev-tuning.md
---

# Terminal Web-Dev Tuning

Two files. The tmux block is additive — paste it at the end of an existing `~/.config/tmux/tmux.conf` from the baseline `tmux-power-workflows` skill, then `prefix + r` to reload and `prefix + I` to install the new plugin. The Ghostty config replaces `~/.config/ghostty/config`; relaunch Ghostty for it to take effect.

## `~/.config/tmux/tmux.conf` (additions)

```tmux
# ─────────────────────────────────────────────────────────────
# Web-dev tuning additions (apply on top of the baseline config)
# ─────────────────────────────────────────────────────────────

# URL picker — fzf over every URL visible in the current pane
set -g @plugin 'wfxr/tmux-fzf-url'
set -g @fzf-url-bind 'u'
set -g @fzf-url-history-limit '2000'

# Dump pane scrollback to a timestamped log under /tmp
bind Enter run-shell '\
  f=/tmp/tmux-#S-#I.#P-$(date +%H%M%S).log; \
  tmux capture-pane -p -S - > "$f"; \
  tmux display "Saved $f"'

# Copy the last 200 lines to the macOS clipboard
bind Y run-shell '\
  tmux capture-pane -p -S -200 | pbcopy; \
  tmux display "Copied 200 lines to clipboard"'

# Pane border shows the running command AND the git branch (polled on
# status-interval — 5s in the baseline). Empty outside a git repo.
set -g pane-border-status top
set -g pane-border-format ' #{?pane_active,#[fg=#cba6f7#,bold],#[fg=#6c7086]}#{pane_index}: #{pane_current_command} #(cd #{pane_current_path} && git symbolic-ref --short HEAD 2>/dev/null | sed "s/^/⎇ /") '

# Resurrect: capture the web-dev processes the baseline misses. The ~...~
# syntax matches the full command line, not just the binary name.
set -g @resurrect-processes \
  'ssh psql mysql sqlite3 "~docker compose~" "~pnpm dev~" "~pnpm storybook~" "~next dev~" "~vite~" "~prisma studio~" "~bun dev~" "~npm run dev~"'

# Continuum: auto-restore on tmux start + auto-launch tmux on system boot
set -g @continuum-restore 'on'
set -g @continuum-boot 'on'
```

To install the new `tmux-fzf-url` plugin after pasting:

```bash
tmux source-file ~/.config/tmux/tmux.conf
# Inside tmux: prefix + I (capital i) — TPM clones the new plugin
```

## `~/.config/ghostty/config`

```hcl
# Theme — Catppuccin Mocha to match tmux status bar
theme = catppuccin-mocha

# Font
font-family = "JetBrainsMono Nerd Font"
font-size = 14
adjust-cell-height = 10%

# Cursor
cursor-style = block
cursor-style-blink = false

# Window
window-padding-x = 8
window-padding-y = 6
window-decoration = true
macos-titlebar-style = transparent

# Mouse / scrollback
mouse-scroll-multiplier = 2
mouse-shift-capture = always

# Behaviour
copy-on-select = true
confirm-close-surface = true
resize-overlay = never

# Keybindings — fix cmd+minus shadowing font-decrease, move split
keybind = cmd+minus=unbind
keybind = cmd+shift+minus=new_split:down
keybind = cmd+shift+enter=toggle_split_zoom

# Default shell — adjust to wherever zsh actually is on your machine
command = "/bin/zsh"

# Auto-attach tmux on launch (optional — comment if you want a bare shell)
# command = "tmux new-session -A -s main"
```

## After applying

```bash
# tmux additions are live after the reload + plugin install
tmux source-file ~/.config/tmux/tmux.conf

# Ghostty changes require quit + relaunch — Ghostty does not hot-reload its config
osascript -e 'tell application "Ghostty" to quit'
open -a Ghostty
```

## Companion install for `tmux-fzf-url`

The plugin relies on `fzf` (already installed if you followed the macbook-dev-setup skill). To verify:

```bash
which fzf       # /opt/homebrew/bin/fzf
which pbcopy    # /usr/bin/pbcopy — macOS native, no install needed
```

## Optional: launchd plist for `@continuum-boot`

`@continuum-boot 'on'` installs the plist itself the first time tmux starts under it. To disable later:

```bash
launchctl unload ~/Library/LaunchAgents/*continuum*.plist
rm ~/Library/LaunchAgents/*continuum*.plist
```

## Verification checklist

- [ ] `tmux source-file ~/.config/tmux/tmux.conf` succeeds without errors
- [ ] `prefix + I` reports `tmux-fzf-url` installed
- [ ] `prefix + u` opens fzf when a pane has visible URLs
- [ ] `prefix + Y` copies — paste into any text field to confirm
- [ ] `prefix + Enter` writes to `/tmp/tmux-…log`; verify with `ls /tmp/tmux-*`
- [ ] Pane border shows ` ⎇ <branch>` inside any git repo
- [ ] Quit-and-relaunch Ghostty
- [ ] `cmd+minus` shrinks font; `cmd+shift+minus` splits down
- [ ] No overlay popup on pane resize
- [ ] Shift+drag inside tmux selects via OS, not tmux copy-mode
