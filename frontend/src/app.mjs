import { checkHealth } from './health.mjs';

try { document.documentElement.dataset.theme = localStorage.getItem('atlas.theme') === 'light' ? 'light' : 'dark'; } catch { /* Theme remains usable if storage is denied. */ }
document.querySelector('#theme').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('atlas.theme', theme); } catch { /* No persistence in private environments. */ }
});
document.querySelector('#check').addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('#health');
  button.disabled = true;
  status.textContent = 'Đang kiểm tra…';
  try { status.textContent = await checkHealth(); }
  catch { status.textContent = 'Chưa kết nối được backend. Kiểm tra cấu hình và thử lại.'; }
  finally { button.disabled = false; }
});
