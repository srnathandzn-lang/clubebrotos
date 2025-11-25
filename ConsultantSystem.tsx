import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabaseClient';
import { 
    BrandLogo, 
    MenuIcon, 
    CloseIcon, 
    UsersIcon, 
    ChartBarIcon, 
    UserCircleIcon, 
    LogoutIcon, 
    AcademicCapIcon, 
    ShoppingCartIcon, 
    PackageIcon, 
    TruckIcon, 
    TrendingUpIcon, 
    BanknotesIcon, 
    PresentationChartLineIcon, 
    CalendarIcon,
    QrCodeIcon, 
    CreditCardIcon, 
    DocumentDuplicateIcon, 
    CheckCircleIcon,
    PhotoIcon, 
    DownloadIcon, 
    ClipboardCopyIcon,
    HandshakeIcon, 
    TargetIcon,
    BriefcaseIcon,
    SunIcon,
    MoonIcon,
    UserPlusIcon,
    CurrencyDollarIcon,
    ClipboardListIcon,
    TagIcon,
    CalculatorIcon,
    VideoCameraIcon,
    PlayCircleIcon,
    BellIcon,
    LeafIcon,
    SparklesIcon,
    ShareIcon,
    ChatIcon,
    StoreIcon,
    WhatsAppIcon,
    LocationIcon,
    SearchIcon
} from './components/Icons';
import { Consultant, ConsultantStats, Sale, Notification, PrivateCustomer, PrivateSale } from './types';

// --- Theme Context ---
const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => {}
});

const useTheme = () => useContext(ThemeContext);

// --- Global Floating Theme Toggle ---
const FloatingThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    return (
        <button 
            onClick={toggleTheme} 
            className="fixed top-6 right-6 z-[60] p-3 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 transition-all duration-300 group"
            title="Alternar Tema"
        >
            {isDarkMode ? 
                <SunIcon className="h-6 w-6 text-yellow-400 drop-shadow-lg" /> : 
                <MoonIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 drop-shadow-lg" />
            }
        </button>
    );
};

// --- Helper Functions ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatImgurUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('i.imgur.com')) return url; 
    if (url.includes('imgur.com')) {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        return `https://i.imgur.com/${id}.png`;
    }
    return url;
};

// --- Components ---

