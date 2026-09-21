#!/usr/bin/env bash
# Recorded TUI demo. asciinema records this script; inside, `script -qfc`
# gives the TUI a pty, and a background feeder writes keystrokes to the pty's
# stdin (this script's stdout IS asciinema's recorded stdin pipe — but the
# pty child has its own stdin, so we feed via a FIFO owned by the feeder).
set -u
export HACKMAXX_API_URL="https://c9y3l3wuma.execute-api.ap-south-1.amazonaws.com/dev"
export TERM=xterm-256color
cd /home/ash/src/hack-max

FIFO=$(mktemp -u)
mkfifo "$FIFO"

# The pty: script connects the TUI to a real terminal, stdin from FIFO.
script -qfc "bun cli/src/index.ts" /dev/null < "$FIFO" &
TUI_PID=$!

exec 3>"$FIFO"

sleep 4
printf 'j' >&3; sleep 0.8
printf 'j' >&3; sleep 0.8
printf 'm' >&3; sleep 10
printf 'd' >&3; sleep 1.5
printf 'p' >&3; sleep 1.5
printf 'j' >&3; sleep 0.5
printf 'j' >&3; sleep 0.5
printf 's' >&3; sleep 2.5
printf '\x1b' >&3; sleep 0.6
printf 'q' >&3; sleep 0.5

exec 3>&-
wait $TUI_PID 2>/dev/null || true
rm -f "$FIFO"
