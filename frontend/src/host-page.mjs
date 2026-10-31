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
  let expiryTimer = null;

  function clearProtectedViews() {
    const rows = get('inventory-rows');
    if (rows) rows.replaceChildren();
    const invTotal = get('inventory-total');
    if (invTotal) invTotal.textContent = 'Authentication required';
    const invStatus = get('inventory-status');
    if (invStatus) invStatus.textContent = 'Session expired or not authenticated. Please log in to view host inventory.';
    const invRetry = get('inventory-retry');
    if (invRetry) invRetry.hidden = true;
    const invPage = get('inventory-page');
    if (invPage) invPage.textContent = 'Page unavailable';

    const detailInfo = get('detail-info');
    if (detailInfo) detailInfo.replaceChildren();
    const detailRelated = get('detail-related');
    if (detailRelated) detailRelated.replaceChildren();
    const detailTitle = get('detail-title');
    if (detailTitle) detailTitle.textContent = 'Host details';
    const detailStatus = get('detail-status');
    if (detailStatus) detailStatus.textContent = 'Session expired or not authenticated. Please log in again.';
    const detailRetry = get('detail-retry');
    if (detailRetry) detailRetry.hidden = true;
  }

  function handleUnauthorized() {
    setSessionUI({ authenticated: false, expired: true });
  }

  const onUnauthorized = () => {
    handleUnauthorized();
  };
  document.addEventListener?.('atlas:unauthorized', onUnauthorized);

  function setSessionUI(session) {
    if (expiryTimer) {
      clearTimeout(expiryTimer);
      expiryTimer = null;
    }

    if (session?.authenticated) {
      currentCsrf = session.csrf || null;
      if (sessionInfo) sessionInfo.textContent = 'Authenticated session';
      if (loginForm) loginForm.hidden = true;
      if (logoutButton) { logoutButton.hidden = false; logoutButton.disabled = false; }
      if (typeof session.expiresAt === 'number') {
        const remaining = Math.max(0, session.expiresAt - Date.now());
        expiryTimer = setTimeout(() => {
          setSessionUI({ authenticated: false, expired: true });
        }, remaining);
      }
    } else {
      currentCsrf = null;
      if (sessionInfo) sessionInfo.textContent = 'Anonymous';
      if (loginForm) loginForm.hidden = false;
      if (logoutButton) logoutButton.hidden = true;
      clearProtectedViews();
    }

    try {
      const evt = new (document.defaultView?.CustomEvent || CustomEvent)('atlas:session-change', { detail: session });
      document.dispatchEvent(evt);
    } catch {
      try {
        const evt = new (document.defaultView?.Event || Event)('atlas:session-change');
        evt.detail = session;
        document.dispatchEvent(evt);
      } catch {}
    }

    onSessionChange?.(session);
  }

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    let logoutSuccess = false;
    try {
      const headers = { Accept: 'application/json' };
      if (currentCsrf) headers['X-CSRF-Token'] = currentCsrf;
      const res = await fetcher('/auth/logout', { method: 'POST', headers });
      logoutSuccess = Boolean(res && (res.ok || res.status === 200 || res.status === 204));
    } catch {
      logoutSuccess = false;
    }
    if (logoutSuccess) {
      setSessionUI({ authenticated: false });
      if (typeof document.defaultView?.location?.reload === 'function') {
        document.defaultView.location.reload();
      }
    } else {
      logoutButton.disabled = false;
      if (sessionInfo) sessionInfo.textContent = 'Logout failed. Session still active.';
    }
  });

  const sessionPromise = checkSession(fetcher).then(session => {
    setSessionUI(session);
    return session;
  });

  return {
    ready: sessionPromise,
    getCsrf: () => currentCsrf,
    setSessionUI,
    handleUnauthorized,
    destroy() {
      document.removeEventListener?.('atlas:unauthorized', onUnauthorized);
      if (expiryTimer) clearTimeout(expiryTimer);
    }
  };
}

export function mountHostPage(document, { fetcher = fetch, navigation, useStandardApi = true } = {}) {
  let handle401 = () => {};
  const pageFetcher = async (url, options) => {
    try {
      const res = await fetcher(url, options);
      if (res && res.status === 401) {
        handle401();
      }
      return res;
    } catch (err) {
      if (err && err.status === 401) {
        handle401();
      }
      throw err;
    }
  };

  mountViewBookmarks(document, { navigation });
  const navUi = mountHostNavigation(document, { fetcher: pageFetcher, navigation, useStandardApi });
  const auth = initAuthSession(document, {
    fetcher: pageFetcher,
    onSessionChange(session) {
      if (!session?.authenticated) {
        navUi.invalidate?.();
      }
    }
  });
  handle401 = () => auth.handleUnauthorized();

  return {
    navUi,
    auth,
    ready: Promise.all([navUi.ready, auth.ready]),
    destroy() {
      auth.destroy?.();
      navUi.destroy?.();
    }
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
  mountHostPage(document, { useStandardApi: true });
}
