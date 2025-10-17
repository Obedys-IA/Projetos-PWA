/*
          # [RESET COMPLETO DO ESQUEMA PÚBLICO]
          Este script apaga e recria completamente o esquema público para garantir um estado limpo e consistente.

          ## Query Description: [Este script é DESTRUTIVO e irá apagar todos os dados nas tabelas 'clientes', 'fretistas', 'notas_fiscais', 'historico_acessos' e 'usuarios'. Ele foi projetado para corrigir erros de migração anteriores, removendo todas as políticas, tabelas e funções na ordem correta para evitar erros de dependência, e então recriando tudo do zero. Faça um backup se tiver dados importantes.]
          
          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Tabelas Afetadas: usuarios, clientes, fretistas, notas_fiscais, historico_acessos
          - Políticas Afetadas: Todas as políticas de RLS nas tabelas mencionadas.
          - Funções Afetadas: handle_new_user, handle_user_delete
          
          ## Security Implications:
          - RLS Status: Desabilitado e Reabilitado
          - Policy Changes: Yes
          - Auth Requirements: Deve ser executado por um usuário com permissões de administrador.
          
          ## Performance Impact:
          - Indexes: Removidos e Recriados
          - Triggers: Removidos e Recriados
          - Estimated Impact: Baixo impacto em performance após a execução, pois recria os índices.
          */

-- PASSO 1: Remover todas as políticas de segurança existentes para evitar conflitos de dependência.
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON "public"."usuarios";
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os perfis" ON "public"."usuarios";
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver clientes" ON "public"."clientes";
DROP POLICY IF EXISTS "Administradores podem gerenciar clientes" ON "public"."clientes";
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver fretistas" ON "public"."fretistas";
DROP POLICY IF EXISTS "Administradores podem gerenciar fretistas" ON "public"."fretistas";
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias notas" ON "public"."notas_fiscais";
DROP POLICY IF EXISTS "Administradores e Gerencia podem ver todas as notas" ON "public"."notas_fiscais";
DROP POLICY IF EXISTS "Fretistas podem ver suas notas fiscais" ON "public"."notas_fiscais";
DROP POLICY IF EXISTS "Administradores podem ver todo o histórico" ON "public"."historico_acessos";

-- PASSO 2: Remover as tabelas e funções na ordem correta, usando CASCADE para resolver dependências.
DROP TABLE IF EXISTS "public"."historico_acessos" CASCADE;
DROP TABLE IF EXISTS "public"."notas_fiscais" CASCADE;
DROP TABLE IF EXISTS "public"."usuarios" CASCADE;
DROP TABLE IF EXISTS "public"."fretistas" CASCADE;
DROP TABLE IF EXISTS "public"."clientes" CASCADE;
DROP FUNCTION IF EXISTS "public"."handle_new_user"();
DROP FUNCTION IF EXISTS "public"."handle_user_delete"();


