---
name: tmux Power-User Workflow Cheatsheet
description: Single-page workflow reference for a popup-driven tmux setup — the eight bindings that carry 90% of day-to-day terminal work, plus session lifecycle and copy-mode commands.
type: skill
merge: replace
destination: .claude/skills/tmux-power-workflows.md
---

# tmux Power-User Workflows

A workflow cheatsheet, not a config file. The bindings below assume the `tmux-power-workflows` baseline config (backtick prefix, popup-driven lazygit, extrakto, smart session manager). For the dotfile that produces them, see the `configs/tmux-poweruser` entry.

## Mental model

**One session per project**, named after the project. Sessions survive disconnect, reboot, and Continuum's auto-save loop. The unit of context is the session; the rest is layout inside it.

```bash
tmux new -s <project>        # create
tmux a -t <project>          # reattach by name
tmux a                       # reattach to most recent
tmux ls                      # list all running
tmux kill-session -t <name>  # destroy when actually done
```

## The 8 bindings that matter

Prefix = `` ` `` (backtick).

| Keys                      | Action                                  | When you reach for it                       |
| ------------------------- | --------------------------------------- | ------------------------------------------- |
| `` ` g ``                 | Lazygit popup (full-screen)             | Any git op more involved than `git push`    |
| `` ` Shift+T ``           | Smart session picker (zoxide+fzf)       | Jumping between projects                    |
| `` ` Shift+P ``           | Scratch terminal popup                  | One-off command without losing the layout   |
| `` ` Tab ``               | Extrakto — fzf over every token in pane | Grab a URL, hash, file path from scrollback |
| `` ` z ``                 | Zoom pane to fullscreen / back          | Stack trace, log review                     |
| `` ` [ `` then `?<query>` | Copy-mode search                        | Find-and-yank inside scrollback             |
| `` ` d ``                 | Detach session                          | Closing the laptop                          |
| `tmux a` (from shell)     | Reattach                                | Opening the laptop                          |

That's the daily surface. Everything else below supports these.

## Windows and panes

| Keys                  | Action                                  |
| --------------------- | --------------------------------------- | ----------------------------- |
| `` ` c ``             | New window (inherits cwd)               |
| `` ` n `` / `` ` p `` | Next / previous window                  |
| `` ` 1..9 ``          | Jump to window N                        |
| `` ` , ``             | Rename current window                   |
| `` `                  | ``                                      | Vertical split (inherits cwd) |
| `` ` - ``             | Horizontal split (inherits cwd)         |
| `` ` x ``             | Kill current pane                       |
| `` ` Shift+X ``       | Kill entire session (with confirmation) |
| `` ` h/j/k/l ``       | Move between panes                      |
| `` ` H/J/K/L ``       | Resize panes (repeatable after prefix)  |
| `Alt + arrow`         | Live resize (no prefix)                 |

## Copy-mode

| Keys                 | Action                            |
| -------------------- | --------------------------------- |
| `` ` [ ``            | Enter copy-mode                   |
| `q`                  | Exit copy-mode                    |
| `/<text>`            | Search forward                    |
| `?<text>`            | Search backward                   |
| `n` / `N`            | Next / previous match             |
| `v`                  | Begin visual selection            |
| `y`                  | Yank selection to macOS clipboard |
| `Space` then `Enter` | Default selection mode            |
| `G` / `g`            | Bottom / top of buffer            |
| `0` / `$`            | Beginning / end of line           |

## Popups (the secret weapon)

```tmux
# In tmux.conf:
bind g display-popup -E -w 90% -h 90% -d "#{pane_current_path}" "lazygit"
bind P display-popup -E -w 80% -h 75% -d "#{pane_current_path}"
```

Popups are floating overlays — they open centered, do not reshuffle underlying panes, and disappear when the inner process exits. Use them for ephemeral work (git operations, scratch commands, fzf-driven pickers); never for anything you'd want to leave running in the background.

## Session lifecycle in detail

```bash
# Create with an explicit cwd and first window name
tmux new -s blakepetersen-io -c ~/Sites/blakepetersen-io -n shell

# Detach (session keeps running): inside tmux, prefix + d

# Reattach to most recent session:
tmux a

# Reattach to a named session:
tmux a -t blakepetersen-io

# Reattach to most recent OR create if none exist:
tmux new -A -s main

# Switch session from inside tmux without detaching:
# prefix + s (built-in session list)
# prefix + Shift+T (smart picker — preferred)

# Rename current session:
# prefix + $
```

## Continuum + Resurrect

Auto-save runs every 15 minutes; auto-restore on tmux start. To force a save or restore manually:

```text
prefix + Ctrl+s     # save now
prefix + Ctrl+r     # restore last save
```

Resurrect captures pane contents (`@resurrect-capture-pane-contents 'on'`) so restored panes don't open blank. To restore running processes (dev servers, etc.), see the `terminal-webdev-tuning` skill — it expands `@resurrect-processes` to cover `pnpm dev`, `next dev`, etc.

## Synchronize panes

```text
prefix + e          # toggle sync — keystrokes broadcast to every pane
```

For deploying the same command across multiple hosts or running parallel SSH connections. The status bar shows a red `SYNC` badge while it's on. Always remember to turn it off (`prefix + e` again) before the next normal command.

## Reload config without restart

```text
prefix + r          # source-file ~/.config/tmux/tmux.conf — bound in the config
```

For changes to bindings, status format, etc. For changes to TPM plugins, `prefix + Shift+I` runs the installer; `prefix + Shift+U` updates; `prefix + Alt+u` cleans removed plugins.

## Daily flow, end to end

1. `tmux a` from the shell — attach to whatever's running.
2. `` ` Shift+T `` — pick the project. Either attach (if a session exists) or create it.
3. Open editor in one pane, dev server in a split. `` ` | `` for vertical, `` ` - `` for horizontal.
4. Need git? `` ` g `` — lazygit popup. Stage, commit, push, quit.
5. Need to read a long log? `` ` z `` to zoom the dev-server pane fullscreen, scroll with copy-mode (`` ` [ ``), `q` to exit copy-mode, `` ` z `` again to unzoom.
6. Need a URL from the log? `` ` Tab `` — extrakto picker, filter to `https`, hit Enter to copy.
7. Done for the day? `` ` d `` to detach. Close the laptop.
8. Next morning: `tmux a` — everything is where you left it.

## Troubleshooting

```bash
# Bindings not working after reload?
tmux source-file ~/.config/tmux/tmux.conf
# (or prefix + r if the binding is in the config)

# Popups failing to open?
tmux -V                # need 3.2+ for display-popup
which lazygit          # lazygit binding requires lazygit on PATH

# Extrakto picker fails silently?
python3 --version      # extrakto needs python3 in the shell's PATH

# Session picker does nothing?
which zoxide fzf       # both required

# Colors look washed out?
tmux info | grep -i rgb   # should show Tc: (flag) true
# If not, add your terminal to the terminal-overrides line in tmux.conf
```
