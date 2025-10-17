-- Remove a política antiga se existir, para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem criar seus próprios perfis" ON public.usuarios;

-- Cria a nova política que permite a inserção do próprio perfil
CREATE POLICY "Usuários podem criar seus próprios perfis"
ON public.usuarios
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Garante que usuários possam ver seus próprios perfis (reforçando)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.usuarios;
CREATE POLICY "Usuários podem ver seus próprios perfis"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- Garante que usuários possam atualizar seus próprios perfis (reforçando)
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
