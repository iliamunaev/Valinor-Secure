#!/usr/bin/env bash
# dev-aliases.sh - convenience aliases for Makefile targets in Valinor-Secure
# Usage:
#   source ./dev-aliases.sh
#   or add to your shell startup: echo "source /path/to/Valinor-Secure/dev-aliases.sh" >> ~/.bashrc

# If executed instead of sourced, show a message and exit
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This file defines shell aliases. Please source it instead of running it:" >&2
  echo "  source ./dev-aliases.sh" >&2
  exit 0
fi

# Aliases for common Make targets
alias mb='make build'      # build images
alias mr='make run'        # start stack (detached)
alias ms='make stop'       # stop containers
alias mrs='make restart'   # restart stack
alias md='make down'       # stop and remove containers
alias mc='make clean'      # full clean (images, volumes)
alias ml='make logs'       # follow logs
alias mp='make ps'         # show status
alias ma='make all'        # build + run

# Optional: a short helper to ensure aliases are loaded (for interactive shells)
loaded_aliases_msg() {
  echo "Dev aliases loaded: mb mr ms mrs md mc ml mp ma"
}

loaded_aliases_msg
