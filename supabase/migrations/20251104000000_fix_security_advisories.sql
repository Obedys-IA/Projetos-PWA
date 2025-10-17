-- Fix for "Function Search Path Mutable" security advisory
-- This script explicitly sets the search_path for all user-defined functions
-- to mitigate the risk of search path hijacking (CVE-2018-1058).

/*
          # [Security] Fix Function Search Path
          [This operation secures existing database functions by setting a fixed search_path. 
          It prevents potential security vulnerabilities related to search path manipulation.]

          ## Query Description: [This is a non-destructive security enhancement. 
          It modifies the metadata of existing functions without altering their logic or impacting data. 
          No data backup is required.]
          
          ## Metadata:
          - Schema-Category: ["Safe", "Security"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Functions affected: handle_new_user, handle_user_delete, update_dias_atraso_vencer
          
          ## Security Implications:
          - RLS Status: [Not Changed]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Not Changed]
          - Triggers: [Not Changed]
          - Estimated Impact: [None. This is a metadata change with no performance overhead.]
          */

-- Secure the function that handles new user profile creation.
ALTER FUNCTION public.handle_new_user()
SET search_path = public;

-- Secure the function that handles user profile deletion.
ALTER FUNCTION public.handle_user_delete()
SET search_path = public;

-- Secure the function that calculates date differences for invoices.
ALTER FUNCTION public.update_dias_atraso_vencer()
SET search_path = public;
