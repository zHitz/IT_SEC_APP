export async function checkHealth(fetcher = fetch) {
  const response = await fetcher('/health', { signal: AbortSignal.timeout(5000), cache: 'no-store' });
  if (!response.ok) throw new Error('Backend unavailable');
  const payload = await response.json();
  if (payload.status !== 'ok' || payload.scope !== 'liveness') throw new Error('Invalid health response');
  return 'Backend đang hoạt động · Kiểm tra tiến trình, chưa xác nhận database hay collector';
}
