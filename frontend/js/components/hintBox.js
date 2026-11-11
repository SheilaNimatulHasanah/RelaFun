// Petunjuk bertingkat: (1) pertanyaan pengarah, (2) langkah berikutnya, (3) contoh serupa.

import { h } from '../ui.js';

export function buatPetunjuk(daftarPetunjuk = []) {
  let dibuka = 0;
  const daftar = h('ol', { class: 'daftar-petunjuk' });
  const tombol = h('button', { class: 'tombol tombol-petunjuk', type: 'button', onclick: buka });

  function label() {
    return dibuka < daftarPetunjuk.length
      ? `💡 Petunjuk ${dibuka + 1} dari ${daftarPetunjuk.length}`
      : '💡 Semua petunjuk sudah dibuka';
  }

  function buka() {
    if (dibuka >= daftarPetunjuk.length) return;
    daftar.append(h('li', {}, daftarPetunjuk[dibuka]));
    dibuka += 1;
    tombol.textContent = label();
    tombol.disabled = dibuka >= daftarPetunjuk.length;
  }

  tombol.textContent = label();
  const el = daftarPetunjuk.length ? h('div', { class: 'petunjuk' }, tombol, daftar) : h('div');
  return { el, jumlah: () => dibuka };
}
