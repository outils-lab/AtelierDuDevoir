-- ═══════════════════════════════════════════════════════════
-- Salle d'arcade — à exécuter une seule fois dans Supabase
-- (Supabase → SQL Editor → New query → coller → Run)
-- Le script peut être relancé sans risque.
-- ═══════════════════════════════════════════════════════════

-- 1) Les fiches enregistrent désormais leurs questions ratées
alter table public.progression add column if not exists erreurs jsonb;

-- 2) La progression de chaque enfant dans la salle d'arcade
--    (le type de enfant_id suit automatiquement celui de enfants.id)
do $$
declare t text;
begin
  select data_type into t from information_schema.columns
   where table_schema = 'public' and table_name = 'enfants' and column_name = 'id';
  execute format(
    'create table if not exists public.arcade_profils (
       enfant_id %s primary key references public.enfants(id) on delete cascade,
       donnees jsonb not null default ''{}''::jsonb,
       series_max_jour integer not null default 3,
       maj_le timestamptz not null default now()
     )', t);
end $$;

-- 3) Sécurité : un parent ne voit et ne modifie que les profils de ses enfants
alter table public.arcade_profils enable row level security;
drop policy if exists "arcade_profils_parent" on public.arcade_profils;
create policy "arcade_profils_parent" on public.arcade_profils
  for all
  using (exists (select 1 from public.enfants e where e.id = arcade_profils.enfant_id and e.parent_id = auth.uid()))
  with check (exists (select 1 from public.enfants e where e.id = arcade_profils.enfant_id and e.parent_id = auth.uid()));

-- 4) Dictées : limite quotidienne à part (5 par défaut, réglable dans l'espace parent)
alter table public.arcade_profils add column if not exists dictees_max_jour integer not null default 5;
