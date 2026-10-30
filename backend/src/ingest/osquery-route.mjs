import { createHash, timingSafeEqual } from 'node:crypto';
import { IngestError, validateBatch } from './osquery-model.mjs';
const hash = value => createHash('sha256').update(value).digest();
export function createOsqueryRoute({ store, tokens, maxBytes = 1048576, log = value => console.log(JSON.stringify(value)) }) {
  if (!tokens || Object.values(tokens).some(token => typeof token !== 'string' || token.length < 16)) throw Error('INGEST_TOKEN_CONFIG');
  const registered = new Map(Object.entries(tokens).map(([id, token]) => [id, hash(token)]));
  return async function ingest(request) {
    const auth = request.headers.authorization ?? '';
    if (!auth.startsWith('Bearer ') || auth.length > 4096) throw new IngestError('UNAUTHORIZED', 401);
    const supplied = hash(auth.slice(7));
    // Refuse unknown credentials before buffering/decoding untrusted JSON.
    if (![...registered.values()].some(token => timingSafeEqual(token, supplied))) throw new IngestError('UNAUTHORIZED', 401);
    if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '')) throw new IngestError('UNSUPPORTED_MEDIA_TYPE', 415);
    let size = 0, chunks = [];
    for await (const chunk of request) {
      size += chunk.length; if (size > maxBytes) throw new IngestError('PAYLOAD_TOO_LARGE', 413);
      chunks.push(chunk);
    }
    let batch;
    try { batch = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new IngestError('INVALID_JSON', 400); }
    validateBatch(batch);
    const expected = registered.get(batch.host.host_uuid);
    if (!expected || !timingSafeEqual(expected, supplied)) throw new IngestError('HOST_IDENTITY_MISMATCH', 403);
    const result = await store(batch);
    log({ event: 'osquery_batch_accepted', batch_id: batch.batch_id, host_id: result.host_id, collected_at: batch.collected_at,
      packages: result.packages, listening_ports: result.listening_ports, non_listening_evidence: result.non_listening_evidence });
    return result;
  };
}
