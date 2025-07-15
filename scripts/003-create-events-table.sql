-- 003-create-events-table.sql

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE RESTRICT,
  image_url text,
  music_list jsonb,
  schedule jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_venue_id ON public.events(venue_id);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow all users to read events
CREATE POLICY "Allow public read access to events" ON public.events
    FOR SELECT USING (true);

-- Allow only admins to insert events
CREATE POLICY "Allow admin insert access to events" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow only admins to update events
CREATE POLICY "Allow admin update access to events" ON public.events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow only admins to delete events
CREATE POLICY "Allow admin delete access to events" ON public.events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
