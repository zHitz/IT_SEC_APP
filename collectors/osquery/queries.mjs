export const queries = Object.freeze({
  system_info: 'SELECT hostname, uuid FROM system_info',
  os_version: 'SELECT name, version FROM os_version',
  packages: 'SELECT name, version FROM packages',
  listening_ports: 'SELECT port, protocol, address, pid FROM listening_ports',
  processes: 'SELECT pid, name FROM processes',
});
export const excluded = Object.freeze(['environment variables', 'process command line', 'file contents', 'shell history', 'passwords', 'tokens', 'private keys', 'cookies']);
