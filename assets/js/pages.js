(() => {
  'use strict';

  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;

  const AUTOPLAY_MS = 6000;
  const slides = [...slider.querySelectorAll('[data-slide]')];
  const pages = [...slider.querySelectorAll('[data-slider-page]')];
  const previous = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  const toggle = slider.querySelector('[data-slider-toggle]');
  const status = slider.querySelector('[data-slider-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let timer = null;

  const updateToggle = () => {
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? '自動再生を開始' : '自動再生を一時停止');
  };

  const schedule = () => {
    window.clearInterval(timer);
    timer = null;
    if (!paused && !document.hidden) timer = window.setInterval(() => show(current + 1), AUTOPLAY_MS);
  };

  const show = (index, announce = false) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    pages.forEach((page, pageIndex) => {
      const active = pageIndex === current;
      page.classList.toggle('is-active', active);
      if (active) page.setAttribute('aria-current', 'true'); else page.removeAttribute('aria-current');
    });
    status.textContent = `${current + 1}枚目／${slides.length}枚中`;
    if (announce) status.setAttribute('aria-live', 'assertive');
    schedule();
  };

  previous.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));
  pages.forEach((page) => page.addEventListener('click', () => show(Number(page.dataset.sliderPage), true)));
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); schedule(); });
  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1, true); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1, true); }
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', (event) => { paused = event.matches; updateToggle(); schedule(); });

  updateToggle();
  schedule();
})();
