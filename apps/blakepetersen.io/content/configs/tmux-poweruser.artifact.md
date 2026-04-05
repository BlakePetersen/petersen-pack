---
name: Tmux Power-User Config
description: Full tmux config with Catppuccin Mocha theme, TPM plugins, popup-driven lazygit/scratch/session workflows, and zoxide-powered session switching
type: config
merge: replace
destination: ~/.config/tmux/tmux.conf
---

# ABOUTME: Power-user tmux config — XDG location, Catppuccin Mocha theme, TPM plugins

# ABOUTME: Prefix is backtick. Splits: | and -. Reload: prefix r.

# ─────────────────────────────────────────────────────────────

# Core

# ─────────────────────────────────────────────────────────────

set -g prefix '`'
unbind C-b
bind-key '`' send-prefix # double-tap ` to type a literal backtick

set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB,alacritty:RGB,ghostty:RGB"

set -g mouse on
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 50000
set -sg escape-time 10
set -g focus-events on
setw -g mode-keys vi

# Let programs inside tmux (vim, bat, etc.) set the system clipboard via OSC 52

set -g set-clipboard on

# Let image protocols (kitty graphics, sixel) and OSC escapes pass through tmux

set -g allow-passthrough on

# Longer display times for messages and pane-number overlay

set -g display-time 3000
set -g display-panes-time 2000

# Subtle activity indicator on inactive windows (no bell/flash)

setw -g monitor-activity on
set -g visual-activity off

# ─────────────────────────────────────────────────────────────

# Bindings

# ─────────────────────────────────────────────────────────────

# Splits open in current pane's directory

unbind '"'
unbind %
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# New window in current path

bind c new-window -c "#{pane_current_path}"

# Reload config

bind r source-file ~/.config/tmux/tmux.conf \; display "Config reloaded"

# Vim-style pane navigation (repeatable: tap prefix once, then hjkl repeatedly)

bind -r h select-pane -L
bind -r j select-pane -D
bind -r k select-pane -U
bind -r l select-pane -R

# Resize panes — Alt+arrow (no prefix, instant) OR prefix + HJKL (repeatable)

bind -n M-Left resize-pane -L 5
bind -n M-Right resize-pane -R 5
bind -n M-Up resize-pane -U 3
bind -n M-Down resize-pane -D 3
bind -r H resize-pane -L 5
bind -r J resize-pane -D 3
bind -r K resize-pane -U 3
bind -r L resize-pane -R 5

# Lazygit popup — prefix + g opens lazygit full-screen float

bind g display-popup -E -w 90% -h 90% -d "#{pane_current_path}" "lazygit"

# Scratch terminal popup — prefix + P opens a floating scratchpad shell

bind P display-popup -E -w 80% -h 75% -d "#{pane_current_path}"

# Toggle synchronize-panes (type in all panes at once)

bind e setw synchronize-panes \; display "Sync panes: #{?pane_synchronized,ON,OFF}"

# Kill session with confirmation (prefix + X; prefix + x still kills single pane)

bind X confirm-before -p "kill session #S? (y/n)" kill-session

# Copy mode: v to start selection, y to yank to macOS clipboard

bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "pbcopy"
bind-key -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel "pbcopy"

# ─────────────────────────────────────────────────────────────

# Status bar — Catppuccin Mocha palette (hand-rolled, no theme plugin)

# ─────────────────────────────────────────────────────────────

set -g status on
set -g status-interval 5
set -g status-position bottom
set -g status-justify left
set -g status-style "bg=#1e1e2e,fg=#cdd6f4"
set -g status-left-length 100
set -g status-right-length 100

# Session name on left (mauve)

set -g status-left "#[bg=#cba6f7,fg=#11111b,bold] #S #[bg=#1e1e2e,fg=#cba6f7] "

# Right: zoom indicator + sync-panes indicator + host + date

set -g status-right "#{?pane_synchronized,#[bg=#f38ba8#,fg=#11111b#,bold] SYNC #[bg=#1e1e2e#,fg=#f38ba8] ,}#{?window_zoomed_flag,#[fg=#f9e2af] ,}#[fg=#89b4fa]#[bg=#89b4fa,fg=#11111b,bold] #h #[bg=#1e1e2e,fg=#fab387] #[bg=#fab387,fg=#11111b,bold] %Y-%m-%d %H:%M "

# Window list

setw -g window-status-format "#[fg=#a6adc8] #I:#W "
setw -g window-status-current-format "#[bg=#45475a,fg=#a6e3a1,bold] #I:#W "

# Pane borders + title showing current running command

set -g pane-border-style "fg=#45475a"
set -g pane-active-border-style "fg=#cba6f7"
set -g pane-border-status top
set -g pane-border-format " #{?pane_active,#[fg=#cba6f7#,bold],#[fg=#6c7086]}#{pane_index}: #{pane_current_command}#{?pane_active,,} "

# Auto-rename windows to basename of current path (more stable than process name)

setw -g automatic-rename on
setw -g automatic-rename-format '#{b:pane_current_path}'

# Messages

set -g message-style "bg=#313244,fg=#cdd6f4"
set -g message-command-style "bg=#313244,fg=#cdd6f4"

# ─────────────────────────────────────────────────────────────

# Plugins (TPM)

# ─────────────────────────────────────────────────────────────

set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @plugin 'tmux-plugins/tmux-yank'
set -g @plugin 'sainnhe/tmux-fzf'
set -g @plugin 'tmux-plugins/tmux-copycat'
set -g @plugin 'laktak/extrakto'
set -g @plugin 'joshmedeski/t-smart-tmux-session-manager'

# Extrakto: prefix + Tab opens fzf picker of tokens in current pane

set -g @extrakto_key 'Tab'
set -g @extrakto_default_opt 'word'

# t-smart-tmux-session-manager: prefix + T — zoxide-powered session picker

set -g @t-bind 'T'
set -g @t-fzf-prompt ' '

# Resurrect: capture pane contents too + restart common dev processes on restore

set -g @resurrect-capture-pane-contents 'on'
set -g @resurrect-dir '~/.config/tmux/resurrect'
set -g @resurrect-processes 'ssh psql mysql sqlite3 "~docker compose~"'

# Continuum: auto-save every 15min, auto-restore on tmux start

set -g @continuum-restore 'on'
set -g @continuum-save-interval '15'

# Initialize TPM — KEEP AT BOTTOM

run '~/.config/tmux/plugins/tpm/tpm'
