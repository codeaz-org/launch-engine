#!/usr/bin/env bash
# PreToolUse(Bash) guard: codeaz work must only ever act as the antonzaharia GitHub account.
# Blocks gh commands and git pushes when the active gh account is anything else, and any
# command that names another known personal account.
cmd=$(jq -r '.tool_input.command // ""')

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

if grep -qiE 'gesimuse' <<<"$cmd"; then
  deny "Blocked: codeaz work must never use or reference another GitHub account. Use antonzaharia only."
fi

if grep -qE '(^|[;&|( ]|GH_TOKEN=[^ ]* )gh ' <<<"$cmd" || grep -qE 'git( -C [^ ]+)? push' <<<"$cmd"; then
  active=$(gh auth status --active -h github.com 2>/dev/null | sed -nE 's/.*account ([^ ]+).*/\1/p' | head -1)
  if [ "$active" != "antonzaharia" ]; then
    deny "Blocked: active gh account is '${active:-none}', not antonzaharia. Run: gh auth switch -h github.com -u antonzaharia"
  fi
fi
exit 0
