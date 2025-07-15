-- Create venues table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    website TEXT,
    timezone TEXT NOT NULL DEFAULT 'Europe/London',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_venues_name ON public.venues(name);

-- Enable Row Level Security
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow all users to read venues
CREATE POLICY "Allow public read access to venues" ON public.venues
    FOR SELECT USING (true);

-- Allow only admins to insert venues
CREATE POLICY "Allow admin insert access to venues" ON public.venues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow only admins to update venues
CREATE POLICY "Allow admin update access to venues" ON public.venues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow only admins to delete venues
CREATE POLICY "Allow admin delete access to venues" ON public.venues
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_venues_updated_at 
    BEFORE UPDATE ON public.venues 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
