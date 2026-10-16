(() => {
  'use strict';

  // STEP3 candidate values. These timings are not final approved specifications.
  const EMA_ANOMALY_DELAY_MS = 5000;
  const DEITY_SWAP_INTERVAL_MS = 4000;

  const current = () => window.AkatsuzuriGame?.getState?.() || { hasWorshipped: false, phase: 0, discovered: {}, readBooks: [false, false, false, false], supportRecordsViewed: false };

  const requestPhaseAction = (name, href, source) => {
    const event = new CustomEvent('akatsuzuri:phase-action', {
      bubbles: true,
      cancelable: true,
      detail: { name, href, source, state: current() }
    });
    if (source.dispatchEvent(event)) location.href = href;
  };

  const initEma = () => {
    const normal = document.querySelector('[data-ema-normal]');
    const anomaly = document.querySelector('[data-ema-anomaly]');
    if (!normal || !anomaly) return;
    let timer = null;

    const showAnomaly = () => {
      window.clearTimeout(timer);
      normal.hidden = true;
      anomaly.hidden = false;
      anomaly.removeAttribute('tabindex');
      anomaly.setAttribute('aria-hidden', 'false');
    };
    const render = () => {
      window.clearTimeout(timer);
      const state = current();
      if (state.discovered.ema) return showAnomaly();
      normal.hidden = false;
      anomaly.hidden = true;
      anomaly.tabIndex = -1;
      anomaly.setAttribute('aria-hidden', 'true');
      if (state.hasWorshipped) timer = window.setTimeout(showAnomaly, EMA_ANOMALY_DELAY_MS);
    };
    anomaly.addEventListener('click', (event) => {
      event.preventDefault();
      requestPhaseAction('ema', anomaly.href, anomaly);
    });
    document.addEventListener('akatsuzuri:statechange', render);
    render();
  };

  const initDeity = () => {
    const image = document.querySelector('[data-deity-image]');
    const trigger = document.querySelector('[data-deity-trigger]');
    const frame = document.querySelector('[data-deity-image-frame]');
    if (!image || !trigger || !frame) return;
    let timer = null;
    let anomalyVisible = false;

    const show = (anomaly, animate = true) => {
      if (animate) {
        frame.classList.remove('is-glitching');
        void frame.offsetWidth;
        frame.classList.add('is-glitching');
        window.setTimeout(() => frame.classList.remove('is-glitching'), 480);
      }
      anomalyVisible = anomaly;
      image.src = anomaly ? 'images/deity-hidden.webp' : 'images/deity-normal.webp';
      image.width = anomaly ? 971 : 1122;
      image.height = anomaly ? 1619 : 1402;
      image.alt = anomaly ? '黒く険しい神体と赤い紐、赤い帳面が描かれた古い祭神画' : '穏やかな姿で描かれた結守大神の古い神像画';
      trigger.hidden = !anomaly;
    };
    const render = () => {
      window.clearInterval(timer);
      show(false, false);
      if (current().phase >= 1) timer = window.setInterval(() => show(!anomalyVisible), DEITY_SWAP_INTERVAL_MS);
    };
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (anomalyVisible) requestPhaseAction('deity', trigger.href, trigger);
    });
    document.addEventListener('akatsuzuri:statechange', render);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearInterval(timer);
      else render();
    });
    render();
  };

  const bookContent = [
    {
      title: '災いの記録',
      html: `<div class="c-modal__record"><strong>記録番号：T-021</strong><p>願い主：████ ████<br>願意：病気平癒<br>祈願結果：成就<br>身代わり：U-017<br>転嫁結果：成立<br>身代わり発症：祈願成立日と同日</p></div><p>願い主から取り除いた病気は消えたのではなく、身代わりの人間へ移されていた。</p><p>高額な特別奉納金の祈願と、指定された身代わりの記録が同じ番号で結び付けられている。</p>`
    },
    {
      title: '身代わり名簿',
      html: `<div class="c-modal__records"><div class="c-modal__record"><strong>U-017</strong><p>登録期間：3年2か月<br>病気平癒案件：1件<br>最終状態：死亡</p></div><div class="c-modal__record"><strong>U-023</strong><p>登録期間：4年1か月<br>事業損失案件：2件<br>最終状態：死亡</p></div><div class="c-modal__record"><strong>U-041</strong><p>登録期間：3年8か月<br>病気平癒案件：2件<br>最終状態：死亡</p></div></div><p>一部の登録記録には、赤綴生活支援会との関連が残されている。</p><p><strong>指定身代わり：全員継続不能</strong><br><strong>指定身代わり制度：運用停止</strong></p>`
    },
    {
      title: '神との契約記録',
      html: `<p class="c-document__classical">禍を受けし者、その身にて尽くせざれば、結びし主、残りの禍を負うべし。</p><div class="c-modal__records"><div class="c-modal__record"><strong>先代宮司の記録</strong><p>対象者：████（先代宮司）<br>死亡年月日：2023年8月4日<br>未処理の災い：27件<br>身代わり継続不能：11名<br>宮司への災いの還流：発生<br>結果：先代宮司死亡<br>残された災い：未処理</p></div><div class="c-modal__record"><strong>現在の宮司の記録</strong><p>対象者：████ ████<br>契約継承：成立<br>残された災い：継承対象<br>処理状況：再分配中</p></div></div><p><strong>現代語</strong><br>先代宮司は災いの一部を受けて死亡しましたが、未処理の災いは新しい宮司にも引き継がれていました。</p>`
    },
    {
      title: '赤綴生活支援会　身代わり候補者管理',
      dark: true,
      html: `<div class="c-modal__records"><div class="c-modal__record"><strong>管理資料</strong><p>・登録者管理<br>・支援事業記録<br>・身代わり選定記録</p></div></div><div class="c-modal__actions"><button class="c-button c-button--primary" type="button" data-view-support-records>閲覧する</button></div>`
    }
  ];

  const initArchive = () => {
    const frame = document.querySelector('[data-archive-image-frame]');
    const image = document.querySelector('[data-archive-image]');
    const buttons = [...document.querySelectorAll('[data-book]')];
    const progress = document.querySelector('[data-archive-progress]');
    const modal = document.querySelector('[data-book-modal]');
    const dialog = modal?.querySelector('[data-modal-dialog]');
    const title = modal?.querySelector('[data-modal-title]');
    const body = modal?.querySelector('[data-modal-body]');
    const records = document.querySelector('[data-support-records]');
    const truthLink = document.querySelector('[data-truth-link]');
    if (!frame || !image || buttons.length !== 4 || !modal || !dialog || !title || !body || !records) return;
    let returnFocus = null;

    const render = () => {
      const state = current();
      const unlocked = state.phase >= 2;
      image.src = unlocked ? 'images/archive-changed.webp' : 'images/archive-normal.webp';
      image.alt = unlocked ? '古文書保管室の机に4冊の赤い帳面が置かれている' : '古文書や巻物を点検する赤綴神社の保管室';
      buttons.forEach((button, index) => {
        button.hidden = !unlocked;
        button.disabled = false;
      });
      const next = state.readBooks.findIndex((read) => !read);
      progress.textContent = !unlocked ? '' : next < 0 ? 'すべての記録を閲覧できます。' : '赤綴帳を選び、記録を確認してください。';
      records.hidden = !state.supportRecordsViewed;
      if (truthLink) truthLink.setAttribute('aria-disabled', String(!state.supportRecordsViewed || !state.readBooks.every(Boolean)));
    };

    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    const closeModal = () => {
      modal.hidden = true;
      document.documentElement.classList.remove('is-modal-open');
      returnFocus?.focus();
    };
    const openBook = (index, button) => {
      const book = bookContent[index];
      returnFocus = button;
      title.textContent = book.title;
      body.innerHTML = book.html;
      dialog.classList.toggle('c-modal__dialog--dark', book.dark === true);
      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      dialog.focus();
      if (!current().readBooks[index]) {
        window.AkatsuzuriGame?.update?.((state) => { state.readBooks[index] = true; });
      }
      body.querySelector('[data-view-support-records]')?.addEventListener('click', () => {
        window.AkatsuzuriGame?.update?.((state) => { state.supportRecordsViewed = true; });
        closeModal();
        records.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        records.querySelector('h2')?.focus?.({ preventScroll: true });
      });
    };

    buttons.forEach((button, index) => button.addEventListener('click', () => {
      const nextUnread = current().readBooks.findIndex((read) => !read);
      openBook(nextUnread < 0 ? index : nextUnread, button);
    }));
    modal.querySelectorAll('[data-modal-close]').forEach((close) => close.addEventListener('click', closeModal));
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    truthLink?.addEventListener('click', (event) => {
      event.preventDefault();
      const state = current();
      if (!state.supportRecordsViewed || !state.readBooks.every(Boolean)) return;
      requestPhaseAction('archive', truthLink.href, truthLink);
    });
    document.addEventListener('akatsuzuri:statechange', render);
    render();
  };

  window.AkatsuzuriStep3 = Object.freeze({ timings: Object.freeze({ emaAnomalyDelayMs: EMA_ANOMALY_DELAY_MS, deitySwapIntervalMs: DEITY_SWAP_INTERVAL_MS }) });

  initEma();
  initDeity();
  initArchive();
})();
