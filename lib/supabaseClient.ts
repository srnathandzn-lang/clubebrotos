
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const SUPABASE_URL = 'https://kjbjdouebkytjgnbibkk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fCv1SaQ3Xov1E4KHDg2FWw_sTitXCYv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
