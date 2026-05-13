---
name: MacBook Dev Setup Script
description: Phased, copy-paste-ready setup script for provisioning an Apple Silicon MacBook for AI-assisted fullstack TypeScript development. Each phase is independently runnable.
type: skill
merge: replace
destination: .claude/skills/macbook-dev-setup.md
---

# MacBook Dev Setup

Phased script. Run each phase top to bottom on a fresh MacBook. Phases are independently re-runnable — skip any you've already done.

## Phase 0: Pre-flight

```bash
# Confirm native ARM. Should print: arm64
arch
# If i386: quit terminal, uncheck "Open using Rosetta" in Get Info, relaunch.

# Install Rosetta 2 for the rare Intel-only app that needs it
softwareupdate --install-rosetta --agree-to-license || true
```

## Phase 1: Xcode CLI tools + Homebrew

```bash
xcode-select --install || true
# Wait for the GUI installer to complete before continuing.

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

brew doctor
```

## Phase 2: Shell — Oh My Zsh + Powerlevel10k

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
brew install powerlevel10k
```

Append to `~/.zshrc` (or copy your existing one over `.oh-my-zsh`'s default):

```bash
# === Top of ~/.zshrc ===
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

ZSH_THEME=""
plugins=(git)
source $ZSH/oh-my-zsh.sh

# === Bottom of ~/.zshrc ===
source $(brew --prefix)/share/powerlevel10k/powerlevel10k.zsh-theme
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
```

Copy `~/.p10k.zsh` from the old machine rather than re-running `p10k configure`.

## Phase 3: Runtimes — asdf

```bash
brew install asdf
echo '. $(brew --prefix)/opt/asdf/libexec/asdf.sh' >> ~/.zshrc
source ~/.zshrc

asdf plugin add nodejs
asdf plugin add pnpm
asdf plugin add python

# Adjust versions to whatever your projects pin
asdf install nodejs 24.13.0
asdf set --home nodejs 24.13.0

asdf install pnpm 10.28.2
asdf set --home pnpm 10.28.2

asdf install python 3.12.12
asdf set --home python 3.12.12
```

## Phase 4: Tooling — CLI

```bash
brew install \
  bat btop eza fzf gh git jq lazygit lychee tmux zoxide

# fzf shell integration (key bindings + completion)
$(brew --prefix)/opt/fzf/install --key-bindings --completion --no-update-rc
```

## Phase 5: Tooling — GUI apps

```bash
brew install --cask \
  font-jetbrains-mono-nerd-font \
  ghostty \
  raycast \
  rectangle \
  obsidian \
  cursor \
  visual-studio-code \
  claude \
  docker
```

## Phase 6: Global node/pnpm packages

```bash
npm install -g @anthropic-ai/claude-code
pnpm add -g vercel turbo expo-cli
```

## Phase 7: SSH + Git

If transferring an existing key (recommended):

```bash
# After copying ~/.ssh/ from old machine via AirDrop or rsync:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub ~/.ssh/config

ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

`~/.ssh/config`:

```ssh-config
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

If generating a new key:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
gh auth login
gh ssh-key add ~/.ssh/id_ed25519.pub --title "MacBook"
```

Git global config:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global rerere.enabled true
```

## Phase 8: Verify

```bash
arch                  # arm64
brew --prefix         # /opt/homebrew
node --version
pnpm --version
python3 --version
gh --version
vercel --version
claude --version
ssh -T git@github.com # should greet you by username
```

## Phase 9: First project

```bash
mkdir -p ~/Sites
cd ~/Sites
git clone git@github.com:<org>/<repo>.git
cd <repo>
pnpm install
pnpm typecheck
pnpm test
```

## Carry over from old machine

These are personal and worth transferring rather than reconfiguring:

- `~/.ssh/` — keys, config
- `~/.p10k.zsh` — prompt configuration (months of customisation)
- `~/.claude/` — Claude Code settings, agents, hooks, custom commands, project CLAUDE.md files
- `~/Monodex/` — Obsidian vault (or whatever holds your long-form notes)
- `~/Library/Fonts/` — any custom fonts not installable via brew cask
- Raycast settings — Raycast → Preferences → Advanced → Export, then import on new machine
- Rectangle preferences — if customised beyond defaults
- `~/.config/ghostty/` — terminal config
- `~/.config/tmux/` — see the `terminal-webdev-tuning` and `tmux-power-workflows` skills

## What to skip on a fresh install

Resist the urge to install everything from the old machine. Each of these is worth adding only when a specific project demands it:

- JetBrains tooling (only if a project mandates it)
- Adobe Creative Cloud (only if producing assets this week)
- VPN clients (only when needed for a specific network)
- Hardware-specific utilities — Elgato, DisplayLink, Hue Sync — only if you're using that hardware
- Multiple browsers beyond your primary
