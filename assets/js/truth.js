(() => {
  'use strict';

  const page = document.querySelector('[data-truth-page]');
  if (!page || !window.AkatsuzuriGame) return;

  const state = window.AkatsuzuriGame.getState();
  if (state.phase < 3) return;

  const visitId = state.visitId || '記録欠損';
  document.querySelectorAll('[data-visit-id]').forEach((element) => { element.textContent = visitId; });
  const bodyParagraphs = document.querySelectorAll('.truth-section__body p');
  const documentTone = new Map([
    [0, '赤綴神社に本来祀られている受代ノ御影は、願いを無から叶える神ではない。病気、災難、経済的な損失などを別の人間へ移すことで、願い主を救済する存在である。災いを移された人間が生み出す苦痛は、神の糧となる。'],
    [5, '現在の宮司は、残された災いが自分に戻ることを恐れ、多くの人へ少しずつ災いを分ける「厄分けの儀式」を利用した。より多くの参拝者を集めるため、遠方からも参加できるWeb参拝を導入した。参拝者がWeb画面の鈴を鳴らすと、神社内の祭祀用の鈴が連動して鳴り、その参拝が赤綴帳へ登録される。'],
    [6, '正式な身代わりの成立には約3年を要する。一方、Web参拝者は鈴鳴らしのみで一時的な候補として登録される。一人あたりに分けられる災いが小さいため、運用には多数の参拝者が必要となる。'],
    [7, '多数のWeb参拝者が厄分けの儀式で神と結びつくと、受代ノ御影は宮司の個別の承認を必要とせず、参拝者が抱く願いを拾い、ほかの参拝者へ代償を分け始めた。神の力が無限に強くなったのではない。災いを受ける候補者が増えたため、宮司を介さず願いを成立させられるようになった。'],
    [8, '同じ参拝者が繰り返し身代わりに選ばれる場合もあり、少しずつ分けられた災いが積み重なって深刻な被害につながっていた。現宮司は無差別な転嫁を把握しているが、Web参拝を止めると新しい候補者を集められず、未処理の災いが自分へ集中するため、運営を継続している。']
  ]);
  documentTone.forEach((text, index) => { if (bodyParagraphs[index]) bodyParagraphs[index].textContent = text; });
  page.hidden = false;

  if (!state.truthViewed || !state.endingViewed || state.phase < 4) {
    window.AkatsuzuriGame.update((next) => {
      next.truthViewed = true;
      next.endingViewed = true;
      next.phase = Math.max(next.phase, 4);
    });
  }

  document.querySelector('[data-x-share]')?.addEventListener('click', () => {
    const text = '赤綴神社の公式サイトをご紹介します。\n「願いを結び、日々を穏やかに。」\n\n#おかしなサイト\n\nhttps://x.com/ARG_ObserverX';
    const params = new URLSearchParams({ text });
    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
    if (/^https?:$/.test(location.protocol) && !localHosts.has(location.hostname)) {
      params.set('url', new URL('index.html', location.href).href);
    }
    window.open(`https://x.com/intent/post?${params}`, '_blank', 'noopener,noreferrer');
  });
})();
