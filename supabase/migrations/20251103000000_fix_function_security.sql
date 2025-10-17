/*
# [SECURITY] Fix Function Search Path
[Description: This migration hardens database security by explicitly setting the search_path for all user-defined functions. This mitigates the risk of search path hijacking attacks, as flagged by Supabase security advisories.]

## Query Description: [This operation modifies existing function definitions to include `SET search_path = public`. It is a safe, non-destructive operation that improves security without affecting data or function logic.]

## Metadata:
- Schema-Category: ["Security"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Functions affected:
  - `handle_new_user()`
  - `handle_user_delete()`
  - `calculate_days_late(data_emissao_param date)`
  - `calculate_days_to_due(data_vencimento_param date)`
  - `get_user_tipo()`
  - `fretista_placa_associada()`

## Security Implications:
- RLS Status: [Not Changed]
- Policy Changes: [No]
- Auth Requirements: [None]
- Fixes "Function Search Path Mutable" warning.

## Performance Impact:
- Indexes: [Not Changed]
- Triggers: [Not Changed]
- Estimated Impact: [None]
*/

-- Fix for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- Fix for handle_user_delete
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = old.id;
  RETURN old;
END;
$$;

-- Fix for calculate_days_late
CREATE OR REPLACE FUNCTION public.calculate_days_late(data_emissao_param date)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(0, (CURRENT_DATE - data_emissao_param));
END;
$$;

-- Fix for calculate_days_to_due
CREATE OR REPLACE FUNCTION public.calculate_days_to_due(data_vencimento_param date)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(0, (data_vencimento_param - CURRENT_DATE));
END;
$$;

-- Fix for get_user_tipo
CREATE OR REPLACE FUNCTION public.get_user_tipo()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tipo_val text;
BEGIN
  SELECT tipo INTO user_tipo_val FROM public.usuarios WHERE id = auth.uid();
  RETURN user_tipo_val;
END;
$$;

-- Fix for fretista_placa_associada
CREATE OR REPLACE FUNCTION public.fretista_placa_associada()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  placa_val text;
BEGIN
  SELECT fretista_placa INTO placa_val FROM public.usuarios WHERE id = auth.uid();
  RETURN placa_val;
END;
$$;
