// supabase-config.js
// Using the ESM CDN for modern import syntax
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://supabase.com/dashboard/project/intoboakhliaykipuzjs';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludG9ib2FraGxpYXlraXB1empzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNDU5ODIsImV4cCI6MjEwNjYyMTk4Mn0.tBeotzpwpwJxzwPlKBVcYWAEsqhxih7WEYtPpC3qBXQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
