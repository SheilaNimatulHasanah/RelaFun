// Skala usaha mental (Paas, 1–9) untuk mengukur beban kognitif setelah tiap modul.

import { h } from '../ui.js';

const KETERANGAN = [
  '',
  'sangat-sangat ringan',
  'sangat ringan',
  'ringan',
  'agak ringan',
  'sedang',
  'agak berat',
  'berat',
  'sangat berat',
  'sangat-sangat berat',
];

export function buatSkalaBeban({ onPilih } = {}) {
  let nilai = null;
  const keterangan = h('p', { class: 'keterangan-skala', 'aria-live': 'polite' }, 'Belum dipilih');
  const tombol = [];
  const kisi = h('div', { class: 'kisi-skala', role: 'radiogroup', 'aria-label': 'Skala usaha pikiran 1 sampai 9' });

  for (let i = 1; i <= 9; i++) {
    const t = h('button', {
      class: 'tombol-skala',
      type: 'button',
      role: 'radio',
      'aria-checked': 'false',
      'aria-label': `${i}, ${KETERANGAN[i]}`,
      onclick: () => pilih(i),
    }, String(i));
    tombol.push(t);
    kisi.append(t);
  }

  function pilih(i) {
    nilai = i;
    tombol.forEach((t, j) => {
      t.setAttribute('aria-checked', String(j + 1 === i));
      t.classList.toggle('dipilih', j + 1 === i);
    });
    keterangan.textContent = `${i} = ${KETERANGAN[i]}`;
    onPilih?.(i);
  }

  const el = h('fieldset', { class: 'skala-beban' },
    h('legend', {}, 'Seberapa besar usaha pikiran yang kamu keluarkan di modul ini?'),
    kisi,
    h('div', { class: 'ujung-skala' }, h('span', {}, '1 = sangat-sangat ringan'), h('span', {}, '9 = sangat-sangat berat')),
    keterangan);

  return { el, nilai: () => nilai };
}
