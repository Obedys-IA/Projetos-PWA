/*
          # [SCHEMA CORRECTION]
          [This script rebuilds the database schema, fixing permission issues and adding proper triggers for user management.]

          ## Query Description: [This script will drop and recreate all application tables (notas_fiscais, clientes, fretistas, historico_acessos) to ensure a clean state. It fixes the public.usuarios table creation to respect Supabase's auth ownership and adds a trigger to handle user deletion, ensuring data consistency. RLS policies are re-applied correctly.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Tables Dropped: historico_acessos, notas_fiscais, fretistas, clientes
          - Tables Created: clientes, fretistas, usuarios, notas_fiscais, historico_acessos
          - Functions Created: handle_new_user, handle_user_delete
          - Triggers Created: on_auth_user_created, on_auth_user_deleted
          
          ## Security Implications:
          - RLS Status: Enabled on all tables.
          - Policy Changes: Yes, all policies are redefined for security.
          - Auth Requirements: Supabase Auth integration is corrected.
          
          ## Performance Impact:
          - Indexes: Primary keys and Foreign keys are indexed.
          - Triggers: Adds triggers for user creation and deletion.
          - Estimated Impact: Low, operations are efficient.
          */

-- 1. Drop dependent tables first
DROP TABLE IF EXISTS public.historico_acessos;
DROP TABLE IF EXISTS public.notas_fiscais;

-- Drop tables that don't depend on others
DROP TABLE IF EXISTS public.fretistas;
DROP TABLE IF EXISTS public.clientes;

-- DO NOT DROP public.usuarios. The trigger will manage it.
-- If it exists from a failed migration, we'll handle it.

-- 2. Create tables

-- Tabela Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    razao_social TEXT NOT NULL,
    cnpj TEXT PRIMARY KEY,
    nome_fantasia TEXT NOT NULL,
    rede TEXT,
    uf TEXT,
    vendedor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.clientes IS 'Armazena informações sobre os clientes.';

-- Tabela Fretistas
CREATE TABLE IF NOT EXISTS public.fretistas (
    placa TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.fretistas IS 'Armazena informações sobre os fretistas e suas placas.';

-- Tabela Usuários (Profile Table)
-- This table is linked to auth.users and should not be dropped carelessly.
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    tipo TEXT NOT NULL DEFAULT 'novo',
    fretista_placa TEXT REFERENCES public.fretistas(placa) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.usuarios IS 'Tabela de perfis que estende auth.users.';

-- Tabela Notas Fiscais
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_emissao DATE NOT NULL,
    hora_saida TEXT,
    numero_nf TEXT NOT NULL UNIQUE,
    nome_fantasia TEXT NOT NULL,
    rede TEXT,
    uf TEXT,
    vendedor TEXT,
    placa_veiculo TEXT,
    fretista TEXT,
    valor_nota NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    situacao TEXT DEFAULT 'Dentro do Prazo',
    status TEXT DEFAULT 'Pendente',
    dias_atraso INTEGER,
    dias_vencer INTEGER,
    observacao TEXT,
    arquivo_url TEXT,
    usuario_registro TEXT,
    data_registro DATE DEFAULT CURRENT_DATE,
    hora_registro TEXT,
    usuario_edicao TEXT,
    data_edicao DATE,
    hora_edicao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.notas_fiscais IS 'Armazena todos os registros das notas fiscais.';

-- Tabela Histórico de Acessos
CREATE TABLE IF NOT EXISTS public.historico_acessos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario TEXT,
    data DATE NOT NULL,
    hora TEXT NOT NULL,
    tela TEXT NOT NULL,
    acao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.historico_acessos IS 'Registra logs de ações dos usuários no sistema.';


-- 3. Create functions and triggers for user sync

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, telefone, tipo)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    'novo' -- Default role for new users
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Function to delete profile when a user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Trigger to call the function on user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_user_delete();

-- 4. Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_acessos ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Policy: usuarios
DROP POLICY IF EXISTS "Allow individual read access" ON public.usuarios;
CREATE POLICY "Allow individual read access" ON public.usuarios
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin full access" ON public.usuarios;
CREATE POLICY "Allow admin full access" ON public.usuarios
FOR ALL USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador');

-- Policy: clientes
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.clientes;
CREATE POLICY "Allow authenticated read access" ON public.clientes
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin full access" ON public.clientes;
CREATE POLICY "Allow admin full access" ON public.clientes
FOR ALL USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador');

-- Policy: fretistas
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.fretistas;
CREATE POLICY "Allow authenticated read access" ON public.fretistas
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin full access" ON public.fretistas;
CREATE POLICY "Allow admin full access" ON public.fretistas
FOR ALL USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador');

