import { defineCommand } from 'citty';
import consola from 'consola';

/**
 * Registry of all service resources and their actions.
 * This is the single source of truth — update here when commands change.
 */
const SERVICE_COMMANDS: Record<string, Record<string, string[]>> = {
  radarr: {
    movie: ['list', 'get', 'search', 'add', 'edit', 'refresh', 'manual-search', 'delete'],
    profile: ['list', 'get'],
    tag: ['list'],
    queue: ['list', 'status'],
    rootfolder: ['list'],
    system: ['status', 'health'],
    history: ['list'],
    customformat: ['list'],
  },
  sonarr: {
    series: ['list', 'get', 'search', 'add', 'edit', 'refresh', 'manual-search', 'delete'],
    episode: ['list', 'get'],
    profile: ['list'],
    tag: ['list'],
    rootfolder: ['list'],
    system: ['status', 'health'],
  },
  lidarr: {
    artist: ['list', 'get', 'search', 'add', 'edit', 'refresh', 'manual-search', 'delete'],
    album: ['list', 'get', 'search'],
    profile: ['list'],
    tag: ['list'],
    rootfolder: ['list'],
    system: ['status', 'health'],
  },
  readarr: {
    author: ['list', 'get', 'search', 'add', 'edit', 'refresh', 'manual-search', 'delete'],
    book: ['list', 'get', 'search'],
    profile: ['list'],
    tag: ['list'],
    rootfolder: ['list'],
    system: ['status', 'health'],
  },
  prowlarr: {
    indexer: ['list', 'get', 'delete'],
    search: ['run'],
    app: ['list', 'get'],
    tag: ['list'],
    system: ['status', 'health'],
  },
  bazarr: {
    series: ['list'],
    movie: ['list'],
    episode: ['wanted'],
    provider: ['list'],
    language: ['list', 'profiles'],
    system: ['status', 'health', 'badges'],
  },
  seerr: {
    requests: ['list', 'count', 'approve', 'decline'],
    search: ['query'],
    users: ['list'],
    status: ['show'],
  },
};

function generateBashCompletion(): string {
  const services = Object.keys(SERVICE_COMMANDS).join(' ');
  const globals = 'doctor config completions';

  const resourceVars = Object.entries(SERVICE_COMMANDS)
    .map(([svc, resources]) => `  local ${svc}_resources="${Object.keys(resources).join(' ')}"`)
    .join('\n');

  const resourceCases = Object.keys(SERVICE_COMMANDS)
    .map(svc => `        ${svc})  COMPREPLY=( $(compgen -W "$${svc}_resources" -- "$cur") ) ;;`)
    .join('\n');

  const actionCases = Object.entries(SERVICE_COMMANDS)
    .flatMap(([svc, resources]) =>
      Object.entries(resources).map(
        ([res, actions]) =>
          `        ${res}) [[ "\${COMP_WORDS[1]}" == "${svc}" ]] && COMPREPLY=( $(compgen -W "${actions.join(' ')}" -- "$cur") ) ;;`
      )
    )
    .join('\n');

  return `#!/bin/bash
_tsarr_completions() {
  local cur prev words
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  local services="${services}"
  local globals="${globals}"
${resourceVars}

  case "\${COMP_CWORD}" in
    1)
      COMPREPLY=( $(compgen -W "$services $globals" -- "$cur") )
      ;;
    2)
      case "$prev" in
${resourceCases}
        config)  COMPREPLY=( $(compgen -W "init set get show" -- "$cur") ) ;;
      esac
      ;;
    3)
      case "$prev" in
${actionCases}
      esac
      ;;
  esac
}
complete -F _tsarr_completions tsarr`;
}

