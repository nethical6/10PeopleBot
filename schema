-- Table: groups
CREATE TABLE public.groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_full BOOLEAN
);

-- Table: user
CREATE TABLE public.user (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  interests JSONB NOT NULL,
  joined_group UUID REFERENCES public.groups(group_id) ON DELETE SET NULL,
  kicked_groups JSONB
);

-- Table: waiting_pool
CREATE TABLE public.waiting_pool (
  user_id UUID PRIMARY KEY REFERENCES public.user(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