const LoginScreen = ({ onLogin, onRegisterClick }: { onLogin: (user: Consultant) => void, onRegisterClick: () => void }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: consultant, error: consultantError } = await supabase
                .from('consultants')
                .select('*')
                .eq('id', id)
                .single();

            if (consultantError || !consultant) {
                throw new Error('ID de consultor não encontrado.');
            }

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: consultant.email,
                password: password,
            });

            if (authError) {
                throw new Error('Senha incorreta.');
            }

            onLogin(consultant as Consultant);

        } catch (err: any) {
            setError(err.message || 'Erro ao acessar o sistema.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop')] bg-cover bg-center p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green-dark/95 via-brand-green-dark/80 to-black/80 backdrop-blur-sm"></div>
            <FloatingThemeToggle />
            
            <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10 animate-fade-in">
                <div className="flex justify-center mb-8 animate-float">
                    <BrandLogo className="h-24 w-auto drop-shadow-lg" />
                </div>
                
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">Clube Brotos</h2>
                    <p className="text-green-100 font-light">Sua jornada de sucesso natural.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-bold text-green-200 mb-1 uppercase tracking-wider">ID de Acesso</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserCircleIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Seu ID de consultor"
                                className="pl-11 block w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 focus:border-green-400 focus:ring-green-400/50 focus:bg-white/10 transition-all py-4 font-medium"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-green-200 mb-1 uppercase tracking-wider">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <BriefcaseIcon />
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="pl-11 block w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 focus:border-green-400 focus:ring-green-400/50 focus:bg-white/10 transition-all py-4 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur-sm animate-slide-up">
                            <p className="text-sm text-red-200 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 block"></span>
                                {error}
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-green-900/50 text-sm font-bold text-white bg-brand-green-mid hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Acessando...</span>
                        ) : 'ENTRAR NO SISTEMA'}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                     <p className="text-sm text-green-100/70">
                        Novo por aqui?{' '}
                        <button onClick={onRegisterClick} className="font-bold text-white hover:text-green-300 transition-colors underline decoration-2 underline-offset-4">
                            Criar minha conta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const RegisterScreen = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
    const [formData, setFormData] = useState({
        name: '',
        document_id: '', // CPF
        email: '',
        whatsapp: '',
        address: '', // Endereço Completo
        zip_code: '', // CEP
        reference_point: '', // Ponto de Referência
        password: '',
        confirmPassword: '',
        sponsorId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

    useEffect(() => {
        // Tenta pegar o ID do patrocinador da URL
        const params = new URLSearchParams(window.location.search);
        const sponsor = params.get('sponsor');
        if (sponsor) {
            setFormData(prev => ({ ...prev, sponsorId: sponsor }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                const randomId = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Concatena endereço para salvar no banco (para compatibilidade com SQL existente)
                const fullAddress = `${formData.address} - CEP: ${formData.zip_code} - Ref: ${formData.reference_point}`;

                const { error: dbError } = await supabase
                    .from('consultants')
                    .insert([
                        {
                            id: randomId,
                            auth_id: authData.user.id,
                            name: formData.name,
                            document_id: formData.document_id,
                            email: formData.email,
                            whatsapp: formData.whatsapp,
                            address: fullAddress,
                            role: 'consultant',
                            parent_id: formData.sponsorId || null
                        }
                    ]);

                if (dbError) throw dbError;
                setGeneratedId(randomId);
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-green-dark p-4 relative">
                <FloatingThemeToggle />
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-white/20 animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-500/20 mb-6 animate-float">
                        <CheckCircleIcon className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Sucesso!</h2>
                    <p className="text-green-100 mb-8">Bem-vindo(a) à elite Brotos da Terra.</p>
                    
                    <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                        <p className="text-xs text-green-300 uppercase tracking-widest mb-2">Seu ID de Acesso</p>
                        <p className="text-5xl font-bold text-white tracking-widest font-mono">{generatedId}</p>
                        <p className="text-xs text-white/50 mt-4">Salve este número em local seguro.</p>
                    </div>

                    <button 
                        onClick={onBackToLogin}
                        className="w-full py-4 px-6 bg-white text-brand-green-dark rounded-xl hover:bg-green-50 transition-all font-bold shadow-lg"
                    >
                        Acessar Minha Conta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop')] bg-cover bg-center p-4">
             <div className="absolute inset-0 bg-brand-dark-bg/90 backdrop-blur-sm"></div>
             <FloatingThemeToggle />
             
            <div className="bg-brand-dark-card/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/10 relative z-10 animate-slide-up max-h-[95vh] overflow-y-auto">
                <button onClick={onBackToLogin} className="mb-6 text-white/50 hover:text-white flex items-center gap-2 text-sm transition-colors sticky top-0 bg-brand-dark-card/90 backdrop-blur z-20 w-full py-2">
                    ← Voltar para Login
                </button>
                <h2 className="text-3xl font-serif font-bold text-white mb-1">Criar Conta</h2>
                <p className="text-white/60 mb-8 text-sm">Preencha seus dados para iniciar sua jornada.</p>
                
                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Dados Pessoais */}
                    <div className="col-span-2 text-xs font-bold text-green-300 uppercase tracking-widest mt-2 mb-1 border-b border-white/10 pb-1">
                        Dados Pessoais
                    </div>
                    
                    <input 
                        name="name" type="text" placeholder="Nome Completo"
                        className="col-span-2 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                    <input 
                        name="document_id" type="text" placeholder="CPF"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                     <input 
                        name="whatsapp" type="text" placeholder="Telefone (WhatsApp)"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                    <input 
                        name="email" type="email" placeholder="E-mail"
                        className="col-span-2 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />

                    {/* Endereço */}
                    <div className="col-span-2 text-xs font-bold text-green-300 uppercase tracking-widest mt-4 mb-1 border-b border-white/10 pb-1">
                        Endereço
                    </div>

                    <input 
                        name="zip_code" type="text" placeholder="CEP"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                    <input 
                        name="address" type="text" placeholder="Endereço Completo"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                    <input 
                        name="reference_point" type="text" placeholder="Ponto de Referência"
                        className="col-span-2 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange}
                    />

                    {/* Acesso */}
                    <div className="col-span-2 text-xs font-bold text-green-300 uppercase tracking-widest mt-4 mb-1 border-b border-white/10 pb-1">
                        Acesso & Indicação
                    </div>

                    <input 
                        name="sponsorId" type="text" placeholder="ID do Indicador (Opcional)"
                        className="col-span-2 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange}
                        value={formData.sponsorId}
                        readOnly={!!formData.sponsorId} // ReadOnly se veio da URL, mas pode ser editável se preferir
                    />
                    <input 
                        name="password" type="password" placeholder="Crie uma Senha"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />
                    <input 
                        name="confirmPassword" type="password" placeholder="Confirmar Senha"
                        className="col-span-2 md:col-span-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/50 p-4 focus:border-green-400 focus:bg-white/10 outline-none transition-all"
                        onChange={handleChange} required
                    />

                    {error && <p className="col-span-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="col-span-2 w-full py-4 bg-brand-green-mid text-white rounded-xl hover:bg-green-500 transition-all font-bold shadow-lg shadow-green-900/50 mt-4"
                    >
                        {loading ? 'Processando Cadastro...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Public Store Component (For Customers) ---

const PublicStoreScreen = ({ consultantId }: { consultantId: string }) => {
    const [consultant, setConsultant] = useState<Consultant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConsultant = async () => {
            try {
                const { data, error } = await supabase
                    .from('consultants')
                    .select('*')
                    .eq('id', consultantId)
                    .single();
                
                if (error) throw error;
                setConsultant(data);
            } catch (err) {
                setError('Consultor não encontrado.');
            } finally {
                setLoading(false);
            }
        };
        fetchConsultant();
    }, [consultantId]);

    const handleBuy = () => {
        if (consultant) {
            const message = `Olá ${consultant.name}, vi sua loja online da Brotos e gostaria de fazer um pedido da Pomada Copaíba.`;
            window.open(`https://wa.me/55${consultant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-brand-dark-bg text-gray-500">Carregando loja...</div>;
    if (error || !consultant) return <div className="min-h-screen flex items-center justify-center text-red-500">Loja não encontrada. Verifique o link.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-dark-bg font-sans transition-colors duration-500">
             <FloatingThemeToggle />
             <div className="bg-brand-green-dark text-white pt-20 pb-32 px-6 text-center relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <LeafIcon />
                 </div>
                 <div className="relative z-10 animate-fade-in">
                    <BrandLogo className="h-20 w-auto mx-auto mb-6" />
                    <p className="text-green-200 uppercase tracking-[0.2em] text-xs font-bold mb-2">Consultor Oficial</p>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{consultant.name}</h1>
                 </div>
             </div>

             <div className="max-w-5xl mx-auto px-6 -mt-24 pb-12 relative z-20">
                 <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-slide-up">
                     <div className="md:flex items-stretch">
                         <div className="md:w-1/2 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-12 relative overflow-hidden">
                             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                             <PackageIcon className="w-64 h-64 text-brand-green-dark dark:text-green-400 drop-shadow-2xl animate-float relative z-10" />
                         </div>
                         <div className="md:w-1/2 p-10 flex flex-col justify-center">
                             <div className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
                                 Bestseller
                             </div>
                             <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">Pomada Copaíba</h2>
                             <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                                 Alívio imediato e natural para dores musculares. A força pura da natureza concentrada para o seu bem-estar diário.
                             </p>
                             
                             <div className="flex items-end gap-4 mb-10">
                                 <span className="text-5xl font-bold text-brand-green-dark dark:text-green-400">R$ 35,00</span>
                                 <span className="text-xl text-gray-400 line-through mb-2 font-medium">R$ 50,00</span>
                             </div>

                             <button 
                                onClick={handleBuy}
                                className="w-full bg-brand-green-mid hover:bg-green-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transform hover:-translate-y-1"
                             >
                                <WhatsAppIcon /> Comprar via WhatsApp
                             </button>
                             <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                 <CheckCircleIcon className="h-4 w-4 text-green-500" /> Compra segura e direta com o consultor
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="mt-16 text-center text-gray-500 dark:text-gray-600 text-sm font-medium">
                     <p className="mb-1">Brotos da Terra - Distribuição e Representação</p>
                     <p>Consultor Autorizado ID: {consultant.id}</p>
                 </div>
             </div>
        </div>
    );
};

// --- Inner Dashboard Components (Refined) ---

const InviteModal = ({ onClose, user }: { onClose: () => void, user: Consultant }) => {
    const inviteLink = `${window.location.origin}?sponsor=${user.id}`;
    
    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert("Link copiado!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-brand-dark-card rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Convidar Consultor</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl text-center mb-8 border border-green-100 dark:border-green-800/30">
                    <ShareIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-green-800 dark:text-green-300 font-medium">Expanda sua rede e ganhe bônus!</p>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-400 mb-2 font-bold uppercase tracking-wide text-xs">Link de Indicação</p>
                <div className="flex gap-2 mb-6">
                    <input readOnly value={inviteLink} className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none font-medium" />
                    <button onClick={copyLink} className="bg-brand-green-dark text-white px-6 rounded-xl font-bold hover:bg-brand-green-mid transition-colors shadow-lg">
                        Copiar
                    </button>
                </div>

                <button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Quero te convidar para fazer parte da Brotos da Terra. Cadastre-se com meu link: ${inviteLink}`)}`, '_blank')}
                    className="w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                    <WhatsAppIcon /> Enviar convite no WhatsApp
                </button>
            </div>
        </div>
    );
};

const BusinessModelSection = ({ onRequestInvite, onRequestOrder }: { onRequestInvite: () => void, onRequestOrder: () => void }) => {
    const [activeTab, setActiveTab] = useState<'sales' | 'leadership'>('sales');

    return (
        <div className="bg-[#052e16] dark:bg-black rounded-[2.5rem] p-10 shadow-2xl border border-green-900/30 relative overflow-hidden mb-10 text-white group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                <PackageIcon className="w-80 h-80 text-white" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-green-300 mb-6 border border-white/5">
                        Modelo de Negócio
                    </div>
                    <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                        Faça seu negócio <br/> <span className="text-green-400">do seu jeito</span>
                    </h3>
                    <p className="text-green-100/80 mb-10 text-lg leading-relaxed max-w-lg font-light">
                        Liberdade total. Escolha entre lucro rápido com vendas diretas ou construa um legado duradouro formando sua própria equipe.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                         <button 
                            onClick={onRequestOrder}
                            className="bg-white text-brand-green-dark px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                         >
                            <ShoppingCartIcon className="h-5 w-5" /> Venda Direta
                         </button>
                         <button 
                            onClick={onRequestInvite}
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all hover:-translate-y-1"
                         >
                            <UsersIcon className="h-5 w-5" /> Construção de Time
                         </button>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <div className="flex space-x-2 mb-8 bg-black/40 p-1.5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'sales' ? 'bg-white text-brand-green-dark shadow-lg' : 'text-green-200/60 hover:text-white'}`}
                        >
                            Revenda
                        </button>
                        <button
                             onClick={() => setActiveTab('leadership')}
                             className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'leadership' ? 'bg-white text-brand-green-dark shadow-lg' : 'text-green-200/60 hover:text-white'}`}
                        >
                            Liderança
                        </button>
                    </div>
                    
                    {activeTab === 'sales' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-green-500/20 p-4 rounded-2xl group-hover/item:bg-green-500/30 transition-colors"><TagIcon className="h-6 w-6 text-green-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Lucro de 100%</h4>
                                    <p className="text-green-200/70 mt-1">Margem excepcional. Compre por R$ 17,50 e revenda por R$ 35,00.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-green-500/20 p-4 rounded-2xl group-hover/item:bg-green-500/30 transition-colors"><TruckIcon className="h-6 w-6 text-green-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Pronta Entrega</h4>
                                    <p className="text-green-200/70 mt-1">Receba produtos em casa e atenda seus clientes com agilidade.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-6 animate-fade-in">
                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-blue-500/20 p-4 rounded-2xl group-hover/item:bg-blue-500/30 transition-colors"><TrendingUpIcon className="h-6 w-6 text-blue-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Bônus Recorrente</h4>
                                    <p className="text-green-200/70 mt-1">Receba comissões automáticas sobre todas as vendas da sua rede.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5 group/item">
                                <div className="bg-blue-500/20 p-4 rounded-2xl group-hover/item:bg-blue-500/30 transition-colors"><AcademicCapIcon className="h-6 w-6 text-blue-400" /></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Carreira Executiva</h4>
                                    <p className="text-green-200/70 mt-1">Acesso a mentorias exclusivas e plano de carreira.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EarningsSimulator = () => {
    const [goal, setGoal] = useState(1500); 
    const profitPerUnit = 17.50; 
    const unitsPerDay = Math.ceil((goal / profitPerUnit) / 26); 

    const calculateEarnings = (units: number) => {
        return units * profitPerUnit * 26;
    }

    return (
        <div className="bg-white dark:bg-brand-dark-card rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-200 dark:border-gray-700 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BanknotesIcon className="h-6 w-6 text-green-700 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Simulador de Ganhos</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl text-lg leading-relaxed">
                    Visualize o potencial do seu esforço. Pequenas metas diárias constroem grandes resultados mensais.
                </p>

                {/* Cards Interativos */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {[2, 5, 10].map((units) => (
                        <div key={units} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 transition-all hover:shadow-xl hover:bg-white dark:hover:bg-gray-750 group cursor-default">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Meta Diária</p>
                            <p className="text-gray-800 dark:text-white mb-4 text-lg">Vender <strong className="text-brand-green-mid">{units}</strong> pomadas</p>
                            <div className="h-px bg-gray-200 dark:bg-gray-700 w-full mb-4 group-hover:bg-green-100 transition-colors"></div>
                            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Ganho Mensal Estimado</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-brand-green-mid transition-colors">
                                {formatCurrency(calculateEarnings(units))}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                    <p className="text-center font-bold text-gray-900 dark:text-white mb-8 text-xl">
                        Quanto você quer ganhar este mês?
                    </p>
                    
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-5xl font-bold text-brand-green-mid tracking-tight">{formatCurrency(goal)}</span>
                            <div className="text-right">
                                <span className="block text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Sua Meta</span>
                                <span className="text-xl font-bold text-gray-700 dark:text-white bg-white dark:bg-gray-700 px-6 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">~{unitsPerDay} un/dia</span>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="500" 
                            max="6000" 
                            step="100" 
                            value={goal} 
                            onChange={(e) => setGoal(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-green-mid hover:accent-green-400 transition-all"
                        />
                        <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider">
                            <span>R$ 500</span>
                            <span>R$ 3.000</span>
                            <span>R$ 6.000+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamPerformanceSection = ({ team }: { team: Consultant[] }) => {
    const teamSales = team.reduce((acc, member) => acc + (Math.random() > 0.5 ? 2 : 0), 0); 
    const bonus = teamSales * 5; 

    const handleContact = (phone: string) => {
        window.open(`https://wa.me/55${phone.replace(/\D/g, '')}`, '_blank');
    }

    return (
        <div className="bg-white dark:bg-brand-dark-card rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-200 dark:border-gray-700 mt-10">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                        <UsersIcon className="h-6 w-6" />
                    </div>
                    Minha Equipe
                </h3>
                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm font-bold">
                    {team.length} Membros
                </span>
            </div>

            {team.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <UsersIcon className="h-8 w-8" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium mb-1">Sua equipe está vazia</p>
                    <p className="text-sm text-gray-500">Convide pessoas para começar a construir sua rede.</p>
                </div>
            ) : (
                <>
                     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg shadow-blue-500/20">
                        <div className="mb-4 md:mb-0">
                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Bônus Estimado</p>
                            <p className="text-4xl font-bold">{formatCurrency(bonus)}</p>
                        </div>
                        <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10">
                            <p className="text-blue-100 text-xs uppercase font-bold mb-1">Volume de Vendas</p>
                            <p className="text-2xl font-bold">{teamSales} <span className="text-sm font-normal text-blue-200">Caixas</span></p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-700">Consultor</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-700">Status Pedido</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right border-b border-gray-200 dark:border-gray-700">Contato</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-brand-dark-card">
                                {team.map((member) => {
                                    const boxes = Math.floor(Math.random() * 6); 
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-600">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {member.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {boxes > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        {boxes} caixas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600">
                                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                        Pendente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button 
                                                    onClick={() => handleContact(member.whatsapp)}
                                                    className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-green-400 hover:text-green-600 px-4 py-2 rounded-xl transition-all shadow-sm text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
                                                >
                                                    <ChatIcon className="h-4 w-4" /> Conversar
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

const UniBrotosScreen = ({ user }: { user: Consultant }) => {
     const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    
    // Admin adding video state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: '', url: '', category: 'sales' });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        const { data } = await supabase.from('university_content').select('*').order('created_at', { ascending: false });
        if (data) setVideos(data);
        setLoading(false);
    };

    const getYoutubeEmbed = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id ? `https://www.youtube.com/embed/${id}` : null;
    };

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.url) return;
        await supabase.from('university_content').insert([{
            title: newVideo.title,
            video_url: newVideo.url,
            category: newVideo.category
        }]);
        setIsAddOpen(false);
        fetchVideos();
    }

    const filteredVideos = category === 'all' ? videos : videos.filter(v => v.category === category);
    
    return (
         <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                             <AcademicCapIcon className="h-8 w-8" />
                        </div>
                        UniBrotos
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 ml-14">Universidade Corporativa Brotos da Terra</p>
                </div>
                {user.role === 'admin' && (
                    <button onClick={() => setIsAddOpen(true)} className="bg-brand-green-dark text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-transform">
                        + Adicionar Aula
                    </button>
                )}
            </div>
             
             <div className="flex gap-3 overflow-x-auto pb-4">
                {['all', 'sales', 'products', 'leadership'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                            category === cat 
                            ? 'bg-brand-green-dark text-white border-brand-green-dark shadow-lg shadow-green-900/20' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        {cat === 'all' ? 'Todas as Aulas' : 
                         cat === 'sales' ? 'Técnicas de Venda' :
                         cat === 'products' ? 'Produtos' : 'Liderança'}
                    </button>
                ))}
            </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map(video => {
                    const embedUrl = getYoutubeEmbed(video.video_url);
                    return (
                        <div key={video.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
                            <div className="aspect-video bg-black relative">
                                {embedUrl ? (
                                    <iframe 
                                        src={embedUrl} 
                                        className="w-full h-full" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">Vídeo Indisponível</div>
                                )}
                            </div>
                            <div className="p-6">
                                <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold uppercase tracking-wide mb-3">{video.category}</span>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug group-hover:text-brand-green-mid transition-colors">{video.title}</h3>
                            </div>
                        </div>
                    )
                })}
             </div>
             
              {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Nova Aula</h3>
                        <div className="space-y-4">
                            <input className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Título da Aula" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
                            <input className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Link do YouTube" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} />
                            <select className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})}>
                                <option value="sales">Vendas</option>
                                <option value="products">Produtos</option>
                                <option value="leadership">Liderança</option>
                            </select>
                            <button onClick={handleAddVideo} className="w-full bg-brand-green-mid text-white py-4 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg">Salvar Aula</button>
                            <button onClick={() => setIsAddOpen(false)} className="w-full text-gray-500 py-3 font-medium hover:text-gray-800">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
         </div>
    )
};

const SocialMediaMaterialsScreen = ({ user }: { user: Consultant }) => {
     const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newItem, setNewItem] = useState({ type: 'image', category: 'products', title: '', content: '', image_url: '' });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        const { data } = await supabase.from('marketing_materials').select('*').order('created_at', { ascending: false });
        if (data) setMaterials(data);
        setLoading(false);
    };

    const handleAddItem = async () => {
        const formattedUrl = newItem.type === 'image' ? formatImgurUrl(newItem.image_url) : null;
        
        await supabase.from('marketing_materials').insert([{
            ...newItem,
            image_url: formattedUrl
        }]);
        setIsAddOpen(false);
        fetchMaterials();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza?")) {
            await supabase.from('marketing_materials').delete().eq('id', id);
            fetchMaterials();
        }
    }

    const filteredMaterials = filter === 'all' ? materials : materials.filter(m => m.category === filter);

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-xl text-pink-600 dark:text-pink-400">
                             <PhotoIcon className="h-8 w-8" />
                        </div>
                        Materiais
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 ml-14">Acervo de marketing para suas redes sociais.</p>
                </div>
                {user.role === 'admin' && (
                     <button onClick={() => setIsAddOpen(true)} className="bg-brand-green-dark text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-transform">
                        + Novo Material
                    </button>
                )}
            </div>

            {/* Filters */}
             <div className="flex gap-3 overflow-x-auto pb-4">
                {['all', 'products', 'company', 'texts', 'promo'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filter === f ? 'bg-brand-green-dark text-white border-brand-green-dark shadow-lg shadow-green-900/20' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 shadow-sm'}`}
                    >
                        {f === 'all' ? 'Todos' : f === 'products' ? 'Produtos' : f === 'company' ? 'Empresa' : f === 'texts' ? 'Textos Prontos' : 'Promoções'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {filteredMaterials.map(item => (
                    <div key={item.id} className="bg-white dark:bg-brand-dark-card rounded-[2rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
                        {item.type === 'image' ? (
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Erro+Imagem'}} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <a href={item.image_url} download target="_blank" className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                                        <DownloadIcon className="h-5 w-5" /> Baixar
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 flex-1">
                                <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 italic h-full overflow-y-auto max-h-48 font-serif leading-relaxed shadow-inner">
                                    "{item.content}"
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">{item.title}</h3>
                                <span className="text-xs text-brand-green-mid uppercase font-bold tracking-wider">{item.category}</span>
                            </div>
                            <div className="flex gap-2">
                                {item.type === 'text' && (
                                    <button onClick={() => navigator.clipboard.writeText(item.content)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl transition-colors" title="Copiar Texto">
                                        <ClipboardCopyIcon className="h-5 w-5" />
                                    </button>
                                )}
                                {user.role === 'admin' && (
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 p-3 rounded-xl transition-colors">
                                        <CloseIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
             {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
                         <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Adicionar Material</h3>
                         <div className="space-y-4">
                            <select className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                                <option value="image">Imagem</option>
                                <option value="text">Texto/Script</option>
                            </select>
                            <select className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                                <option value="products">Produtos</option>
                                <option value="company">Empresa</option>
                                <option value="promo">Promoção</option>
                                <option value="texts">Textos Prontos</option>
                            </select>
                            <input className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Título" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                            {newItem.type === 'image' ? (
                                <input className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Link do Imgur" value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})} />
                            ) : (
                                <textarea className="w-full p-4 border rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500" placeholder="Conteúdo" rows={4} value={newItem.content} onChange={e => setNewItem({...newItem, content: e.target.value})} />
                            )}
                            <button onClick={handleAddItem} className="w-full bg-brand-green-mid text-white py-4 rounded-xl font-bold hover:bg-green-500 transition-colors shadow-lg">Salvar</button>
                            <button onClick={() => setIsAddOpen(false)} className="w-full text-gray-500 py-3 font-medium hover:text-gray-800">Cancelar</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    )
};

const MyBusinessManagementScreen = ({ user }: { user: Consultant }) => {
     const myTeam: Consultant[] = [];
    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
             <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                 <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                    <BriefcaseIcon className="h-8 w-8" />
                 </div>
                 Gestão da Minha Rede
            </h2>
             <TeamPerformanceSection team={myTeam} />
        </div>
    )
};

const MyOrdersScreen = ({ user }: { user: Consultant }) => {
    const [orders, setOrders] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('consultant_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data) setOrders(data);
            setLoading(false);
        };
        fetchOrders();
    }, [user.id]);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl text-teal-600 dark:text-teal-400">
                    <PackageIcon className="h-8 w-8" />
                </div>
                Meus Pedidos
            </h2>
            
            <div className="bg-white dark:bg-brand-dark-card rounded-[2rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg shadow-gray-100 dark:shadow-none">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-700">Data</th>
                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-700">Resumo</th>
                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-700">Status</th>
                            <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs text-right border-b border-gray-200 dark:border-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                             <tr><td colSpan={4} className="text-center py-12 text-gray-500">Carregando histórico...</td></tr>
                        ) : orders.length === 0 ? (
                             <tr>
                                 <td colSpan={4} className="text-center py-20">
                                     <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                         <ShoppingCartIcon className="h-8 w-8" />
                                     </div>
                                     <p className="text-gray-900 dark:text-white font-medium text-lg">Nenhum pedido realizado</p>
                                     <p className="text-gray-500 text-sm mt-1">Seus pedidos aparecerão aqui.</p>
                                 </td>
                             </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-8 py-5 text-gray-700 dark:text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">{order.quantity} Caixas</td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Confirmado
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NewOrderScreen = ({ onClose, user }: { onClose: () => void, user: Consultant }) => {
    const [step, setStep] = useState(1);
    const [boxes, setBoxes] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix'>('whatsapp');
    const [showFreeShippingToast, setShowFreeShippingToast] = useState(false);
    
    const pricePerBox = 210;
    const total = boxes * pricePerBox;
    const shipping = boxes >= 4 ? 0 : 35;

    useEffect(() => {
        if (boxes === 4) {
            setShowFreeShippingToast(true);
            const timer = setTimeout(() => setShowFreeShippingToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [boxes]);

    const handleGeneratePix = async () => {
        setStep(3); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-brand-dark-card rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border border-gray-200 dark:border-white/10">
                 {showFreeShippingToast && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-slide-up flex items-center gap-2 font-bold">
                        <SparklesIcon className="h-5 w-5 text-yellow-300" />
                        <span>Frete Grátis Liberado!</span>
                    </div>
                )}
                
                <div className="bg-brand-green-dark p-6 flex justify-between items-center text-white">
                    <h3 className="font-serif font-bold text-xl flex items-center gap-3">
                        <ShoppingCartIcon className="h-6 w-6 opacity-80" /> Novo Pedido
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors"><CloseIcon className="h-6 w-6 text-white" /></button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                     {step === 1 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800">
                                <div className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm">
                                    <PackageIcon className="h-12 w-12 text-green-700 dark:text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Caixa de Pomada Copaíba (12 un)</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Preço de revenda sugerido: R$ 35,00/un</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="font-bold text-2xl text-brand-green-mid">R$ 210,00</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Atacado</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Quantidade</label>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setBoxes(Math.max(1, boxes - 1))} className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors text-gray-600 dark:text-gray-300">-</button>
                                    <span className="text-4xl font-serif font-bold w-16 text-center text-gray-900 dark:text-white">{boxes}</span>
                                    <button onClick={() => setBoxes(boxes + 1)} className="w-14 h-14 rounded-2xl bg-brand-green-mid text-white hover:bg-green-500 flex items-center justify-center text-2xl font-bold transition-colors shadow-lg shadow-green-500/30">+</button>
                                </div>
                            </div>

                            {boxes < 4 ? (
                                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-4 rounded-2xl text-sm flex items-center gap-3 font-medium">
                                    <TruckIcon className="h-5 w-5" />
                                    Faltam <strong>{4 - boxes} caixas</strong> para FRETE GRÁTIS!
                                </div>
                            ) : (
                                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-2xl text-sm flex items-center gap-3 font-bold">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Frete Grátis Aplicado!
                                </div>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                                    <span>Frete</span>
                                    <span>{shipping === 0 ? <span className="text-green-500 font-bold">GRÁTIS</span> : formatCurrency(shipping)}</span>
                                </div>
                                <div className="flex justify-between text-3xl font-serif font-bold text-gray-900 dark:text-white pt-4">
                                    <span>Total</span>
                                    <span>{formatCurrency(total + shipping)}</span>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full bg-brand-green-mid text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-500 transition-all shadow-xl shadow-green-500/20">
                                Continuar para Pagamento
                            </button>
                        </div>
                    )}
                    
                    {step === 2 && (
                         <div className="space-y-8">
                            <h4 className="font-serif font-bold text-2xl text-gray-900 dark:text-white text-center">Como deseja pagar?</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('whatsapp')}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-transparent'}`}
                                >
                                    <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full"><HandshakeIcon className="h-8 w-8 text-green-600 dark:text-green-400" /></div>
                                    <span className="font-bold text-gray-900 dark:text-white">Negociar no WhatsApp</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${paymentMethod === 'pix' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-transparent'}`}
                                >
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full"><QrCodeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
                                    <span className="font-bold text-gray-900 dark:text-white">Pagar Agora (Pix)</span>
                                </button>
                            </div>

                             {paymentMethod === 'whatsapp' ? (
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-sm text-gray-600 dark:text-gray-300 text-center border border-gray-100 dark:border-gray-700">
                                    Você será redirecionado para o WhatsApp da central para finalizar o pedido com um atendente humano.
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl text-sm text-blue-800 dark:text-blue-200 text-center border border-blue-100 dark:border-blue-800/30">
                                    Gera um QR Code Pix instantâneo para pagamento automático. Seu pedido é aprovado na hora.
                                </div>
                            )}

                             <div className="flex gap-4 mt-8">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">Voltar</button>
                                <button 
                                    onClick={() => paymentMethod === 'whatsapp' ? window.open(`https://wa.me/5511999999999?text=Olá, quero pedir ${boxes} caixas. ID: ${user.id}`, '_blank') : handleGeneratePix()} 
                                    className="flex-[2] py-4 bg-brand-green-mid text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:bg-green-500 transition-all"
                                >
                                    {paymentMethod === 'whatsapp' ? 'Abrir WhatsApp' : 'Gerar Pix'}
                                </button>
                            </div>
                         </div>
                    )}

                    {step === 3 && (
                         <div className="text-center space-y-8">
                             <div className="mx-auto w-64 h-64 bg-white p-4 rounded-3xl shadow-xl flex items-center justify-center border border-gray-100">
                                 <QrCodeIcon className="h-56 w-56 text-gray-800" />
                             </div>
                             <div>
                                 <p className="font-serif font-bold text-4xl text-brand-green-dark dark:text-white">{formatCurrency(total + shipping)}</p>
                                 <p className="text-gray-500 mt-2 font-medium">Escaneie o QR Code ou copie o código abaixo</p>
                             </div>
                             <div className="flex gap-3">
                                 <input readOnly value="00020126580014BR.GOV.BCB.PIX0136..." className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 text-sm text-gray-600 dark:text-gray-300 font-mono font-medium" />
                                 <button className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-6 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors">Copiar</button>
                             </div>
                             <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 underline font-medium">Fechar e Aguardar Confirmação</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DashboardShell = ({ user, onLogout }: { user: Consultant, onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    const myTeam: Consultant[] = []; 

    let displayRole = 'Consultor';
    if (user.role === 'admin') displayRole = 'Administrador Geral';
    else if (user.role === 'leader') displayRole = 'Líder / Distribuidor';
    else if (myTeam.length > 0) displayRole = 'Distribuidor em Qualificação';

    const NavItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group mb-1 ${
                activeTab === id 
                ? 'bg-brand-green-dark text-white font-bold shadow-lg shadow-green-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-green-dark dark:hover:text-white font-medium'
            }`}
        >
            <Icon className={`h-6 w-6 transition-colors ${activeTab === id ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-brand-green-dark dark:group-hover:text-white'}`} />
            <span className="text-sm tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-brand-dark-bg transition-colors duration-500 font-sans">
            <FloatingThemeToggle />

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-brand-dark-card border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-30 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-y-auto">
                <div className="p-10 flex flex-col items-center">
                    <BrandLogo className="h-16 w-auto mb-6 drop-shadow-md" />
                    <div className="bg-green-50 dark:bg-green-900/30 text-brand-green-dark dark:text-green-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-center border border-green-100 dark:border-green-800">
                        {displayRole}
                    </div>
                    <a 
                        href={`${window.location.origin}?store=${user.id}`}
                        target="_blank"
                        className="mt-3 text-xs text-gray-500 hover:text-brand-green-mid flex items-center gap-1 transition-colors font-medium"
                    >
                        <StoreIcon className="h-3 w-3" /> Minha Loja Pública
                    </a>
                </div>
                
                <div className="px-6 pb-6">
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-4 mb-8 flex items-center gap-4 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                        <div className="h-12 w-12 rounded-xl bg-brand-earth flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-orange-900/10">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate font-medium">ID: {user.id}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <NavItem id="overview" label="Visão Geral" icon={ChartBarIcon} />
                        <NavItem id="materials" label="Materiais" icon={PhotoIcon} />
                        <NavItem id="unibrotos" label="UniBrotos" icon={AcademicCapIcon} />
                        <NavItem id="my-orders" label="Meus Pedidos" icon={PackageIcon} />
                        
                        <button 
                            onClick={() => setIsNewOrderOpen(true)}
                            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold mt-6 mb-6 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]"
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            <span className="text-sm tracking-wide">Fazer Pedido</span>
                        </button>

                        <div className="px-6 pb-3 pt-2">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Expansão</p>
                        </div>

                         <button 
                            onClick={() => setIsInviteOpen(true)}
                            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 font-medium"
                        >
                            <ShareIcon className="h-6 w-6 text-gray-400" />
                            <span className="text-sm">Convidar Consultor</span>
                        </button>

                        {(user.role === 'admin' || myTeam.length > 0) && (
                             <NavItem id="business" label="Meu Negócio" icon={BriefcaseIcon} />
                        )}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-bold py-2">
                        <LogoutIcon className="h-5 w-5" /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scroll-smooth">
                {/* Header Mobile */}
                <header className="lg:hidden bg-white/90 dark:bg-brand-dark-card/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <MenuIcon />
                        </button>
                        <BrandLogo className="h-10 w-auto" />
                    </div>
                     <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 relative">
                        <BellIcon />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </button>
                </header>

                {/* Mobile Menu Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-brand-dark-card shadow-2xl p-6 flex flex-col overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <BrandLogo className="h-10 w-auto" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="h-10 w-10 rounded-full bg-brand-earth flex items-center justify-center text-white font-bold shadow-md">{user.name.charAt(0)}</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">ID: {user.id}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <NavItem id="overview" label="Visão Geral" icon={ChartBarIcon} />
                                <NavItem id="materials" label="Materiais" icon={PhotoIcon} />
                                <NavItem id="unibrotos" label="UniBrotos" icon={AcademicCapIcon} />
                                <NavItem id="my-orders" label="Meus Pedidos" icon={PackageIcon} />
                                
                                <button 
                                    onClick={() => { setIsNewOrderOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 font-bold mt-4 shadow-lg"
                                >
                                    <ShoppingCartIcon className="h-6 w-6" />
                                    <span>Fazer Pedido</span>
                                </button>

                                <div className="pt-6 pb-2">
                                     <p className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Expansão</p>
                                </div>

                                 <button 
                                    onClick={() => { setIsInviteOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                                >
                                    <ShareIcon className="h-6 w-6 text-gray-400" />
                                    <span className="text-sm">Convidar Consultor</span>
                                </button>

                                {(user.role === 'admin' || myTeam.length > 0) && (
                                    <NavItem id="business" label="Meu Negócio" icon={BriefcaseIcon} />
                                )}
                            </nav>
                             <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6">
                                <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 font-bold hover:text-red-500 transition-colors">
                                    <LogoutIcon className="h-5 w-5" /> Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Body */}
                <div className="p-6 md:p-12 max-w-[1600px] mx-auto w-full animate-fade-in pb-24">
                    
                    {activeTab === 'overview' && (
                        <>
                             <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-green-dark dark:text-white mb-2">
                                        Olá, {user.name.split(' ')[0]}! <span className="inline-block animate-float">👋</span>
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                                        Bem-vindo ao seu painel de controle <span className="font-serif font-bold italic text-brand-earth">Nano Pro</span>.
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-2xl shadow-sm text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <BusinessModelSection 
                                onRequestInvite={() => { setIsInviteOpen(true); }}
                                onRequestOrder={() => setIsNewOrderOpen(true)}
                            />
                            
                            <EarningsSimulator />
                        </>
                    )}

                    {activeTab === 'materials' && <SocialMediaMaterialsScreen user={user} />}
                    
                    {activeTab === 'unibrotos' && <UniBrotosScreen user={user} />}
                    
                    {activeTab === 'my-orders' && <MyOrdersScreen user={user} />}

                    {activeTab === 'business' && <MyBusinessManagementScreen user={user} />}
                </div>
            </main>

            {isNewOrderOpen && <NewOrderScreen user={user} onClose={() => setIsNewOrderOpen(false)} />}
            {isInviteOpen && <InviteModal user={user} onClose={() => setIsInviteOpen(false)} />}

        </div>
    );
};

export const ConsultantApp = () => {
    const [user, setUser] = useState<Consultant | null>(null);
    const [view, setView] = useState<'login' | 'register' | 'store'>('login');
    const [storeId, setStoreId] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check for store link
        const params = new URLSearchParams(window.location.search);
        const storeParam = params.get('store');
        if (storeParam) {
            setStoreId(storeParam);
            setView('store');
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogin = (consultant: Consultant) => {
        setUser(consultant);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setView('login');
    };

    const renderView = () => {
         if (view === 'store') return <PublicStoreScreen consultantId={storeId} />;
         if (user) return <DashboardShell user={user} onLogout={handleLogout} />;
         if (view === 'register') return <RegisterScreen onBackToLogin={() => setView('login')} />;
         return <LoginScreen onLogin={handleLogin} onRegisterClick={() => setView('register')} />;
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <div className={isDarkMode ? 'dark' : ''}>
                {renderView()}
            </div>
        </ThemeContext.Provider>
    );
};