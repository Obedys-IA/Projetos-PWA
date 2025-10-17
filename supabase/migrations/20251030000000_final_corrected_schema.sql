-- =================================================================
--  SCRIPT DE MIGRAÇÃO DEFINITIVO - CHECKNF GDM
--  Versão: 4.0
--  Data: 2025-10-30
--  Descrição: Este script redefine completamente o schema público,
--  corrigindo erros de sintaxe e dependência das versões anteriores.
--  Ele deve ser executado uma única vez para configurar a base.
-- =================================================================

-- =================================================================
--  ETAPA 1: LIMPEZA COMPLETA DO SCHEMA PÚBLICO
--  Remove objetos antigos para evitar conflitos.
-- =================================================================

-- Desabilitar RLS temporariamente para evitar erros de permissão na exclusão
ALTER TABLE IF EXISTS public.historico_acessos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notas_fiscais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fretistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usuarios DISABLE ROW LEVEL SECURITY;

-- Remover Triggers e Funções
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- Remover Políticas de Segurança (Policies)
DROP POLICY IF EXISTS "Administradores podem gerenciar tudo" ON public.historico_acessos;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON public.historico_acessos;
DROP POLICY IF EXISTS "Administradores e Colaboradores podem gerenciar notas" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Fretistas podem ver suas próprias notas" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Gerência pode ver todas as notas" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Habilitar acesso de leitura para todos autenticados" ON public.fretistas;
DROP POLICY IF EXISTS "Administradores podem gerenciar fretistas" ON public.fretistas;
DROP POLICY IF EXISTS "Habilitar acesso de leitura para todos autenticados" ON public.clientes;
DROP POLICY IF EXISTS "Administradores podem gerenciar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.usuarios;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os perfis" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir leitura para todos os usuários autenticados" ON public.usuarios;


-- Remover Tabelas (CASCADE remove objetos dependentes como constraints)
DROP TABLE IF EXISTS public.historico_acessos CASCADE;
DROP TABLE IF EXISTS public.notas_fiscais CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.fretistas CASCADE;


-- =================================================================
--  ETAPA 2: CRIAÇÃO DAS TABELAS COM ESTRUTURA CORRETA
-- =================================================================

