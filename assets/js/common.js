(() => {
  'use strict';

  const pages = [
    ['index.html', 'TOP'],
    ['about.html', '赤綴神社について'],
    ['events.html', '年間行事'],
    ['ema.html', '奉納絵馬'],
    ['worship.html', 'Web参拝'],
    ['visit.html', '参拝案内']
  ];

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const navItems = pages.map(([href, label]) => {
    const current = href === currentPage ? ' aria-current="page"' : '';
    return `<li class="site-header__nav-item"><a class="site-header__nav-link" href="${href}"${current}>${label}</a></li>`;
  }).join('');
  const footerItems = pages.map(([href, label]) => `<li><a class="site-footer__nav-link" href="${href}">${label}</a></li>`).join('');

  const header = document.querySelector('[data-site-header]');
  if (header) {
    header.outerHTML = `
      <header class="site-header" data-site-header>
        <div class="site-header__inner l-container">
          <a class="site-header__logo" href="index.html" aria-label="赤綴神社 トップページ">
            <img src="images/logo-main.webp" width="1821" height="530" alt="赤綴神社 AKATSUZURI JINJA">
          </a>
          <nav class="site-header__nav" id="global-navigation" aria-label="メインナビゲーション" data-global-nav>
            <ul class="site-header__nav-list">${navItems}</ul>
          </nav>
          <div class="site-header__actions">
            <button class="site-header__reset" type="button" data-exploration-reset>探索リセット</button>
            <button class="site-header__menu-button" type="button" aria-controls="global-navigation" aria-expanded="false" aria-label="メニューを開く" data-menu-button>
              <span class="site-header__menu-icon" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>`;
  }

  const footer = document.querySelector('[data-site-footer]');
  if (footer) {
    footer.outerHTML = `
      <footer class="site-footer" data-site-footer>
        <div class="l-container">
          <div class="site-footer__inner">
            <a class="site-footer__logo" href="index.html" aria-label="赤綴神社 トップページ">
              <img src="images/logo-light.webp" width="1821" height="530" alt="赤綴神社 AKATSUZURI JINJA">
            </a>
            <nav aria-label="フッターナビゲーション"><ul class="site-footer__nav-list">${footerItems}</ul></nav>
          </div>
          <div class="site-footer__bottom">
            <p>©ぺいぽぴー</p>
            <p class="site-footer__disclaimer">※このWebサイトの内容はフィクションであり、実在の人物・団体とは一切関係ありません。</p>
            <p><a class="site-footer__credit" href="https://pocket-se.info/">ポケットサウンド/効果音素材</a></p>
          </div>
        </div>
      </footer>`;
  }

  const menuButton = document.querySelector('[data-menu-button]');
  const navigation = document.querySelector('[data-global-nav]');
  let lastFocused = null;

  const setMenu = (open) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    navigation.classList.toggle('is-open', open);
    document.body.classList.toggle('is-menu-open', open);
    if (open) {
      lastFocused = menuButton;
      navigation.querySelector('a')?.focus();
    } else if (document.activeElement !== menuButton) {
      lastFocused?.focus();
    }
  };

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });
  const desktopQuery = window.matchMedia?.('(min-width: 901px)');
  const closeMenuOnDesktop = (event) => {
    if (event.matches) setMenu(false);
  };
  if (desktopQuery?.addEventListener) desktopQuery.addEventListener('change', closeMenuOnDesktop);
  else desktopQuery?.addListener?.(closeMenuOnDesktop);

  document.querySelector('[data-exploration-reset]')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('akatsuzuri:reset-requested'));
  });
})();
