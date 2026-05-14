---
name: Tmux Popup Workflows
description: A focused popup-binding layer for tmux — single-letter mnemonics for git, scratch shell, project jump, file search, GitHub
type: config
merge: section
destination: ~/.config/tmux/popups.conf
---

# ─────────────────────────────────────────────────────────────
# Git — prefix + g for lazygit, prefix + G for gh dash
# ─────────────────────────────────────────────────────────────

bind g display-popup -E -w 90% -h 90% -d "#{pane_current_path}" "lazygit"

bind G display-popup -E -w 90% -h 80% -d "#{pane_current_path}" "gh dash"

bind I display-popup -E -w 80% -h 70% -d "#{pane_current_path}" \
  "gh issue list --limit 30 | fzf --reverse --prompt='issue> ' | awk '{print \$1}' | xargs gh issue view --web"

# ─────────────────────────────────────────────────────────────
# Shells and ad-hoc commands
# ─────────────────────────────────────────────────────────────

# Scratch shell — prefix + P, ephemeral, scoped to current path
bind P display-popup -E -w 80% -h 75% -d "#{pane_current_path}"

# Quick command runner — prefix + !, prompts then pauses on read so you can inspect output
bind ! command-prompt -p "popup:" "display-popup -E -w 80% -h 60% -d '#{pane_current_path}' '%1; read -p \"\\n[enter to close]\"'"

# ─────────────────────────────────────────────────────────────
# Session/project jumping
# ─────────────────────────────────────────────────────────────

# Switch to an existing session — prefix + J
bind J display-popup -E -w 60% -h 50% \
  "tmux list-sessions -F '#S' \
   | fzf --reverse --prompt='session> ' \
   | xargs -I {} tmux switch-client -t {}"

# New session at a zoxide-known directory — prefix + N
bind N display-popup -E -w 60% -h 50% \
  "zoxide query -l \
   | fzf --reverse --prompt='new session> ' \
   | xargs -I {} bash -c 'tmux new-session -ds \"\$(basename {})\" -c {} && tmux switch-client -t \"\$(basename {})\"'"

# ─────────────────────────────────────────────────────────────
# Search — ripgrep + fzf + bat
# ─────────────────────────────────────────────────────────────

bind / display-popup -E -w 80% -h 70% -d "#{pane_current_path}" \
  "rg --line-number --no-heading --color=always . \
   | fzf --ansi --reverse --delimiter=: \
         --preview 'bat --color=always --highlight-line {2} {1}' \
         --preview-window='right,60%,+{2}-/2'"

# ─────────────────────────────────────────────────────────────
# Notes — prefix + n opens a scratch notes file in $EDITOR
# ─────────────────────────────────────────────────────────────

bind n display-popup -E -w 70% -h 70% -d "#{pane_current_path}" \
  "\${EDITOR:-nvim} ~/notes/scratch.md"

# ─────────────────────────────────────────────────────────────
# Help — prefix + ? shows this binding map
# ─────────────────────────────────────────────────────────────

bind ? display-popup -E -w 50% -h 60% \
  "echo 'tmux popup bindings:'; echo; \
   echo '  prefix + g    lazygit'; \
   echo '  prefix + G    gh dash'; \
   echo '  prefix + I    GitHub issues (fzf)'; \
   echo '  prefix + P    scratch shell'; \
   echo '  prefix + !    one-shot command runner'; \
   echo '  prefix + J    switch to existing session'; \
   echo '  prefix + N    new session (zoxide + fzf)'; \
   echo '  prefix + /    ripgrep + fzf + bat preview'; \
   echo '  prefix + n    open ~/notes/scratch.md'; \
   echo '  prefix + ?    this help'; \
   echo; read -p '[enter to close]'"
