// Menandai frasa dalam soal cerita: "nilai awal (b)" atau "per satuan (a)"  (temuan EL05).

import { h } from '../ui.js';

export function buatSorotTeks(bagian, { nilaiAwal = null, onUbah } = {}) {
  const nilai = { a: nilaiAwal?.a ?? null, b: nilaiAwal?.b ?? null };
  let aktif = null;
  let terkunci = false;
  const tombolFrasa = new Map();

  const cerita = h('p', { class: 'cerita' });
  for (const b of bagian) {
    if (!b.id) {
      cerita.append(b.t);
      continue;
    }
    const t = h('button', { class: 'frasa', type: 'button', onclick: () => pilihFrasa(b.id) }, b.t);
    tombolFrasa.set(b.id, { el: t, teks: b.t });
    cerita.append(t);
  }

  const judulPemilih = h('p', { class: 'judul-pemilih' });
  const pemilih = h('div', { class: 'pemilih-label' },
    judulPemilih,
    h('div', { class: 'baris-tombol' },
      h('button', { class: 'tombol tombol-label-b', type: 'button', onclick: () => tandai('b') }, 'Nilai awal (b)'),
      h('button', { class: 'tombol tombol-label-a', type: 'button', onclick: () => tandai('a') }, 'Per satuan (a)'),
      h('button', { class: 'tombol tombol-teks', type: 'button', onclick: () => tandai(null) }, 'Bukan keduanya')));
  pemilih.hidden = true;

  const legenda = h('p', { class: 'legenda-sorot' },
    h('span', { class: 'tanda tanda-b' }, 'b = nilai awal, dibayar sekali'), ' ',
    h('span', { class: 'tanda tanda-a' }, 'a = per satuan, dikalikan x'));

  function pilihFrasa(id) {
    if (terkunci) return;
    aktif = id;
    judulPemilih.textContent = `Tandai “${tombolFrasa.get(id).teks}” sebagai:`;
    pemilih.hidden = false;
    perbarui();
  }

  function tandai(label) {
    if (aktif === null) return;
    if (nilai.a === aktif) nilai.a = null;
    if (nilai.b === aktif) nilai.b = null;
    if (label) nilai[label] = aktif;
    aktif = null;
    pemilih.hidden = true;
    perbarui();
    onUbah?.({ ...nilai });
  }

  function perbarui() {
    for (const [id, { el }] of tombolFrasa) {
      el.classList.toggle('frasa-a', nilai.a === id);
      el.classList.toggle('frasa-b', nilai.b === id);
      el.classList.toggle('frasa-aktif', aktif === id);
      if (nilai.a === id) el.dataset.tanda = 'a';
      else if (nilai.b === id) el.dataset.tanda = 'b';
      else delete el.dataset.tanda;
    }
  }

  perbarui();
  return {
    el: h('div', { class: 'sorot-teks' }, legenda, cerita, pemilih),
    nilai: () => ({ ...nilai }),
    kunci(v = true) {
      terkunci = v;
      pemilih.hidden = true;
    },
  };
}
