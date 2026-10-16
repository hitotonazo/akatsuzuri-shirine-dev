(() => {
  'use strict';

  const STORAGE_KEY = 'akatsuzuri:v1';
  const initialState = () => ({
    schemaVersion: 1,
    phase: 0,
    hasWorshipped: false,
    visitId: null,
    discovered: { ema: false, deity: false, archive: false },
    readBooks: [false, false, false, false],
    supportRecordsViewed: false,
    truthViewed: false,
    endingViewed: false,
    modificationPlayed: { ema: false, deity: false, archive: false }
  });

  const isBooleanMap = (value) => value && ['ema', 'deity', 'archive'].every((key) => typeof value[key] === 'boolean');
  const isState = (value) => value && value.schemaVersion === 1 && Number.isInteger(value.phase) && value.phase >= 0 && value.phase <= 4 &&
    typeof value.hasWorshipped === 'boolean' && (value.visitId === null || /^WEB-\d{5}$/.test(value.visitId)) &&
    isBooleanMap(value.discovered) && isBooleanMap(value.modificationPlayed) &&
    Array.isArray(value.readBooks) && value.readBooks.length === 4 && value.readBooks.every((read) => typeof read === 'boolean') &&
    typeof value.supportRecordsViewed === 'boolean';
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return isState(saved) ? { ...initialState(), ...saved, discovered: { ...initialState().discovered, ...saved.discovered }, modificationPlayed: { ...initialState().modificationPlayed, ...saved.modificationPlayed }, readBooks: [0, 1, 2, 3].map((index) => saved.readBooks[index] === true) } : initialState();
    } catch { return initialState(); }
  };
  let state = read();
  const snapshot = () => ({ ...state, discovered: { ...state.discovered }, modificationPlayed: { ...state.modificationPlayed }, readBooks: [...state.readBooks] });
  const publish = () => document.dispatchEvent(new CustomEvent('akatsuzuri:statechange', { detail: snapshot() }));
  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); publish(); };
  const set = (updater) => { updater(state); save(); };
  const visitId = () => `WEB-${String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0')}`;
  const pageRequirements = { 'donation-record.html': 1, 'old-record.html': 2, 'truth.html': 3 };
  const enforcePageAccess = () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    if ((pageRequirements[page] ?? 0) > state.phase) {
      location.replace('index.html');
      return false;
    }
    return true;
  };

  const playAlteration = (key, destination) => {
    if (state.modificationPlayed[key]) { location.href = destination; return; }
    set((next) => { next.modificationPlayed[key] = true; });
    const play = window.SiteAlteration?.play;
    if (!play) { location.href = destination; return; }
    play({ message: 'サイトが改変されました', focusOverlay: false }).then(() => { location.href = destination; });
  };

  const complete = (name, destination) => {
    if (name === 'ema') {
      set((next) => { next.discovered.ema = true; next.phase = Math.max(next.phase, 1); });
      playAlteration('ema', destination);
    }
    if (name === 'deity') {
      set((next) => { next.discovered.deity = true; next.phase = Math.max(next.phase, 2); });
      playAlteration('deity', destination);
    }
    if (name === 'archive') {
      if (!state.supportRecordsViewed || !state.readBooks.every(Boolean)) return;
      set((next) => { next.discovered.archive = true; next.phase = Math.max(next.phase, 3); });
      playAlteration('archive', destination);
    }
  };

  const setDebugPhase = (phase) => {
    const next = initialState();
    if (phase !== 'normal') { next.hasWorshipped = true; next.visitId = visitId(); next.discovered.ema = true; next.phase = 1; }
    if (phase === 'phase2' || phase === 'phase3' || phase === 'truth') { next.discovered.deity = true; next.phase = 2; }
    if (phase === 'phase3' || phase === 'truth') { next.discovered.archive = true; next.readBooks = [true, true, true, true]; next.supportRecordsViewed = true; next.phase = 3; }
    if (phase === 'truth') { next.truthViewed = true; next.endingViewed = true; next.phase = 4; }
    state = next;
    save();
  };

  document.addEventListener('akatsuzuri:phase-action', (event) => {
    event.preventDefault();
    complete(event.detail.name, event.detail.href);
  });
  document.addEventListener('akatsuzuri:reset-requested', () => {
    if (!window.confirm('探索の進行状況をリセットして、最初から始めますか？')) return;
    state = initialState();
    localStorage.removeItem(STORAGE_KEY);
    publish();
    location.href = 'index.html';
  });
  window.SiteAlterationDebug?.init({
    storagePrefix: 'akatsuzuri',
    state: { phases: ['normal', 'phase1', 'phase2', 'phase3', 'truth'], getPhase: () => state.phase === 0 ? 'normal' : state.phase >= 4 ? 'truth' : `phase${state.phase}`, setPhase: setDebugPhase },
    labels: { phase: 'PHASE', current: '現在' }
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (!enforcePageAccess()) return;
    const bell = document.querySelector('[data-worship-bell]');
    const message = document.querySelector('[data-worship-message]');
    if (bell) {
      const renderWorship = () => { message.hidden = !state.hasWorshipped; bell.disabled = state.hasWorshipped; };
      bell.addEventListener('click', () => {
        if (state.hasWorshipped) return;
        set((next) => { next.hasWorshipped = true; next.visitId ||= visitId(); });
        renderWorship();
      });
      document.addEventListener('akatsuzuri:statechange', renderWorship);
      renderWorship();
    }
  });
  window.addEventListener('pageshow', () => {
    state = read();
    if (enforcePageAccess()) publish();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    state = read();
    if (enforcePageAccess()) publish();
  });
  window.AkatsuzuriGame = Object.freeze({ getState: snapshot, update: set, setDebugPhase, reset: () => { state = initialState(); localStorage.removeItem(STORAGE_KEY); publish(); } });
  enforcePageAccess();
  publish();
})();
