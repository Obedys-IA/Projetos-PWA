/*
          # [Operação de Reset Completo do Schema]
          Este script irá apagar e recriar completamente as tabelas, funções e políticas de segurança do schema 'public' para o aplicativo CHECKNF-GDM.

          ## Query Description: [ATENÇÃO: Esta operação é DESTRUTIVA. Todas as tabelas (usuarios, clientes, fretistas, notas_fiscais, historico_acessos) e os dados nelas contidos serão APAGADOS e recriados do zero. Esta é uma medida necessária para corrigir inconsistências e garantir que a estrutura do banco de dados esteja perfeitamente alinhada com os requisitos da aplicação. Faça um backup se tiver dados importantes que não podem ser perdidos.]
          
          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Tabelas Afetadas: usuarios, clientes, fretistas, notas_fiscais, historico_acessos.
          - Funções Afetadas: handle_new_user, handle_user_delete.
          - Políticas RLS: Todas as políticas serão recriadas.
          
          ## Security Implications:
          - RLS Status: Será reativado em todas as tabelas.
          - Policy Changes: Sim, todas as políticas serão redefinidas para o padrão correto.
          - Auth Requirements: A estrutura depende da tabela auth.users do Supabase.
          
          ## Performance Impact:
          - Indexes: Índices e chaves primárias/estrangeiras serão recriados.
          - Triggers: Gatilhos de sincronização com auth.users serão recriados.
          - Estimated Impact: Nenhum impacto negativo de performance a longo prazo. A recriação garante uma estrutura otimizada.
          */

-- 1. LIMPEZA DO SCHEMA (DROPPING OBJECTS)
-- ============================================
-- Desabilitar RLS temporariamente para evitar erros de permissão ao dropar
alter table if exists public.notas_fiscais disable row level security;
alter table if exists public.usuarios disable row level security;
alter table if exists public.clientes disable row level security;
alter table if exists public.fretistas disable row level security;
alter table if exists public.historico_acessos disable row level security;

-- Dropar políticas existentes
drop policy if exists "Allow admin full access" on public.notas_fiscais;
drop policy if exists "Allow select for authenticated users" on public.notas_fiscais;
drop policy if exists "Fretistas can see their own notes" on public.notas_fiscais;
drop policy if exists "Allow admin full access" on public.usuarios;
drop policy if exists "Allow individual read access" on public.usuarios;
drop policy if exists "Allow individual update access" on public.usuarios;
drop policy if exists "Allow admin full access" on public.clientes;
drop policy if exists "Allow read access for authenticated users" on public.clientes;
drop policy if exists "Allow admin full access" on public.fretistas;
drop policy if exists "Allow read access for authenticated users" on public.fretistas;
drop policy if exists "Allow admin read access" on public.historico_acessos;

-- Dropar triggers e funções
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;
drop trigger if exists on_auth_user_deleted on auth.users;
drop function if exists public.handle_user_delete;

-- Dropar tabelas (em ordem de dependência reversa)
drop table if exists public.historico_acessos;
drop table if exists public.notas_fiscais;
drop table if exists public.usuarios;
drop table if exists public.clientes;
drop table if exists public.fretistas;


-- 2. CRIAÇÃO DAS TABELAS (TABLE CREATION)
-- ========================================

-- Tabela de Clientes
create table public.clientes (
    cnpj text primary key,
    razao_social text not null,
    nome_fantasia text not null,
    rede text,
    uf text,
    vendedor text,
    created_at timestamptz default now()
);
comment on table public.clientes is 'Armazena informações dos clientes.';

-- Tabela de Fretistas
create table public.fretistas (
    placa text primary key,
    nome text not null,
    created_at timestamptz default now()
);
comment on table public.fretistas is 'Armazena informações dos fretistas e suas placas.';

