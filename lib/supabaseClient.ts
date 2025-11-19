
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as novas credenciais fornecidas
const SUPABASE_URL = 'https://gjuwnqhyccxqxbfzeyrm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdXducWh5Y2N4cXhiZnpleXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzI0OTcsImV4cCI6MjA3OTE0ODQ5N30.KqDN2z_o1ovWVvHOYNMI1u1arx3B1sdns5g_3BuH42E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
