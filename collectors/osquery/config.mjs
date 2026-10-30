export function validateCollectorConfig(c) {
  if (!['osqueryi', 'sqlite-lab'].includes(c.sourceMode) || !['deb', 'rpm', 'other'].includes(c.ecosystem)) throw Error('COLLECTOR_SOURCE_CONFIG');
  for (const key of ['collectIntervalMs', 'sendIntervalMs', 'queryTimeoutMs', 'timeoutMs', 'backoffMs', 'maxQueueBytes', 'maxBatchRows', 'attempts']) {
    if (!Number.isSafeInteger(c[key]) || c[key] < 1) throw Error('COLLECTOR_LIMIT_CONFIG');
  }
  if (c.maxBatchRows > 1000 || c.attempts > 5 || c.queryTimeoutMs > 120000 || c.timeoutMs > 120000
    || c.collectIntervalMs < 1000 || c.sendIntervalMs < 1000) throw Error('COLLECTOR_LIMIT_CONFIG');
  if (typeof c.queueDirectory !== 'string' || !c.queueDirectory || (c.sourceMode === 'sqlite-lab' && !c.labDatabase)
    || (c.sourceMode === 'osqueryi' && (!c.osqueryBinary || !c.osqueryConfig))) throw Error('COLLECTOR_PATH_CONFIG');
  return c;
}
