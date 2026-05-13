---
name: Zed Editor settings.json
description: Opinionated Zed settings — Vim mode + Assistant panel + format-on-save chain
type: config
merge: replace
destination: ~/.config/zed/settings.json
---

{
"telemetry": {
"diagnostics": false,
"metrics": false
},
"buffer_font_family": "JetBrains Mono",
"buffer_font_size": 14,
"buffer_font_features": {
"calt": false
},
"ui_font_size": 15,
"theme": {
"mode": "system",
"light": "One Light",
"dark": "One Dark"
},
"vim_mode": true,
"cursor_blink": false,
"relative_line_numbers": true,
"soft_wrap": "editor_width",
"preferred_line_length": 100,
"show_wrap_guides": true,
"wrap_guides": [80, 100],
"tab_size": 2,
"hard_tabs": false,
"format_on_save": "on",
"formatter": "language_server",
"remove_trailing_whitespace_on_save": true,
"ensure_final_newline_on_save": true,
"autosave": "off",
"use_autoclose": true,
"scrollbar": {
"show": "auto",
"git_diff": true,
"diagnostics": true
},
"indent_guides": {
"enabled": true,
"coloring": "indent_aware"
},
"inlay_hints": {
"enabled": true,
"show_parameter_hints": false,
"show_type_hints": true
},
"git": {
"git_gutter": "tracked_files",
"inline_blame": {
"enabled": true,
"delay_ms": 600
}
},
"assistant": {
"version": "2",
"enabled": true,
"default_model": {
"provider": "anthropic",
"model": "claude-sonnet-4-5"
},
"button": true,
"dock": "right",
"default_width": 480
},
"terminal": {
"shell": {
"program": "/opt/homebrew/bin/zsh"
},
"font_family": "JetBrains Mono",
"font_size": 13,
"blinking": "off",
"copy_on_select": true
},
"project_panel": {
"dock": "left",
"default_width": 220,
"git_status": true
},
"languages": {
"TypeScript": {
"formatter": {
"external": {
"command": "prettier",
"arguments": ["--stdin-filepath", "{buffer_path}"]
}
},
"code_actions_on_format": {
"source.organizeImports": true
},
"tab_size": 2
},
"TSX": {
"formatter": {
"external": {
"command": "prettier",
"arguments": ["--stdin-filepath", "{buffer_path}"]
}
}
},
"Rust": {
"tab_size": 4
},
"Python": {
"format_on_save": "on",
"tab_size": 4
}
},
"file_types": {
"JSONC": ["**/.vscode/*.json", "**/tsconfig*.json", "**/turbo.json"]
}
}