-- Policy: notas_fiscais
DROP POLICY IF EXISTS "Allow admin and colaborador full access" ON public.notas_fiscais;
CREATE POLICY "Allow admin and colaborador full access" ON public.notas_fiscais
FOR ALL USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) IN ('administrador', 'colaborador'));

DROP POLICY IF EXISTS "Allow gerencia read access" ON public.notas_fiscais;
CREATE POLICY "Allow gerencia read access" ON public.notas_fiscais
FOR SELECT USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'gerencia');

DROP POLICY IF EXISTS "Allow fretista read access to their own" ON public.notas_fiscais;
CREATE POLICY "Allow fretista read access to their own" ON public.notas_fiscais
FOR SELECT USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'fretista' AND placa_veiculo = (SELECT fretista_placa FROM public.usuarios WHERE id = auth.uid()));

-- Policy: historico_acessos
DROP POLICY IF EXISTS "Allow admin read access" ON public.historico_acessos;
CREATE POLICY "Allow admin read access" ON public.historico_acessos
FOR SELECT USING ((SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador');

DROP POLICY IF EXISTS "Allow system to insert" ON public.historico_acessos;
CREATE POLICY "Allow system to insert" ON public.historico_acessos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 6. Populate data

-- Clientes
INSERT INTO public.clientes (razao_social, cnpj, nome_fantasia, rede, uf, vendedor) VALUES
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0315-65', 'Assai Juazeiro', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0477-20', 'Assai Petrolina', 'Assai', 'PE', 'Antonio'),
('ATACADAO S.A.', '75.315.333/0244-74', 'Atac Petrolina', 'Atacadão', 'PE', 'Antonio'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0012-00', 'Atakarejo Alagoinha', 'Atakarejo', 'BA', 'Ricardo'),
('SUPERMERCADO BOMBOM LTDA', '04.136.442/0002-00', 'Sup Bombom Lagarto', 'Bombom', 'SE', 'Vinicius'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0007-28', 'Cdp Alagoinhas Loja 11', 'Cesta Do Povo', 'BA', 'Ricardo'),
('DELI E CIA DELICATESSEN LTDA', '08.957.752/0001-57', 'Deli E Cia Graca', 'Deli E Cia', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0011-21', 'Dist Sao Roque Calumbi', 'Dist Sao Roque', 'BA', 'Ricardo'),
('MULTICOM ATACADO E VAREJO S/A', '28.548.486/0024-02', 'Economart Feira De Santana', 'Economart', 'BA', 'Ricardo'),
('JOSE ORICELIO FURTADO ME', '08.473.979/0001-27', 'Feirao Das Frutas Atras Da Banca', 'Feirao Das Frutas', 'PE', 'Antonio'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0194-23', 'GBarbosa Juazeiro Centro', 'G Barbosa', 'BA', 'Antonio'),
('SUPERMERCADO JABOTIANA LTDA', '50.747.044/0001-58', 'Hiper Carne Jabotiana', 'Hipercarnes', 'SE', 'Vinicius'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0033-33', 'Hiper Ideal Cd', 'Hiperideal', 'BA', 'Ricardo'),
('LWA COMERCIAL LTDA', '31.432.054/0005-83', 'Massimo - Centro', 'Massimo', 'SE', 'Vinicius'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0258-28', 'Mateus Conceicao Do Coite', 'Mateus', 'BA', 'Antonio'),
('JUNIOR E OLIVEIRA LTDA', '09.506.050/0002-09', 'Armazem Cecilio Mota', 'Outros', 'BA', 'Antonio'),
('PERINI COMERCIAL DE ALIMENTOS LTDA', '11.965.515/0008-19', 'Perini Graca', 'Perini', 'BA', 'Vinicius'),
('COAGELI - COMERCIAL DE GENEROS ALIMENTICIOS LTDA', '07.348.911/0002-34', 'Coageli Lj 2 Centro', 'Redemix', 'BA', 'Vinicius'),
('WMB SUPERMERCADOS DO BRASIL LTDA.', '00.063.960/0561-55', 'Sams Aracaju', 'Sams', 'SE', 'Vinicius')
ON CONFLICT (cnpj) DO NOTHING;

-- Fretistas
INSERT INTO public.fretistas (placa, nome) VALUES
('BRY9A41', 'Anderson'),
('LST7H05', 'Andre'),
('QKY0D59', 'Danilo'),
('JOP0J97', 'Eden'),
('PJF6530', 'Ednilson'),
('OUO2501', 'Elvis'),
('PJA3D26', 'Gustavo'),
('PLK2C22', 'Josenilson'),
('OSF8808', 'Natal'),
('JQB8F32', 'Paulo Noel'),
('OKV2567', 'Renato'),
('PJN1652', 'Roque')
ON CONFLICT (placa) DO NOTHING;
