// Umpan balik yang MENJELASKAN, bukan hanya "Benar/Salah".

import { h } from '../ui.js';

export function buatUmpanBalik() {
  const el = h('div', { class: 'umpan-balik', role: 'status', 'aria-live': 'polite' });
  el.hidden = true;
  return {
    el,
    /** jenis: 'benar' | 'salah' | 'info' */
    tampil(jenis, judul, ...isi) {
      el.className = `umpan-balik umpan-${jenis}`;
      el.replaceChildren(
        h('p', { class: 'judul-umpan' }, judul),
        ...isi.filter(Boolean).map((x) => (x instanceof Node ? x : h('p', {}, x))),
      );
      el.hidden = false;
    },
    sembunyi() {
      el.hidden = true;
    },
  };
}
