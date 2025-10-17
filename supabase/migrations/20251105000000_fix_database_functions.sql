-- =============================================
-- Corrige a segurança das funções e garante a existência de todas as funções e gatilhos.
-- Este script usa 'CREATE OR REPLACE' para ser seguro de executar múltiplas vezes.
-- =============================================

-- 1. Função para criar perfil de usuário público
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, tipo)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome', 'novo');
  RETURN new;
END;
$$;

-- 2. Função para deletar perfil de usuário público
CREATE OR REPLACE FUNCTION public.on_auth_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = old.id;
  RETURN old;
END;
$$;

-- 3. Função para atualizar dias de atraso/vencimento das notas
CREATE OR REPLACE FUNCTION public.update_dias_atraso_vencer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcula dias em atraso (dias desde a emissão)
  NEW.dias_atraso := GREATEST(0, (current_date - NEW.data_emissao));

  -- Calcula dias para vencer (dias até o vencimento)
  NEW.dias_vencer := GREATEST(0, (NEW.data_vencimento - current_date));

  -- Atualiza a situação da nota
  IF NEW.data_vencimento IS NOT NULL THEN
    IF current_date > NEW.data_vencimento THEN
      NEW.situacao := 'Vencimento Próximo'; -- ou 'Vencida' se preferir
    ELSIF (NEW.data_vencimento - current_date) <= 10 THEN
      NEW.situacao := 'Vencimento Próximo';
    ELSE
      NEW.situacao := 'Dentro do Prazo';
    END IF;
  ELSE
    NEW.situacao := 'Dentro do Prazo';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Recriação dos Gatilhos (Triggers) para garantir que estão corretos

-- Gatilho para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Gatilho para exclusão de usuários
DROP TRIGGER IF EXISTS on_auth_user_deleted_trigger ON auth.users;
CREATE TRIGGER on_auth_user_deleted_trigger
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.on_auth_user_deleted();

-- Gatilho para notas fiscais
DROP TRIGGER IF EXISTS before_insert_or_update_notas_fiscais ON public.notas_fiscais;
CREATE TRIGGER before_insert_or_update_notas_fiscais
  BEFORE INSERT OR UPDATE ON public.notas_fiscais
  FOR EACH ROW EXECUTE PROCEDURE public.update_dias_atraso_vencer();
