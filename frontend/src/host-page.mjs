import {mountViewBookmarks} from './view-bookmarks.mjs';
import {mountHostNavigation} from './host-navigation.mjs';

export async function checkSession(fetcher = fetch) {
  try {
    const res = await fetcher('/auth/session', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

export function initAuthSession(document, { fetcher = fetch, onSessionChange } = {}) {
  const get = id => document.getElementById(id);
  const sessionInfo = get('session-info');
  const loginForm = get('login-form');
  const logoutButton = get('logout-button');
  let currentCsrf = null;

  function setSessionUI(session) {
    if (session?.authenticated) {
      currentCsrf = session.csrf || null;
      if (sessionInfo) sessionInfo.textContent = 'Authenticated session';
      if (loginForm) loginForm.hidden = true;
      if (logoutButton) { logoutButton.hidden = false; logoutButton.disabled = false; }
    } else {
      currentCsrf = null;
      if (sessionInfo) sessionInfo.textContent = 'Anonymous';
      if (loginForm) loginForm.hidden = false;
      if (logoutButton) logoutButton.hidden = true;
    }
    onSessionChange?.(session);
  }

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      const headers = { Accept: 'application/json' };
      if (currentCsrf) headers['X-CSRF-Token'] = currentCsrf;
      await fetcher('/auth/logout', { method: 'POST', headers });
    } catch {}
    setSessionUI({ authenticated: false });
    if (typeof document.defaultView?.location?.reload === 'function') {
      document.defaultView.location.reload();
    }
  });

  const sessionPromise = checkSession(fetcher).then(session => {
    setSessionUI(session);
    return session;
  });

  return {
    ready: sessionPromise,
    getCsrf: () => currentCsrf,
    setSessionUI
  };
}

if (typeof document !== 'undefined') {
  try { document.documentElement.dataset.theme = localStorage.getItem('atlas.theme') === 'light' ? 'light' : 'dark'; } catch {}
  const themeBtn = document.getElementById('theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('atlas.theme', theme); } catch {}
    });
  }
  mountViewBookmarks(document);
  mountHostNavigation(document);
  initAuthSession(document);
}