function generateZshCompletion(): string {
  const services = Object.keys(SERVICE_COMMANDS).join(' ');

  const resourceAssoc = Object.entries(SERVICE_COMMANDS)
    .map(([svc, resources]) => `    ${svc} "${Object.keys(resources).join(' ')}"`)
    .join('\n');

  const actionAssoc = Object.entries(SERVICE_COMMANDS)
    .flatMap(([svc, resources]) =>
      Object.entries(resources).map(([res, actions]) => `    ${svc}:${res} "${actions.join(' ')}"`)
    )
    .join('\n');

  return `#compdef tsarr

_tsarr() {
  local -a services globals
  services=(${services})
  globals=(doctor config completions)

  local -A resources
  resources=(
${resourceAssoc}
  )

  local -A actions
  actions=(
${actionAssoc}
  )

  _arguments -C \\
    '1:service:((\${services} \${globals}))' \\
    '2:resource:->resource' \\
    '3:action:->action' \\
    '*::options:->options'

  case $state in
    resource)
      local svc=\${words[2]}
      if [[ -n "\${resources[$svc]}" ]]; then
        _values 'resource' \${(s: :)resources[$svc]}
      elif [[ "$svc" == "config" ]]; then
        _values 'subcommand' init set get show
      fi
      ;;
    action)
      local svc=\${words[2]}
      local res=\${words[3]}
      local key="$svc:$res"
      if [[ -n "\${actions[$key]}" ]]; then
        _values 'action' \${(s: :)actions[$key]}
      fi
      ;;
    options)
      _arguments \\
        '--json[Output as JSON]' \\
        '--table[Output as table]' \\
        '--quiet[Output IDs only]' \\
        '--yes[Skip confirmation prompts]' \\
        '--instance[Instance name for multi-instance services]:instance:'
      ;;
  esac
}

_tsarr "$@"`;
}

function generateFishCompletion(): string {
  const services = Object.keys(SERVICE_COMMANDS).join(' ');
  const globals = 'doctor config completions';

  const resourceCompletions = Object.entries(SERVICE_COMMANDS)
    .map(([svc, resources]) => {
      const res = Object.keys(resources).join(' ');
      return `complete -c tsarr -n "__fish_seen_subcommand_from ${svc}; and not __fish_seen_subcommand_from ${res}" -a "${res}"`;
    })
    .join('\n');

  const actionCompletions = Object.entries(SERVICE_COMMANDS)
    .flatMap(([svc, resources]) =>
      Object.entries(resources).map(
        ([res, actions]) =>
          `complete -c tsarr -n "__fish_seen_subcommand_from ${svc}; and __fish_seen_subcommand_from ${res}; and not __fish_seen_subcommand_from ${actions.join(' ')}" -a "${actions.join(' ')}"`
      )
    )
    .join('\n');

  return `# Fish completions for tsarr
set -l services ${services}
set -l globals ${globals}

complete -c tsarr -f
complete -c tsarr -n "not __fish_seen_subcommand_from $services $globals" -a "$services $globals"

# Config subcommands
complete -c tsarr -n "__fish_seen_subcommand_from config" -a "init set get show"

# Service resources
${resourceCompletions}

# Resource actions
${actionCompletions}

# Global options
complete -c tsarr -l json -d "Output as JSON"
complete -c tsarr -l table -d "Output as table"
complete -c tsarr -l quiet -s q -d "Output IDs only"
complete -c tsarr -l yes -s y -d "Skip confirmation prompts"
complete -c tsarr -l instance -s i -d "Instance name (multi-instance services)"
`;
}

export const completions = defineCommand({
  meta: {
    name: 'completions',
    description: 'Generate shell completion scripts',
  },
  args: {
    shell: {
      type: 'positional',
      description: 'Shell type (bash, zsh, fish)',
      required: true,
    },
  },
  run({ args }) {
    switch (args.shell) {
      case 'bash':
        console.log(generateBashCompletion());
        break;
      case 'zsh':
        console.log(generateZshCompletion());
        break;
      case 'fish':
        console.log(generateFishCompletion());
        break;
      default:
        consola.error(`Unsupported shell: ${args.shell}. Use bash, zsh, or fish.`);
        process.exit(1);
    }
  },
});
