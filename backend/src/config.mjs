export function port(value, name) {
  if (!/^\d+$/.test(value ?? '') || Number(value) < 1 || Number(value) > 65535) {
    throw new Error(`${name} must be an integer from 1 to 65535`);
  }
  return Number(value);
}

export function backendConfig(env) {
  if (!env.BACKEND_HOST) throw new Error('BACKEND_HOST is required');
  return { host: env.BACKEND_HOST, port: port(env.BACKEND_PORT, 'BACKEND_PORT') };
}
