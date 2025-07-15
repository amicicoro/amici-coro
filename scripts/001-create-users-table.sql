-- 1. Create Enum for roles if not exists (repeat not required if already present from earlier migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
END IF;
END$$;

-- 2. Table to track user roles (repeat not required if already present from earlier migration)
CREATE TABLE IF NOT EXISTS public.user_roles (
                                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
    );

-- 3. Security definer function to check role (repeat not required if already present)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
);
$$;