-- PASSO 3: Criar a tabela de Fretistas
CREATE TABLE "public"."fretistas" (
    "placa" text NOT NULL,
    "nome" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."fretistas" ADD CONSTRAINT "fretistas_pkey" PRIMARY KEY USING INDEX ON "fretistas" ("placa");

-- PASSO 4: Criar a tabela de Clientes
CREATE TABLE "public"."clientes" (
    "razao_social" text,
    "cnpj" text NOT NULL,
    "nome_fantasia" text NOT NULL,
    "rede" text,
    "uf" text,
    "vendedor" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_pkey" PRIMARY KEY USING INDEX ON "clientes" ("cnpj");

-- PASSO 5: Criar a tabela de Usuários (agora chamada 'usuarios' para consistência)
CREATE TABLE "public"."usuarios" (
    "id" uuid NOT NULL,
    "nome" text,
    "email" text,
    "telefone" text,
    "tipo" text NOT NULL DEFAULT 'novo'::text,
    "fretista_placa" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY USING INDEX ON "usuarios" ("id");
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_fretista_placa_fkey" FOREIGN KEY (fretista_placa) REFERENCES fretistas(placa) ON DELETE SET NULL;

-- PASSO 6: Criar a tabela de Notas Fiscais
CREATE TABLE "public"."notas_fiscais" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "data_emissao" date NOT NULL,
    "hora_saida" text,
    "numero_nf" text NOT NULL,
    "nome_fantasia" text,
    "rede" text,
    "uf" text,
    "vendedor" text,
    "placa_veiculo" text,
    "fretista" text,
    "valor_nota" numeric NOT NULL,
    "data_vencimento" date,
    "situacao" text DEFAULT 'Dentro do Prazo'::text,
    "status" text DEFAULT 'Pendente'::text,
    "dias_atraso" integer,
    "dias_vencer" integer,
    "observacao" text,
    "arquivo_url" text,
    "usuario_registro" text,
    "data_registro" date DEFAULT CURRENT_DATE,
    "hora_registro" text,
    "usuario_edicao" text,
    "data_edicao" date,
    "hora_edicao" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid DEFAULT auth.uid()
);
ALTER TABLE "public"."notas_fiscais" ADD CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY USING INDEX ON "notas_fiscais" ("id");
ALTER TABLE "public"."notas_fiscais" ADD CONSTRAINT "notas_fiscais_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- PASSO 7: Criar a tabela de Histórico de Acessos
CREATE TABLE "public"."historico_acessos" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" uuid,
    "usuario" text,
    "data" date,
    "hora" text,
    "tela" text,
    "acao" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."historico_acessos" ADD CONSTRAINT "historico_acessos_pkey" PRIMARY KEY USING INDEX ON "historico_acessos" ("id");
ALTER TABLE "public"."historico_acessos" ADD CONSTRAINT "historico_acessos_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- PASSO 8: Criar funções de gatilho para sincronizar `auth.users` com `public.usuarios`
-- Gatilho para criar um perfil quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, telefone, tipo)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nome', 
    new.email, 
    new.raw_user_meta_data->>'telefone',
    'novo'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função acima
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Gatilho para deletar o perfil quando um usuário é deletado da autenticação
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função de deleção
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


-- PASSO 9: Popular as tabelas `fretistas` e `clientes` com os dados fornecidos
INSERT INTO "public"."fretistas" (placa, nome) VALUES
('BRY9A41', 'Anderson'), ('LST7H05', 'Andre'), ('QKY0D59', 'Danilo'), ('JOP0J97', 'Eden'), ('PJF6530', 'Ednilson'),
('OUO2501', 'Elvis'), ('OZM8C48', 'Elvis'), ('OLA8363', 'Elvis'), ('OEP9E84', 'Elvis'), ('OVS8H29', 'Elvis'),
('PJU8H76', 'Elvis'), ('PJA3D26', 'Gustavo'), ('PJS5H00', 'Gustavo'), ('LRC9H40', 'Danilo'), ('PLK2C22', 'Josenilson'),
('OSF8808', 'Natal'), ('JQB8F32', 'Paulo Noel'), ('JPX8747', 'Paulo Noel'), ('PEF3B50', 'Paulo Noel'), ('NVM5109', 'Paulo Noel'),
('DVA3G04', 'Paulo Noel'), ('PEY9D15', 'Paulo Noel'), ('PJI2I77', 'Paulo Noel'), ('ORI2G75', 'Paulo Noel'), ('JOU8522', 'Paulo Noel'),
('NZK8A92', 'Paulo Noel'), ('IAD5528', 'Paulo Noel'), ('OKV2567', 'Renato'), ('NYL1B84', 'Renato'), ('NZY7881', 'Renato'),
('PJN1652', 'Roque'), ('OES3C15', 'Danilo')
ON CONFLICT (placa) DO NOTHING;

INSERT INTO "public"."clientes" (razao_social, cnpj, nome_fantasia, rede, uf, vendedor) VALUES
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0315-65', 'Assai Juazeiro', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0477-20', 'Assai Petrolina', 'Assai', 'PE', 'Antonio'),
('SENDAS DISTRIBUIDORA S/A', '06.057.223/0407-18', 'Assai Sr Do Bonfim', 'Assai', 'BA', 'Antonio'),
('SENDAS DISTRIBUIDora S/A', '06.057.223/0470-54', 'Assai Barris', 'Assai', 'BA', 'Nixon'),
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


-- PASSO 10: Habilitar Row Level Security (RLS) e criar políticas de acesso
ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fretistas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notas_fiscais" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."historico_acessos" ENABLE ROW LEVEL SECURITY;

-- Políticas para 'usuarios'
CREATE POLICY "Usuários podem ver seus próprios perfis" ON "public"."usuarios"
FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Administradores podem gerenciar todos os perfis" ON "public"."usuarios"
FOR ALL USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
) WITH CHECK (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
);

-- Políticas para 'clientes'
CREATE POLICY "Qualquer usuário autenticado pode ver clientes" ON "public"."clientes"
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Administradores podem gerenciar clientes" ON "public"."clientes"
FOR ALL USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
) WITH CHECK (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
);

-- Políticas para 'fretistas'
CREATE POLICY "Qualquer usuário autenticado pode ver fretistas" ON "public"."fretistas"
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Administradores podem gerenciar fretistas" ON "public"."fretistas"
FOR ALL USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
) WITH CHECK (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
);

-- Políticas para 'notas_fiscais'
CREATE POLICY "Usuários podem gerenciar suas próprias notas" ON "public"."notas_fiscais"
FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Administradores e Gerencia podem ver todas as notas" ON "public"."notas_fiscais"
FOR SELECT USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) IN ('administrador', 'gerencia', 'colaborador')
);
CREATE POLICY "Fretistas podem ver suas notas fiscais" ON "public"."notas_fiscais"
FOR SELECT USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'fretista'
  AND placa_veiculo = (SELECT fretista_placa FROM public.usuarios WHERE id = auth.uid())
);

-- Políticas para 'historico_acessos'
CREATE POLICY "Administradores podem ver todo o histórico" ON "public"."historico_acessos"
FOR SELECT USING (
  (SELECT tipo FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
);
CREATE POLICY "Usuários podem registrar seu próprio histórico" ON "public"."historico_acessos"
FOR INSERT WITH CHECK (auth.uid() = usuario_id);

GRANT ALL ON TABLE "public"."clientes" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."fretistas" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."historico_acessos" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."notas_fiscais" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."usuarios" TO "anon", "authenticated", "service_role";
