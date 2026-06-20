/**
 * Lightweight heuristic deciding whether a string is a runnable CLI command
 * (vs. a conceptual/Chinese description). Kept separate from the heavy
 * `commandPreviews` data so it can be imported without pulling that bundle.
 */
export function isExecutableCommand(command: string): boolean {
  if (!command) return false
  const cleanCmd = command.trim()
  const cleanCmdLower = cleanCmd.toLowerCase()

  // If it has Chinese, it's not a CLI command
  if (/[一-龥]/.test(cleanCmd)) return false

  // If it contains typical conceptual indicators
  if (
    cleanCmd.includes(' + ') ||
    cleanCmd.includes(' -> ') ||
    cleanCmd.includes(' ->') ||
    cleanCmd.includes(' => ') ||
    cleanCmd.includes(' =>') ||
    cleanCmdLower.includes('lifecycle hooks') ||
    cleanCmdLower.includes('escalation chain') ||
    cleanCmdLower.includes('connection between')
  ) {
    return false
  }

  const words = cleanCmd.split(/\s+/)
  const firstWord = words[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, '') || ''

  // List of standard executable commands
  const knownExecutables = new Set([
    'tar', 'ls', 'df', 'du', 'ss', 'netstat', 'systemctl', 'kubectl', 'docker', 'grep',
    'chmod', 'chown', 'find', 'curl', 'ping', 'openssl', 'dig', 'nc', 'journalctl', 'free',
    'top', 'iostat', 'logrotate', 'visudo', 'last', 'ausearch', 'conntrack', 'tcpdump',
    'lsblk', 'growpart', 'resize2fs', 'xfs_growfs', 'helm', 'ansible-playbook', 'explain',
    'analyze', 'info', 'gzip', 'zip', 'git', 'nginx', 'firewall-cmd', 'ip', 'telnet',
    'cat', 'set', 'lsof', 'sysctl', 'whoami', 'id', 'passwd', 'tail', 'head', 'history', 'ln',
    'sh', 'bash', 'python', 'node', 'perl', 'ruby', 'aws', 'gcloud', 'aliyun', 'terraform'
  ])

  // Strict check for set
  if (firstWord === 'set') {
    if (!cleanCmdLower.startsWith('set -') && !cleanCmdLower.startsWith('set +')) {
      return false
    }
  }

  // Strict check for kubectl subcommands
  if (firstWord === 'kubectl') {
    const secondWord = words[1]?.toLowerCase() || ''
    const validKubectlSubcommands = new Set([
      'get', 'describe', 'logs', 'apply', 'delete', 'create', 'edit', 'exec',
      'port-forward', 'top', 'rollout', 'scale', 'autoscale', 'cluster-info',
      'cordon', 'uncordon', 'drain', 'taint', 'api-resources', 'api-versions',
      'config', 'explain', 'version', 'patch', 'replace', 'run', 'expose',
      'label', 'annotate', 'auth'
    ])
    if (!validKubectlSubcommands.has(secondWord)) {
      return false
    }
  }

  // Check if it starts with a known tool, or if it is a script execution (starts with ./ or /)
  if (knownExecutables.has(firstWord)) return true
  if (cleanCmd.startsWith('./') || cleanCmd.startsWith('/') || cleanCmd.startsWith('sh ') || cleanCmd.startsWith('bash ')) return true

  return false
}