-- Tabela de Usuários (Perfis)
create table public.usuarios (
    id uuid primary key references auth.users(id) on delete cascade,
    nome text not null,
    email text not null unique,
    telefone text,
    tipo text not null default 'novo'::text check (tipo in ('administrador', 'colaborador', 'fretista', 'gerencia', 'novo')),
    fretista_placa text references public.fretistas(placa) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
comment on table public.usuarios is 'Tabela de perfis que estende a auth.users.';

-- Tabela de Notas Fiscais
create table public.notas_fiscais (
    id uuid primary key default gen_random_uuid(),
    data_emissao date not null,
    hora_saida text,
    numero_nf text not null unique,
    nome_fantasia text not null,
    rede text,
    uf text,
    vendedor text,
    placa_veiculo text,
    fretista text,
    valor_nota numeric(10, 2) not null,
    data_vencimento date,
    situacao text default 'Dentro do Prazo'::text,
    status text default 'Pendente'::text,
    dias_atraso integer,
    dias_vencer integer,
    observacao text,
    arquivo_url text,
    usuario_registro text,
    data_registro date default current_date,
    hora_registro text,
    usuario_edicao text,
    data_edicao date,
    hora_edicao text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
comment on table public.notas_fiscais is 'Armazena todos os registros de notas fiscais.';

-- Tabela de Histórico de Acessos
create table public.historico_acessos (
    id bigint generated by default as identity primary key,
    usuario_id uuid references public.usuarios(id) on delete set null,
    usuario text,
    data date not null,
    hora text not null,
    tela text not null,
    acao text not null,
    created_at timestamptz default now()
);
comment on table public.historico_acessos is 'Registra as ações dos usuários no sistema.';

-- 3. POPULAR DADOS INICIAIS (DATA SEEDING)
-- =========================================
-- Inserir dados na tabela de clientes
insert into public.clientes (razao_social, cnpj, nome_fantasia, rede, uf, vendedor) values
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0315-65', 'Assai Juazeiro', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0477-20', 'Assai Petrolina', 'Assai', 'PE', 'Antonio'),
('ATACADAO S.A.', '75.315.333/0244-74', 'Atac Petrolina', 'Atacadão', 'PE', 'Antonio'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0012-00', 'Atakarejo Alagoinha', 'Atakarejo', 'BA', 'Ricardo'),
('SUPERMERCADO BOMBOM LTDA', '04.136.442/0002-00', 'Sup Bombom Lagarto', 'Bombom', 'SE', 'Vinicius'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0007-28', 'Cdp Alagoinhas Loja 11', 'Cesta Do Povo', 'BA', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0258-28', 'Mateus Conceicao Do Coite', 'Mateus', 'BA', 'Antonio');
-- (Adicione todos os outros clientes aqui para manter o script conciso)

-- Inserir dados na tabela de fretistas
insert into public.fretistas (placa, nome) values
('BRY9A41', 'Anderson'),
('LST7H05', 'Andre'),
('QKY0D59', 'Danilo'),
('JOP0J97', 'Eden'),
('PJF6530', 'Ednilson'),
('OUO2501', 'Elvis'),
('OZM8C48', 'Elvis'),
('OKV2567', 'Renato');
-- (Adicione todos os outros fretistas aqui)

-- 4. TRIGGERS E FUNÇÕES (FUNCTIONS & TRIGGERS)
-- ==============================================
-- Função para criar um perfil de usuário ao se registrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email, tipo)
  values (new.id, new.raw_user_meta_data->>'nome', new.email, 'novo');
  return new;
end;
$$;

-- Trigger para chamar a função acima quando um novo usuário é criado
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função para deletar perfil de usuário quando ele é deletado da autenticação
create or replace function public.handle_user_delete()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.usuarios where id = old.id;
  return old;
end;
$$;

-- Trigger para chamar a função de deleção
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_user_delete();

-- Helper function to get user role
create or replace function public.get_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select tipo from public.usuarios where id = auth.uid();
$$;

-- 5. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY)
-- ===============================================

-- Habilitar RLS em todas as tabelas
alter table public.usuarios enable row level security;
alter table public.clientes enable row level security;
alter table public.fretistas enable row level security;
alter table public.notas_fiscais enable row level security;
alter table public.historico_acessos enable row level security;

-- Políticas para 'usuarios'
create policy "Allow admin full access" on public.usuarios for all to authenticated using (get_user_role() = 'administrador') with check (get_user_role() = 'administrador');
create policy "Allow individual read access" on public.usuarios for select to authenticated using (auth.uid() = id);
create policy "Allow individual update access" on public.usuarios for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Políticas para 'clientes' e 'fretistas'
create policy "Allow admin full access" on public.clientes for all to authenticated using (get_user_role() = 'administrador') with check (get_user_role() = 'administrador');
create policy "Allow read access for authenticated users" on public.clientes for select to authenticated using (true);

create policy "Allow admin full access" on public.fretistas for all to authenticated using (get_user_role() = 'administrador') with check (get_user_role() = 'administrador');
create policy "Allow read access for authenticated users" on public.fretistas for select to authenticated using (true);

-- Políticas para 'notas_fiscais'
create policy "Allow admin full access" on public.notas_fiscais for all to authenticated using (get_user_role() = 'administrador') with check (get_user_role() = 'administrador');
create policy "Allow select for colaborador/gerencia" on public.notas_fiscais for select to authenticated using (get_user_role() in ('colaborador', 'gerencia'));
create policy "Fretistas can see their own notes" on public.notas_fiscais for select to authenticated using (
  get_user_role() = 'fretista'
  and placa_veiculo = (select fretista_placa from public.usuarios where id = auth.uid())
);
create policy "Allow insert for admin/colaborador" on public.notas_fiscais for insert to authenticated with check (get_user_role() in ('administrador', 'colaborador'));
create policy "Allow update for admin/colaborador" on public.notas_fiscais for update to authenticated using (get_user_role() in ('administrador', 'colaborador'));
create policy "Allow delete for admin" on public.notas_fiscais for delete to authenticated using (get_user_role() = 'administrador');

-- Políticas para 'historico_acessos'
create policy "Allow admin read access" on public.historico_acessos for select to authenticated using (get_user_role() = 'administrador');
create policy "Allow insert for all users" on public.historico_acessos for insert to authenticated with check (true);

-- Finalização
comment on function public.handle_new_user is 'Cria um perfil de usuário na tabela public.usuarios quando um novo usuário se registra.';
comment on function public.handle_user_delete is 'Deleta um perfil de usuário quando o usuário é removido da autenticação.';
