-- =================================================================
--  DEFINITIVE SCHEMA RESET SCRIPT FOR CHECKNF-GDM
--  Version: 1.0
--  Date: 2025-11-01
--
--  Description:
--  This script performs a complete and safe reset of the public
--  schema. It drops all tables, functions, and triggers in the
--  correct order to avoid dependency errors, then rebuilds the
--  entire database structure, including tables, data, functions,
--  triggers, and RLS policies.
--
--  THIS SCRIPT IS DESTRUCTIVE AND WILL WIPE ALL EXISTING DATA
--  IN THE MANAGED TABLES.
-- =================================================================

-- =================================================================
--  SECTION 1: TEARDOWN
--  Drop all existing objects in the correct dependency order.
-- =================================================================

-- Drop triggers from auth.users first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_deleted_user();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Drop tables using CASCADE to handle dependencies like policies
DROP TABLE IF EXISTS public.historico_acessos CASCADE;
DROP TABLE IF EXISTS public.notas_fiscais CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.fretistas CASCADE;


-- =================================================================
--  SECTION 2: TABLE CREATION
--  Create all tables in the correct dependency order.
-- =================================================================

-- Tabela de Fretistas (sem dependências)
CREATE TABLE public.fretistas (
    placa TEXT PRIMARY KEY,
    nome TEXT NOT NULL
);

-- Tabela de Clientes (sem dependências)
CREATE TABLE public.clientes (
    cnpj TEXT PRIMARY KEY,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT NOT NULL,
    rede TEXT,
    uf TEXT,
    vendedor TEXT
);

-- Tabela de Usuários (depende de auth.users e fretistas)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    tipo TEXT NOT NULL DEFAULT 'novo' CHECK (tipo IN ('administrador', 'colaborador', 'fretista', 'gerencia', 'novo')),
    fretista_placa TEXT REFERENCES public.fretistas(placa) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Notas Fiscais (depende de usuarios e clientes)