-- Tabela de Fretistas
CREATE TABLE public.fretistas (
    placa TEXT NOT NULL PRIMARY KEY,
    nome TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.fretistas IS 'Armazena informações sobre os fretistas e suas placas.';

-- Tabela de Clientes
CREATE TABLE public.clientes (
    razao_social TEXT,
    cnpj TEXT NOT NULL PRIMARY KEY,
    nome_fantasia TEXT NOT NULL,
    rede TEXT,
    uf TEXT,
    vendedor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.clientes IS 'Armazena informações sobre os clientes.';

-- Tabela de Usuários (Perfis)
CREATE TABLE public.usuarios (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    tipo TEXT NOT NULL DEFAULT 'novo' CHECK (tipo IN ('administrador', 'colaborador', 'fretista', 'gerencia', 'novo')),
    fretista_placa TEXT REFERENCES public.fretistas(placa) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.usuarios IS 'Tabela de perfis que estende a tabela auth.users.';

-- Tabela de Notas Fiscais
CREATE TABLE public.notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_emissao DATE NOT NULL,
    hora_saida TEXT,
    numero_nf TEXT NOT NULL UNIQUE,
    nome_fantasia TEXT,
    rede TEXT,
    uf TEXT,
    vendedor TEXT,
    placa_veiculo TEXT,
    fretista TEXT,
    valor_nota NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE,
    situacao TEXT DEFAULT 'Dentro do Prazo',
    status TEXT NOT NULL DEFAULT 'Pendente',
    dias_atraso INTEGER,
    dias_vencer INTEGER,
    observacao TEXT,
    arquivo_url TEXT,
    usuario_registro_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    data_registro DATE DEFAULT CURRENT_DATE,
    hora_registro TEXT,
    usuario_edicao_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    data_edicao DATE,
    hora_edicao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_cnpj TEXT REFERENCES public.clientes(cnpj) ON DELETE SET NULL
);
COMMENT ON TABLE public.notas_fiscais IS 'Armazena todos os registros de notas fiscais.';

-- Tabela de Histórico de Acessos
CREATE TABLE public.historico_acessos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario_email TEXT,
    tela TEXT,
    acao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.historico_acessos IS 'Registra as ações e acessos dos usuários no sistema.';


-- =================================================================
--  ETAPA 3: POPULAÇÃO DAS TABELAS COM DADOS INICIAIS
-- =================================================================

-- Inserir dados na tabela de clientes
INSERT INTO public.clientes (razao_social, cnpj, nome_fantasia, rede, uf, vendedor) VALUES
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0315-65', 'Assai Juazeiro', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0477-20', 'Assai Petrolina', 'Assai', 'PE', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0407-18', 'Assai Sr Do Bonfim', 'Assai', 'BA', 'Antonio'),
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
('WMB SUPERMERCADOS DO BRASIL LTDA.', '00.063.960/0561-55', 'Sams Aracaju', 'Sams', 'SE', 'Vinicius');

-- Inserir dados na tabela de fretistas
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
('PJN1652', 'Roque');


-- =================================================================
--  ETAPA 4: CRIAÇÃO DE FUNÇÕES E TRIGGERS PARA SINCRONIZAÇÃO
-- =================================================================

-- Função para criar um perfil de usuário quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, telefone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.email,
    NEW.raw_user_meta_data->>'telefone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função acima após a criação de um usuário na tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para deletar um perfil de usuário quando o usuário é deletado da autenticação
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função de delete
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


-- =================================================================
--  ETAPA 5: HABILITAÇÃO DE RLS E CRIAÇÃO DE POLÍTICAS DE SEGURANÇA
-- =================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_acessos ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter o tipo de usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT tipo INTO role FROM public.usuarios WHERE id = auth.uid();
  RETURN role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para a tabela 'usuarios'
CREATE POLICY "Usuários podem ver e editar seus próprios perfis" ON public.usuarios
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Administradores podem gerenciar todos os perfis" ON public.usuarios
  FOR ALL USING (get_user_role() = 'administrador');

CREATE POLICY "Permitir leitura para todos os usuários autenticados" ON public.usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para a tabela 'clientes'
CREATE POLICY "Habilitar acesso de leitura para todos autenticados" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Administradores podem gerenciar clientes" ON public.clientes
  FOR ALL USING (get_user_role() = 'administrador');

-- Políticas para a tabela 'fretistas'
CREATE POLICY "Habilitar acesso de leitura para todos autenticados" ON public.fretistas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Administradores podem gerenciar fretistas" ON public.fretistas
  FOR ALL USING (get_user_role() = 'administrador');

-- Políticas para a tabela 'notas_fiscais'
CREATE POLICY "Administradores e Colaboradores podem gerenciar notas" ON public.notas_fiscais
  FOR ALL USING (get_user_role() IN ('administrador', 'colaborador'));

CREATE POLICY "Fretistas podem ver suas próprias notas" ON public.notas_fiscais
  FOR SELECT USING (fretista_placa = (SELECT fretista_placa FROM public.usuarios WHERE id = auth.uid()));

CREATE POLICY "Gerência pode ver todas as notas" ON public.notas_fiscais
  FOR SELECT USING (get_user_role() = 'gerencia');

-- Políticas para a tabela 'historico_acessos'
CREATE POLICY "Administradores podem gerenciar tudo" ON public.historico_acessos
  FOR ALL USING (get_user_role() = 'administrador');

CREATE POLICY "Usuários podem ver seu próprio histórico" ON public.historico_acessos
  FOR SELECT USING (usuario_id = auth.uid());


-- =================================================================
--  FIM DO SCRIPT
-- =================================================================
