-- =====================================================================
-- FungsiKu — skema database Supabase
-- Jalankan seluruh isi file ini di Supabase → SQL Editor → Run.
-- Hanya server Flask (service_role key) yang boleh membaca/menulis.
-- =====================================================================

create table if not exists public.kelas (
  kode_kelas    text primary key,
  nama_sekolah  text,
  dibuat_pada   timestamptz not null default now()
);

create table if not exists public.siswa (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null check (char_length(nama) between 1 and 40),
  kode_kelas   text not null references public.kelas(kode_kelas),
  dibuat_pada  timestamptz not null default now()
);

create table if not exists public.progres_modul (
  siswa_id          uuid not null references public.siswa(id) on delete cascade,
  modul             smallint not null check (modul between 0 and 6),
  langkah_terakhir  smallint not null default 0,
  selesai           boolean not null default false,
  skor_kuis         smallint check (skor_kuis between 0 and 100),
  updated_at        timestamptz not null default now(),
  primary key (siswa_id, modul)
);

create table if not exists public.jawaban (
  id            bigint generated always as identity primary key,
  id_klien      text unique,          -- dibuat di HP, mencegah data ganda saat dikirim ulang
  siswa_id      uuid not null references public.siswa(id) on delete cascade,
  modul         smallint not null check (modul between 0 and 6),
  soal_id       text not null,
  jenis         text not null check (jenis in ('latihan', 'kuis')),
  jawaban       jsonb,
  benar         boolean,
  percobaan_ke  smallint,
  jumlah_hint   smallint,
  durasi_detik  integer,
  dibuat_pada   timestamptz not null default now()
);

create table if not exists public.skala_beban (
  id           bigint generated always as identity primary key,
  id_klien     text unique,
  siswa_id     uuid not null references public.siswa(id) on delete cascade,
  modul        smallint not null check (modul between 0 and 6),
  skor         smallint not null check (skor between 1 and 9),
  penjelasan   text check (char_length(penjelasan) <= 500),
  dibuat_pada  timestamptz not null default now()
);

create index if not exists idx_siswa_kelas on public.siswa(kode_kelas);
create index if not exists idx_jawaban_siswa on public.jawaban(siswa_id, modul);
create index if not exists idx_skala_siswa on public.skala_beban(siswa_id, modul);

-- Row Level Security: aktif TANPA kebijakan publik.
-- Artinya tidak ada yang bisa mengakses tabel langsung dari internet;
-- hanya service_role (server Flask) yang melewati RLS.
alter table public.kelas          enable row level security;
alter table public.siswa          enable row level security;
alter table public.progres_modul  enable row level security;
alter table public.jawaban        enable row level security;
alter table public.skala_beban    enable row level security;

-- Contoh kode kelas (ubah sesuai sekolah uji coba).
insert into public.kelas (kode_kelas, nama_sekolah) values
  ('DEMO', 'Kelas percobaan'),
  ('9A-UJI', 'SMP uji coba')
on conflict (kode_kelas) do nothing;