CREATE TABLE public.notas_fiscais (
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
    data_vencimento DATE,
    situacao TEXT DEFAULT 'Dentro do Prazo',
    status TEXT NOT NULL DEFAULT 'Pendente',
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

-- Tabela de Histórico de Acessos (depende de usuarios)
CREATE TABLE public.historico_acessos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    usuario TEXT,
    data DATE NOT NULL,
    hora TEXT NOT NULL,
    tela TEXT NOT NULL,
    acao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =================================================================
--  SECTION 3: DATA SEEDING
--  Populate initial data for clientes and fretistas.
-- =================================================================

INSERT INTO public.fretistas (placa, nome) VALUES
('BRY9A41', 'Anderson'),
('LST7H05', 'Andre'),
('QKY0D59', 'Danilo'),
('JOP0J97', 'Eden'),
('PJF6530', 'Ednilson'),
('OUO2501', 'Elvis'),
('OZM8C48', 'Elvis'),
('OLA8363', 'Elvis'),
('OEP9E84', 'Elvis'),
('OVS8H29', 'Elvis'),
('PJU8H76', 'Elvis'),
('PJA3D26', 'Gustavo'),
('PJS5H00', 'Gustavo'),
('LRC9H40', 'Danilo'),
('PLK2C22', 'Josenilson'),
('OSF8808', 'Natal'),
('JQB8F32', 'Paulo Noel'),
('JPX8747', 'Paulo Noel'),
('PEF3B50', 'Paulo Noel'),
('NVM5109', 'Paulo Noel'),
('DVA3G04', 'Paulo Noel'),
('PEY9D15', 'Paulo Noel'),
('PJI2I77', 'Paulo Noel'),
('ORI2G75', 'Paulo Noel'),
('JOU8522', 'Paulo Noel'),
('NZK8A92', 'Paulo Noel'),
('IAD5528', 'Paulo Noel'),
('OKV2567', 'Renato'),
('NYL1B84', 'Renato'),
('NZY7881', 'Renato'),
('PJN1652', 'Roque'),
('OES3C15', 'Danilo');

INSERT INTO public.clientes (razao_social, cnpj, nome_fantasia, rede, uf, vendedor) VALUES
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0315-65', 'Assai Juazeiro', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0477-20', 'Assai Petrolina', 'Assai', 'PE', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0407-18', 'Assai Sr Do Bonfim', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0470-54', 'Assai Barris', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0483-79', 'Assai Cabula', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0361-09', 'Assai Calcada', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0383-06', 'Assai Camacari', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0406-37', 'Assai Cidade Nova', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA', '06.057.223/0314-84', 'Assai Feira Sobradinho', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0541-82', 'Assai Paralela', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0518-33', 'Assai Inacio Barbosa', 'Assai', 'SE', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0313-01', 'Assai Jequie', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0324-56', 'Assai Lauro De Freitas', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0552-35', 'Assai Luis Anselmo', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0424-19', 'Assai Mussurunga', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0299-00', 'Assai Norte', 'Assai', 'SE', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0322-94', 'Assai Paripe', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0381-44', 'Assai Pau Da Lima', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0364-43', 'Assai Porto', 'Assai', 'SE', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0478-01', 'Assai Socorro', 'Assai', 'SE', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0404-75', 'Assai Sul', 'Assai', 'SE', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0451-91', 'Assai Tomba', 'Assai', 'BA', 'Nixon'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0484-50', 'Assai Vasco Da Gama', 'Assai', 'BA', 'Nixon'),
('ATACADAO S.A.', '75.315.333/0244-74', 'Atac Petrolina', 'Atacadão', 'PE', 'Antonio'),
('ATACADAO S.A', '75.315.333/0165-36', 'Atac Camacari', 'Atacadão', 'BA', 'Nixon'),
('ATACADAO S.A', '75.315.333/0086-06', 'Atac Sao Bernardo', 'Atacadão', 'BA', 'Nixon'),
('WMS SUPERMERCADOS DO BRASIL LTDA.', '93.209.765/0500-50', 'Maxxi Camaçari', 'Atacadão', 'BA', 'Nixon'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0012-00', 'Atakarejo Alagoinha', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0044-98', 'Atakarejo Aracaju', 'Atakarejo', 'SE', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0019-87', 'Atakarejo Baixa De Quintas', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0002-39', 'Atakarejo Boca Do Rio', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0013-91', 'Atakarejo Camacari', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0021-00', 'Atakarejo Cd Simoes Filho', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0050-36', 'Atakarejo Cd Vitoria Da Conquista', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0032-54', 'Atakarejo Vasco', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0016-34', 'Atakarejo Feira De Santana', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DIST DE ALIMENTOS E BEBIDAS EI', '73.849.952/0001-58', 'Atakarejo Iguatemi', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0034-16', 'Atakarejo Ilha', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO ITACIMIRIM', '73.849.952/0031-73', 'Atakarejo Itacimirim', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DIST DE ALIMENTOS E BEBIDAS EI', '73.849.952/0003-10', 'Atakarejo Lauro', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0029-59', 'Atakarejo Patamares', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0039-20', 'Atakarejo Pinto De Aguiar', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0015-53', 'Atakarejo Pernambues', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DIST DE ALIMENTOS E BEBIDAS', '73.849.952/0009-05', 'Atakarejo Piata', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0017-15', 'Atakarejo Salvador', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0047-30', 'Atakarejo Sao Goncalo Dos Campos', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0014-72', 'Atakarejo Simoes Filho', 'Atakarejo', 'BA', 'Ricardo'),
('ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A', '73.849.952/0036-88', 'Atakarejo Vitoria Da Conquista', 'Atakarejo', 'BA', 'Ricardo'),
('SUPERMERCADO BOMBOM LTDA', '04.136.442/0002-00', 'Sup Bombom Lagarto', 'Bombom', 'SE', 'Vinicius'),
('SUPERMERCADO BOMBOM LTDA', '04.136.442/0001-10', 'Sup Bombom Estancia', 'Bombom', 'SE', 'Vinicius'),
('SUPERMERCADO BOMBOM LTDA', '04.136.442/0003-82', 'Sup Bombom Aracaju', 'Bombom', 'SE', 'Vinicius'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0007-28', 'Cdp Alagoinhas Loja 11', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0002-13', 'Cdp Armacao Stiep Loja 14', 'Cesta Do Povo', 'BA', 'Ricardo'),
('SUPERMERCADO BOCA DO RIO EIRELI', '31.977.294/0001-30', 'Cdp Boca Do Rio Loja 07', 'Cesta Do Povo', 'BA', 'Ricardo'),
('SUPERMERCADO CATU LTDA', '39.869.867/0001-13', 'Cdp Catu Loja 12', 'Cesta Do Povo', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE ALIMENTOS NORTE LTDA', '07.803.111/0001-85', 'Cdp Cd Monte Libano', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0016-19', 'Cdp Centro - Sede', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0018-80', 'Cdp Centro Dias Davila', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0017-08', 'Cdp Genaro Dias Davila', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CESTA DO POVO RODOVIARIA', '43.941.941/0013-76', 'Cdp Rodoviaria Loja 17', 'Cesta Do Povo', 'BA', 'Ricardo'),
('SETE PORTAS SUPERMERCADOS LTDA', '36.613.171/0001-33', 'Cdp Sete Portas Loja 09', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0006-47', 'Cdp Super Centro Mata Loja 10', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0014-57', 'Cesta Do Povo Boca Do Rio', 'Cesta Do Povo', 'BA', 'Ricardo'),
('CDP SUPERMERCADOS LTDA', '43.941.941/0004-85', 'Cesta Do Povo Brotas', 'Cesta Do Povo', 'BA', 'Ricardo'),
('DELI E CIA DELICATESSEN LTDA', '08.957.752/0001-57', 'Deli E Cia Graca', 'Deli E Cia', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0011-21', 'Dist Sao Roque Calumbi', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0013-93', 'Dist Sao Roque Conceicao', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0004-00', 'Dist Sao Roque Mangabeira', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0005-83', 'Dist Sao Roque Sim', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS S', '03.705.630/0001-50', 'Dist Sao Roque Sta Monica', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0014-74', 'Sao Roque Artemia Pires', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0015-55', 'São Roque Av Getulio Vargas', 'Dist Sao Roque', 'BA', 'Ricardo'),
('DISTRIBUIDORA DE PRODUTOS ALIMENTICIOS SAO ROQUE LTDA', '03.705.630/0002-30', 'São Roque Castro Alves', 'Dist Sao Roque', 'BA', 'Ricardo'),
('MULTICOM ATACADO E VAREJO S/A', '28.548.486/0024-02', 'Economart Feira De Santana', 'Economart', 'BA', 'Ricardo'),
('MULTICOM ATACADO E VAREJO S/A', '28.548.486/0021-60', 'Economart Jequie', 'Economart', 'BA', 'Ricardo'),
('MULTICOM ATACADO E VAREJO S/A', '28.548.486/0014-30', 'Economart Vitoria Da Conquista', 'Economart', 'BA', 'Ricardo'),
('JOSE ORICELIO FURTADO ME', '08.473.979/0001-27', 'Feirao Das Frutas Atras Da Banca', 'Feirao Das Frutas', 'PE', 'Antonio'),
('HORTIFRUTI FEIRAO DAS FRUTAS LTDA', '08.473.979/0002-08', 'Feirao Das Frutas Maria Auxiliadora', 'Feirao Das Frutas', 'PE', 'Antonio'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0194-23', 'GBarbosa Juazeiro Centro', 'G Barbosa', 'BA', 'Antonio'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0182-90', 'GBarbosa Juazeiro Santo Antonio', 'G Barbosa', 'BA', 'Antonio'),
('CENCOSUD BRASIL COMERCIAL S.A', '39.346.861/0103-96', 'GBarbosa Farolandia', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0116-00', 'GBarbosa - Rio Mar', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0033-49', 'GBarbosa Francisco Porto', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0138-16', 'GBarbosa Iguatemi', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0023-77', 'GBarbosa J. C. De Araujo', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0048-25', 'Gbarbosa 015 Feira De Santana', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0070-93', 'Gbarbosa 016 Feira De Santana', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0047-44', 'Gbarbosa 017 Feira De Santana', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0059-88', 'Gbarbosa 029 Brotas', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0078-40', 'Gbarbosa 035 Costa Azul', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0056-35', 'Gbarbosa 037 Alagoinhas', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0052-01', 'Gbarbosa 038 Alagoinhas', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0111-04', 'Gbarbosa 074 Sobradinho', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0113-68', 'Gbarbosa 076 Tomba', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0143-83', 'Gbarbosa 108 Lauro De Freitas', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0144-64', 'Gbarbosa 112 Vitoria Da Conquista', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0364-33', 'Gbarbosa Cd Bahia', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0001-61', 'Gbarbosa Cd Sergipe', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0072-55', 'Gbarbosa Hiper Sul', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A', '39.346.861/0040-78', 'Gbarbosa Jardins', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0451-81', 'Gbarbosa Luzia', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL S.A.', '39.346.861/0043-10', 'Gbarbosa Sao Cristovao', 'G Barbosa', 'SE', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0196-95', 'Gbarbosa 139 Vitoria Da Conquista', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0415-18', 'Gbarbosa 274 Guarajuba', 'G Barbosa', 'BA', 'Vinicius'),
('CENCOSUD BRASIL COMERCIAL SA', '39.346.861/0432-19', 'Gbarbosa 302 Horto Bela Vista', 'G Barbosa', 'BA', 'Vinicius'),
('SUPERMERCADO JABOTIANA LTDA', '50.747.044/0001-58', 'Hiper Carne Jabotiana', 'Hipercarnes', 'SE', 'Vinicius'),
('HIPER CARNE BARRA LTDA', '44.069.669/0001-05', 'Hiper Carnes Barra Dos Coqueiros', 'Hipercarnes', 'SE', 'Vinicius'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0033-33', 'Hiper Ideal Cd', 'Hiperideal', 'BA', 'Ricardo'),
('SERRANA EMPREENDIMENTOS E PARTICIPACOES LTDA', '02.212.937/0027-95', 'Hiperideal - Vitoria', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0036-86', 'Hiperideal Amazonas', 'Hiperideal', 'BA', 'Ricardo'),
('SERRANA EMPREENDIMENTOS E PARTICIPACOES LTDA', '02.212.937/0018-02', 'Hiperideal Armacao Av Simon', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0011-28', 'Hiperideal Barra', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0008-22', 'Hiperideal Buraquinho', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0032-52', 'Hiperideal Caminho Das Arvores', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0019-85', 'Hiperideal Canela', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0042-24', 'Hiperideal Feira De Santana', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0010-47', 'Hiperideal Graca', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0030-90', 'Hiperideal Guarajuba', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0034-14', 'Hiperideal Horto Vasco Da Gama', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0023-61', 'Hiperideal Itaigara', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0025-23', 'Hiperideal Jardim Apipema', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0022-80', 'Hiperideal Jardins ACM', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0026-04', 'Hiperideal Lj Piata Orlando Gomes', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0029-57', 'Hiperideal Orla Octavio Mang.', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0028-76', 'Hiperideal Parque Shopping Lauro', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0031-71', 'Hiperideal Patamares Ibirapitanga', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0013-90', 'Hiperideal Patamares Luis Viana', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0007-41', 'Hiperideal Piata Otavio Mangabeira', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0024-42', 'Hiperideal Pituba Manoel Dias', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0014-70', 'Hiperideal Praia Do Forte', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0012-09', 'Hiperideal Pituba Rua Ceara', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0017-13', 'Hiperideal Stella Capitao Melo', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0006-60', 'Hiperideal Stella Missionario Otto', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0009-03', 'Hiperideal Tororo', 'Hiperideal', 'BA', 'Ricardo'),
('HIPERIDEAL EMPREENDIMENTOS LTDA', '02.212.937/0021-08', 'Hiperideal Vila Laura', 'Hiperideal', 'BA', 'Ricardo'),
('LWA COMERCIAL LTDA', '31.432.054/0005-83', 'Massimo - Centro', 'Massimo', 'SE', 'Vinicius'),
('LWA COMERCIAL LTDA', '31.432.054/0002-30', 'Massimo Farolandia', 'Massimo', 'SE', 'Vinicius'),
('LWA COMERCIAL LTDA', '31.432.054/0001-50', 'Massimo Luzia', 'Massimo', 'SE', 'Vinicius'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0258-28', 'Mateus Conceicao Do Coite', 'Mateus', 'BA', 'Antonio'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0246-94', 'Mateus Jacobina', 'Mateus', 'BA', 'Antonio'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0231-08', 'Mateus Juazeiro', 'Mateus', 'BA', 'Antonio'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0244-22', 'Mateus Conquista', 'Mateus', 'BA', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0248-56', 'Mateus Porto Seguro', 'Mateus', 'BA', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0240-07', 'Mateus Teixeira De Freitas', 'Mateus', 'BA', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0325-22', 'Mateus Aracaju Santa Monica', 'Mateus', 'SE', 'Ricardo'),
('ARMAZEM MATEUS S.A.', '23.439.441/0058-25', 'Mateus Cd - Feira De Santana/Ba', 'Mateus', 'BA', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0271-03', 'Mateus Da Gloria', 'Mateus', 'SE', 'Ricardo'),
('MATEUS SUPERMERCADOS S.A.', '03.995.515/0237-01', 'Mateus Jose Conrado De Araujo', 'Mateus', 'SE', 'Ricardo'),
('JUNIOR E OLIVEIRA LTDA', '09.506.050/0002-09', 'Armazem Cecilio Mota', 'Outros', 'BA', 'Antonio'),
('BONTEMPO SUPERMERCADO LTDA', '00.889.627/0001-45', 'Bontempo Supermercados', 'Outros', 'PE', 'Antonio'),
('RF SUPERMERCADO BRASIL LTDA', '09.081.924/0005-68', 'Centro De Distribuicao Brasil', 'Outros', 'BA', 'Antonio'),
('FRUTOS DA TERRA MINIMERCADO LTDA - ME', '05.370.733/0001-31', 'Frutos Da Terra', 'Outros', 'PE', 'Antonio'),
('JNS COMERCIO DE PRODUTOS ALIMENTICIOS LTDA', '24.333.585/0001-20', 'Mercadinho Economico', 'Outros', 'PE', 'Antonio'),
('PERBONI S/A', '04.940.750/0023-00', 'Perboni Juazeiro Ba', 'Outros', 'BA', 'Antonio'),
('PGA COMERCIO ATACADISTA DE FRUTAS E VERDURAS EIRELI', '21.553.781/0001-11', 'Pga Comercio Atacadista De Frutas E Verd', 'Outros', 'BA', 'Antonio'),
('COMERCIAL DE ALIMENTOS FLOR DA CHAPADA LTDA', '03.451.160/0001-45', 'Flor Da Chapada', 'Outros', 'BA', 'Ricardo'),
('GRAL PANIFICACAO EIRELI', '23.793.817/0001-60', 'Gral Paniville', 'Outros', 'BA', 'Ricardo'),
('GRAN REALIZACOES LTDA', '39.303.338/0001-58', 'Gran Hortifruti', 'Outros', 'BA', 'Ricardo'),
('MEGGA DISTRIBUIDORA LTDA', '07.488.144/0009-35', 'Megga Aracaju', 'Outros', 'SE', 'Vinicius'),
('GA INDUSTRIA E COMERCIO DE ALIMENTOS LTDA', '29.590.340/0001-00', 'GA Paris Delicatessen', 'Outros', 'BA', 'Ricardo'),
('ROSELLY FERREIRA SALES DA SILVA LTDA', '12.138.732/0003-93', 'Roselly Ferreira Sales Da Silva Ltda', 'Outros', 'BA', 'Ricardo'),
('SUPERMERCADO JHONES LTDA', '04.462.862/0001-97', 'Supermercado Jhones', 'Outros', 'BA', 'Ricardo'),
('J MASCARENHAS ASSIS LTDA', '05.743.186/0001-92', 'Supermercado Jl', 'Outros', 'BA', 'Ricardo'),
('EXITO SUPERMERCADO LTDA', '34.811.344/0001-00', 'Exito Supermercado', 'Outros', 'SE', 'Vinicius'),
('KI DISTRIBUIDORA LTDA', '43.506.193/0001-60', 'Ki Distribuidora E Atacado', 'Outros', 'SE', 'Vinicius'),
('MEL DISTRIBUIDORA LTDA', '50.911.223/0001-89', 'Mel Distribuidora', 'Outros', 'SE', 'Vinicius'),
('PERINI COMERCIAL DE ALIMENTOS LTDA', '11.965.515/0008-19', 'Perini Graca', 'Perini', 'BA', 'Vinicius'),
('PERINI COMERCIAL DE ALIMENTOS LTDA', '11.965.515/0009-08', 'Perini Pituba', 'Perini', 'BA', 'Vinicius'),
('COAGELI - COMERCIAL DE GENEROS ALIMENTICIOS LTDA', '07.348.911/0002-34', 'Coageli Lj 2 Centro', 'Redemix', 'BA', 'Vinicius'),
('COGEALI COM DE GENEROS ALIMENTICIOS LTDA', '07.348.911/0001-53', 'Cogeali Paripe', 'Redemix', 'BA', 'Vinicius'),
('MASANI COM DE GENEROS ALIMENTICIOS LTDA', '00.813.880/0001-15', 'Masani Com', 'Redemix', 'BA', 'Vinicius'),
('PONTO VERDE COMERCIO DE ALIMENTOS LTDA', '00.658.059/0002-52', 'Ponto Verde Iapi', 'Redemix', 'BA', 'Vinicius'),
('PONTO VERDE COMERCIO DE ALIMENTOS LTDA', '00.658.059/0001-71', 'Ponto Verde Sete Portas', 'Redemix', 'BA', 'Vinicius'),
('PONTO VERDE COMERCIO DE ALIMENTOS LTDA', '00.658.059/0003-33', 'Ponto Verde Vila Laura', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0016-50', 'Redemix Chame Chame', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0017-30', 'Redemix Rio Vermelho', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO GENEROS ALIMENTICIOS LTDA', '06.337.087/0004-16', 'Rmix Alphaville 1', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0007-69', 'Rmix Buraquinho', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0008-40', 'Rmix Horto', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LT', '06.337.087/0003-35', 'Rmix Imbui', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0005-05', 'Rmix Itapua', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0011-45', 'Rmix Ondina', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERC DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0002-54', 'Rmix Pituba', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0010-64', 'Rmix Pituba', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LT', '06.337.087/0001-73', 'Rmix Simoes Filho', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0015-79', 'Rmix Stella Maris', 'Redemix', 'BA', 'Vinicius'),
('RMIX COMERCIO DE GENEROS ALIMENTICIOS LTDA', '06.337.087/0009-20', 'Rmix Vitoria', 'Redemix', 'BA', 'Vinicius'),
('WMB SUPERMERCADOS DO BRASIL LTDA.', '00.063.960/0561-55', 'Sams Aracaju', 'Sams', 'SE', 'Vinicius'),
('WMB SUPERMERCADOS DO BRASIL LTDA', '00.063.960/0574-70', 'Sams Bonoco', 'Sams', 'BA', 'Vinicius'),
('WMB SUPERMERCADOS DO BRASIL LTDA.', '00.063.960/0600-04', 'Sams Feira De Santana', 'Sams', 'BA', 'Vinicius'),
('WMB SUPERMERCADOS DO BRASIL LTDA', '00.063.960/0578-01', 'Sams Lauro De Freitas', 'Sams', 'BA', 'Vinicius'),
('WALMART BRASIL LTDA', '00.063.960/0048-64', 'Sams Pituba', 'Sams', 'BA', 'Vinicius');


-- =================================================================
--  SECTION 4: FUNCTIONS & TRIGGERS
--  Create functions and triggers for automatic profile management.
-- =================================================================

-- Function to get a user's role from the public.usuarios table
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT tipo INTO user_role FROM public.usuarios WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a public profile when a new auth user is created
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

-- Trigger to call handle_new_user on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_deleted_user when a user is deleted
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();


-- =================================================================
--  SECTION 5: ROW LEVEL SECURITY (RLS)
--  Enable RLS and create policies for all tables.
-- =================================================================

-- Enable RLS for all tables
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_acessos ENABLE ROW LEVEL SECURITY;

-- --- POLICIES FOR 'clientes' TABLE ---
CREATE POLICY "Allow read access to all authenticated users" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage clients" ON public.clientes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'administrador');

-- --- POLICIES FOR 'fretistas' TABLE ---
CREATE POLICY "Allow read access to all authenticated users" ON public.fretistas
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage fretistas" ON public.fretistas
  FOR ALL USING (public.get_user_role(auth.uid()) = 'administrador');

-- --- POLICIES FOR 'usuarios' TABLE ---
CREATE POLICY "Allow users to view their own profile" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin to manage all user profiles" ON public.usuarios
  FOR ALL USING (public.get_user_role(auth.uid()) = 'administrador');

-- --- POLICIES FOR 'notas_fiscais' TABLE ---
CREATE POLICY "Allow admin, collaborator, and manager to view all" ON public.notas_fiscais
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('administrador', 'colaborador', 'gerencia'));
CREATE POLICY "Allow fretista to view their own notes" ON public.notas_fiscais
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'fretista' AND
    placa_veiculo = (SELECT fretista_placa FROM public.usuarios WHERE id = auth.uid())
  );
CREATE POLICY "Allow admin and collaborator to manage notes" ON public.notas_fiscais
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('administrador', 'colaborador'));

-- --- POLICIES FOR 'historico_acessos' TABLE ---
CREATE POLICY "Allow admin to view all history" ON public.historico_acessos
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'administrador');
CREATE POLICY "Allow admin to insert history" ON public.historico_acessos
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'administrador');
