
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
    SparklesIcon
} from './components/Icons';
import { Consultant, ConsultantStats, Sale, Notification, PrivateCustomer, PrivateSale } from './types';

// --- Theme Context ---
const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => {}
});

const useTheme = () => useContext(ThemeContext);

// --- Helper Functions ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

// Helper to format Imgur URLs to direct image links
const formatImgurUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('i.imgur.com')) return url; // Already direct link
    if (url.includes('imgur.com')) {
        // Extract ID and append .png (default guess)
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
    const [showAdminSetup, setShowAdminSetup] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Buscar o email associado ao ID na tabela pública
            const { data: consultant, error: consultantError } = await supabase
                .from('consultants')
                .select('*')
                .eq('id', id)
                .single();

            if (consultantError || !consultant) {
                throw new Error('ID de consultor não encontrado.');
            }

            // 2. Fazer login no Auth do Supabase usando o email recuperado
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

    const handleAdminSetup = async () => {
        setLoading(true);
        try {
           const { data, error } = await supabase.auth.signUp({
                email: 'admin@brotos.com',
                password: 'jo1234',
                options: {
                    data: { full_name: 'Administrador Principal' }
                }
            });
            
            if (error) throw error;

            if (data.user) {
                 const { error: profileError } = await supabase
                .from('consultants')
                .insert([
                    {
                        id: '000000',
                        auth_id: data.user.id,
                        name: 'Administrador Brotos',
                        email: 'admin@brotos.com',
                        whatsapp: '00000000000',
                        role: 'admin',
                        address: 'Matriz'
                    }
                ]);
                if (profileError) throw profileError;
                alert("Admin criado! Use ID 000000 e senha jo1234");
            }
        } catch (err: any) {
            alert("Erro ao criar admin: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-dark to-brand-green-mid p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <LeafIcon />
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
                <div className="flex justify-center mb-6">
                    <BrandLogo className="h-20 w-auto" />
                </div>
                
                <h2 className="text-3xl font-serif font-bold text-center text-brand-green-dark mb-2">Clube Brotos 🌱</h2>
                <p className="text-center text-gray-600 mb-8">Área restrita para consultores.</p>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID DE CONSULTOR</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCircleIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Ex: 014923"
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:border-brand-green-mid focus:ring-brand-green-mid transition-all py-3"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SUA SENHA</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BriefcaseIcon />
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••"
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:border-brand-green-mid focus:ring-brand-green-mid transition-all py-3"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-green-dark hover:bg-brand-green-mid focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-mid disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Entrando...' : 'Entrar no Sistema'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                     <p className="text-sm text-gray-600">
                        Ainda não é consultor?{' '}
                        <button onClick={onRegisterClick} className="font-medium text-brand-green-dark hover:text-brand-green-mid underline">
                            Cadastre-se aqui
                        </button>
                    </p>
                </div>
                 <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                     <button 
                        onClick={() => setShowAdminSetup(!showAdminSetup)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                     >
                        Opções Avançadas
                     </button>
                     {showAdminSetup && (
                         <div className="mt-2">
                            <button 
                                onClick={handleAdminSetup}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                Configurar Admin (Primeiro Acesso)
                            </button>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

const RegisterScreen = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        sponsorId: '' // ID de quem convidou
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [generatedId, setGeneratedId] = useState('');

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
            // 1. Criar usuário no Authentication do Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Gerar um ID de consultor aleatório (ex: 054321)
                const randomId = Math.floor(100000 + Math.random() * 900000).toString();
                
                // 3. Salvar dados na tabela pública 'consultants'
                const { error: dbError } = await supabase
                    .from('consultants')
                    .insert([
                        {
                            id: randomId,
                            auth_id: authData.user.id,
                            name: formData.name,
                            email: formData.email,
                            whatsapp: formData.whatsapp,
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
                    <p className="text-gray-600 mb-6">Bem-vindo(a) à família Brotos da Terra.</p>
                    
                    <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
                        <p className="text-sm text-green-800 mb-1">Seu ID de Acesso é:</p>
                        <p className="text-3xl font-bold text-brand-green-dark tracking-widest">{generatedId}</p>
                        <p className="text-xs text-green-600 mt-2">Anote este número, você precisará dele para entrar.</p>
                    </div>

                    <button 
                        onClick={onBackToLogin}
                        className="w-full py-3 px-4 bg-brand-green-dark text-white rounded-lg hover:bg-brand-green-mid transition-colors font-medium"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <button onClick={onBackToLogin} className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                    ← Voltar para Login
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Cadastro</h2>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                        name="name"
                        type="text" 
                        placeholder="Nome Completo"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                        required
                    />
                    <input 
                        name="email"
                        type="email" 
                        placeholder="E-mail"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                        required
                    />
                    <input 
                        name="whatsapp"
                        type="text" 
                        placeholder="WhatsApp (com DDD)"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                        required
                    />
                    <input 
                        name="sponsorId"
                        type="text" 
                        placeholder="ID do Patrocinador (Quem indicou)"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                    />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Crie uma Senha"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                        required
                    />
                    <input 
                        name="confirmPassword"
                        type="password" 
                        placeholder="Confirme a Senha"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3"
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-brand-green-dark text-white rounded-lg hover:bg-brand-green-mid transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Inner Dashboard Components ---

const BusinessModelSection = ({ onRequestInvite, onRequestOrder }: { onRequestInvite: () => void, onRequestOrder: () => void }) => {
    const [activeTab, setActiveTab] = useState<'sales' | 'leadership'>('sales');

    return (
        <div className="bg-brand-green-dark rounded-3xl p-8 shadow-lg border border-green-800 relative overflow-hidden mb-8 text-white">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <PackageIcon className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-white mb-4">Faça seu negócio do seu jeito</h3>
                    <p className="text-green-100 mb-8 text-lg leading-relaxed max-w-md">
                        A liberdade é o nosso principal pilar. Você escolhe como quer atuar:
                        apenas com vendas diretas focadas em lucro rápido, ou construindo um
                        legado através da formação de equipes.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                         <button 
                            onClick={onRequestOrder}
                            className="bg-white text-brand-green-dark px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-lg"
                         >
                            <ShoppingCartIcon className="h-5 w-5" /> Venda Direta
                         </button>
                         <button 
                            onClick={onRequestInvite}
                            className="bg-green-700/50 backdrop-blur-sm text-white border border-green-500/50 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-600/50 transition-colors"
                         >
                            <UsersIcon className="h-5 w-5" /> Construção de Time
                         </button>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex space-x-2 mb-4 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'sales' ? 'bg-white text-brand-green-dark shadow' : 'text-green-200 hover:text-white'}`}
                        >
                            Revenda
                        </button>
                        <button
                             onClick={() => setActiveTab('leadership')}
                             className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'leadership' ? 'bg-white text-brand-green-dark shadow' : 'text-green-200 hover:text-white'}`}
                        >
                            Liderança
                        </button>
                    </div>
                    
                    {activeTab === 'sales' ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <div className="bg-green-500/20 p-2 rounded-lg"><TagIcon className="h-5 w-5 text-green-300" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Lucro de 100%</h4>
                                    <p className="text-sm text-green-200">Compre por R$ 17,50, venda por R$ 35,00.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-green-500/20 p-2 rounded-lg"><TruckIcon className="h-5 w-5 text-green-300" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Entregas Rápidas</h4>
                                    <p className="text-sm text-green-200">Receba produtos em casa para pronta entrega.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg"><TrendingUpIcon className="h-5 w-5 text-blue-300" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Bônus de Equipe</h4>
                                    <p className="text-sm text-green-200">Ganhe comissão sobre as vendas dos indicados.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg"><AcademicCapIcon className="h-5 w-5 text-blue-300" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Mentoria Exclusiva</h4>
                                    <p className="text-sm text-green-200">Acesso a treinamentos de liderança.</p>
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
    const [goal, setGoal] = useState(1500); // Meta mensal
    const profitPerUnit = 17.50; // Lucro por pomada (Venda 35 - Custo 17.50)
    const unitsPerDay = Math.ceil((goal / profitPerUnit) / 26); // 26 dias úteis

    const calculateEarnings = (units: number) => {
        return units * profitPerUnit * 26;
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-sm border border-green-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <SparklesIcon className="w-64 h-64 text-green-400" />
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold text-green-900 dark:text-white mb-2">Seja dona do seu próprio negócio.</h3>
                <p className="text-green-800 dark:text-gray-300 mb-6 max-w-lg">
                    Você define onde vai atuar, quanto tempo vai dedicar ao seu negócio e quanto quer ganhar.
                </p>

                <div className="flex items-center gap-2 mb-6 font-bold text-green-700 dark:text-green-400 text-sm uppercase tracking-wider">
                    <BanknotesIcon className="h-5 w-5" />
                    VEJA AS POSSIBILIDADES DE GANHO QUE VOCÊ PODERÁ TER NO MÊS.
                </div>

                {/* Cards Interativos */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[2, 5, 10].map((units) => (
                        <div key={units} className="bg-white/80 dark:bg-gray-700/80 backdrop-blur p-4 rounded-xl border border-green-100 dark:border-gray-600 hover:shadow-md transition-all group cursor-default">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Venda <strong className="text-green-800 dark:text-green-300">{units}</strong> pomadas por dia</p>
                            <p className="text-xl font-bold text-green-700 dark:text-white group-hover:scale-105 transition-transform">
                                Ganhe {formatCurrency(calculateEarnings(units))}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-green-200 dark:border-gray-600 pt-6">
                    <p className="text-center font-medium text-green-900 dark:text-white mb-4">
                        Quanto você gostaria de ganhar por mês na Brotos da Terra?
                    </p>
                    
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-inner max-w-2xl mx-auto">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCurrency(goal)}</span>
                            <div className="text-right">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase">Sua meta de vendas</span>
                                <span className="text-lg font-bold text-gray-800 dark:text-white">~{unitsPerDay} pomadas / dia</span>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="500" 
                            max="6000" 
                            step="100" 
                            value={goal} 
                            onChange={(e) => setGoal(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
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
    const teamSales = team.reduce((acc, member) => acc + (Math.random() > 0.5 ? 2 : 0), 0); // Simulação
    const bonus = teamSales * 5; // 5 reais por caixa

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                    Minha Equipe
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                    {team.length} Indicados
                </span>
            </div>

            {team.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Você ainda não tem indicados.</p>
                    <p className="text-sm">Convide pessoas para começar a ganhar bônus de equipe.</p>
                </div>
            ) : (
                <>
                     <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white mb-6 flex justify-between items-center shadow-lg shadow-blue-200 dark:shadow-none">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Bônus Estimado (Mês)</p>
                            <p className="text-2xl font-bold">{formatCurrency(bonus)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Vendas da Equipe</p>
                            <p className="text-xl font-bold">{teamSales} Caixas</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Nome / ID</th>
                                    <th className="px-4 py-3">Pedido (Mês)</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {team.map((member) => {
                                    // Simulação de status de pedido
                                    const boxes = Math.floor(Math.random() * 6); // 0 a 5
                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {member.name}
                                                <span className="block text-xs text-gray-400">ID: {member.id}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {boxes > 0 ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                                                        {boxes} caixas
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                        Sem pedido
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <a 
                                                    href={`https://wa.me/${member.whatsapp}`} 
                                                    target="_blank" 
                                                    className="text-green-600 hover:text-green-700 font-medium text-xs flex items-center justify-end gap-1"
                                                >
                                                    WhatsApp
                                                </a>
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

// --- UniBrotos & Materials Screens ---

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
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <AcademicCapIcon className="h-8 w-8 text-brand-green-dark" />
                        UniBrotos
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Universidade Corporativa Brotos da Terra</p>
                </div>
                {user.role === 'admin' && (
                    <button onClick={() => setIsAddOpen(true)} className="bg-brand-green-dark text-white px-4 py-2 rounded-lg text-sm">
                        + Adicionar Aula
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'sales', 'products', 'leadership'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            category === cat 
                            ? 'bg-brand-green-dark text-white' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {cat === 'all' ? 'Todas as Aulas' : 
                         cat === 'sales' ? 'Técnicas de Venda' :
                         cat === 'products' ? 'Produtos' : 'Liderança'}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Carregando aulas...</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map(video => {
                        const embedUrl = getYoutubeEmbed(video.video_url);
                        return (
                            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                                <div className="aspect-video bg-black">
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
                                <div className="p-4">
                                    <span className="text-xs font-bold text-brand-green-mid uppercase tracking-wide">{video.category}</span>
                                    <h3 className="font-bold text-gray-900 dark:text-white mt-1 line-clamp-2">{video.title}</h3>
                                </div>
                            </div>
                        )
                    })}
                    {filteredVideos.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl">
                            <PlayCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma aula encontrada nesta categoria.</p>
                        </div>
                    )}
                </div>
            )}

            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Nova Aula</h3>
                        <div className="space-y-4">
                            <input className="w-full p-2 border rounded dark:bg-gray-700" placeholder="Título da Aula" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
                            <input className="w-full p-2 border rounded dark:bg-gray-700" placeholder="Link do YouTube" value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} />
                            <select className="w-full p-2 border rounded dark:bg-gray-700" value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})}>
                                <option value="sales">Vendas</option>
                                <option value="products">Produtos</option>
                                <option value="leadership">Liderança</option>
                            </select>
                            <button onClick={handleAddVideo} className="w-full bg-green-600 text-white py-2 rounded">Salvar</button>
                            <button onClick={() => setIsAddOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SocialMediaMaterialsScreen = ({ user }: { user: Consultant }) => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Admin state
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
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Materiais para Redes Sociais</h2>
                    <p className="text-gray-600 dark:text-gray-400">Posts, cards e conteúdos prontos para você divulgar.</p>
                </div>
                {user.role === 'admin' && (
                    <button onClick={() => setIsAddOpen(true)} className="bg-brand-green-dark text-white px-4 py-2 rounded-lg text-sm">
                        + Novo Material
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'products', 'company', 'texts', 'promo'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-brand-green-dark text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-600'}`}
                    >
                        {f === 'all' ? 'Todos' : f === 'products' ? 'Produtos' : f === 'company' ? 'Empresa' : f === 'texts' ? 'Textos Prontos' : 'Promoções'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {filteredMaterials.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                        {item.type === 'image' ? (
                            <div className="aspect-square bg-gray-100 relative group">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Erro+Imagem'}} />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a href={item.image_url} download target="_blank" className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                                        <DownloadIcon className="h-4 w-4" /> Baixar
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex-1">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 italic h-full overflow-y-auto max-h-48">
                                    "{item.content}"
                                </div>
                            </div>
                        )}
                        
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm">{item.title}</h3>
                                <span className="text-xs text-gray-500 uppercase">{item.category}</span>
                            </div>
                            <div className="flex gap-2">
                                {item.type === 'text' && (
                                    <button onClick={() => navigator.clipboard.writeText(item.content)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Copiar Texto">
                                        <ClipboardCopyIcon />
                                    </button>
                                )}
                                {user.role === 'admin' && (
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                        <CloseIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Adicionar Material</h3>
                        <div className="space-y-4">
                            <select className="w-full p-2 border rounded" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                                <option value="image">Imagem</option>
                                <option value="text">Texto/Script</option>
                            </select>
                            <select className="w-full p-2 border rounded" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                                <option value="products">Produtos</option>
                                <option value="company">Empresa</option>
                                <option value="promo">Promoção</option>
                                <option value="texts">Textos Prontos</option>
                            </select>
                            <input className="w-full p-2 border rounded" placeholder="Título" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                            
                            {newItem.type === 'image' ? (
                                <input className="w-full p-2 border rounded" placeholder="Link do Imgur (Ex: https://imgur.com/abc)" value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})} />
                            ) : (
                                <textarea className="w-full p-2 border rounded" placeholder="Conteúdo do texto" rows={4} value={newItem.content} onChange={e => setNewItem({...newItem, content: e.target.value})} />
                            )}

                            <button onClick={handleAddItem} className="w-full bg-green-600 text-white py-2 rounded">Salvar</button>
                            <button onClick={() => setIsAddOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyBusinessManagementScreen = ({ user }: { user: Consultant }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'stock'>('overview');
    const [sales, setSales] = useState<PrivateSale[]>([]);
    const [customers, setCustomers] = useState<PrivateCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialStock, setInitialStock] = useState(0);

    // States for modals
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    
    // Form states
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', notes: '' });
    const [newSale, setNewSale] = useState({ customerId: '', quantity: 1, price: 35.00 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch customers
        const { data: custData } = await supabase.from('private_customers').select('*');
        if (custData) setCustomers(custData);

        // Fetch sales
        const { data: saleData } = await supabase.from('private_sales').select('*');
        if (saleData) setSales(saleData);

        // Mock fetching stock from main system purchases (this would be a real query in prod)
        // For now, assume consultant bought 50 units total
        setInitialStock(50); 
        
        setLoading(false);
    };

    const handleAddCustomer = async () => {
        await supabase.from('private_customers').insert([{
            consultant_id: user.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            notes: newCustomer.notes
        }]);
        setIsCustomerModalOpen(false);
        fetchData();
    };

    const handleAddSale = async () => {
        await supabase.from('private_sales').insert([{
            consultant_id: user.id,
            customer_id: newSale.customerId || null,
            quantity: newSale.quantity,
            sale_price: newSale.price,
            product_name: 'Pomada Copaíba'
        }]);
        setIsSaleModalOpen(false);
        fetchData();
    };

    const totalSalesValue = sales.reduce((acc, curr) => acc + (curr.sale_price * curr.quantity), 0);
    const totalSoldUnits = sales.reduce((acc, curr) => acc + curr.quantity, 0);
    const currentStock = initialStock - totalSoldUnits;
    const estimatedProfit = totalSalesValue - (totalSoldUnits * 17.50); // Cost 17.50

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <BriefcaseIcon className="h-8 w-8 text-brand-green-dark" />
                Gestão do Meu Negócio
            </h2>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <button onClick={() => setActiveTab('overview')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'overview' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-green-700"><PresentationChartLineIcon /></div>
                    <p className="text-sm text-gray-500">Lucro Estimado</p>
                    <p className="font-bold text-lg text-green-700">{formatCurrency(estimatedProfit)}</p>
                </button>
                 <button onClick={() => setActiveTab('sales')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'sales' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-blue-700"><CurrencyDollarIcon /></div>
                    <p className="text-sm text-gray-500">Vendas Totais</p>
                    <p className="font-bold text-lg">{formatCurrency(totalSalesValue)}</p>
                </button>
                 <button onClick={() => setActiveTab('customers')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'customers' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-purple-700"><UsersIcon /></div>
                    <p className="text-sm text-gray-500">Clientes</p>
                    <p className="font-bold text-lg">{customers.length}</p>
                </button>
                 <button onClick={() => setActiveTab('stock')} className={`p-4 rounded-xl border text-left transition-all ${activeTab === 'stock' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-orange-700"><PackageIcon /></div>
                    <p className="text-sm text-gray-500">Estoque Atual</p>
                    <p className="font-bold text-lg">{currentStock} un</p>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 min-h-[400px] p-6">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="text-center py-10">
                        <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                            <ChartBarIcon className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Resumo do Negócio</h3>
                        <p className="text-gray-500 mb-6">Use as abas acima para gerenciar suas vendas e clientes.</p>
                        <button onClick={() => setIsSaleModalOpen(true)} className="bg-brand-green-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-green-mid">
                            Registrar Nova Venda
                        </button>
                    </div>
                )}

                {/* SALES TAB */}
                {activeTab === 'sales' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Histórico de Vendas</h3>
                            <button onClick={() => setIsSaleModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Nova Venda</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Data</th>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Qtd</th>
                                        <th className="px-4 py-3 text-right rounded-r-lg">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {sales.map((sale) => {
                                        const client = customers.find(c => c.id === sale.customer_id);
                                        return (
                                            <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(sale.sale_date || sale.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{client ? client.name : 'Venda Avulsa'}</td>
                                                <td className="px-4 py-3">{sale.quantity}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(sale.sale_price * sale.quantity)}</td>
                                            </tr>
                                        )
                                    })}
                                    {sales.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma venda registrada.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CUSTOMERS TAB */}
                {activeTab === 'customers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Meus Clientes</h3>
                            <button onClick={() => setIsCustomerModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Novo Cliente</button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {customers.map(customer => (
                                <div key={customer.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{customer.name}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                    <a href={`https://wa.me/${customer.phone?.replace(/\D/g,'')}`} target="_blank" className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-100">
                                        <span className="text-xs font-bold">WhatsApp</span>
                                    </a>
                                </div>
                            ))}
                             {customers.length === 0 && <p className="col-span-2 text-center py-8 text-gray-400">Nenhum cliente cadastrado.</p>}
                        </div>
                    </div>
                )}

                {/* STOCK TAB */}
                {activeTab === 'stock' && (
                    <div className="text-center py-12">
                        <div className="inline-block p-6 bg-orange-50 rounded-full mb-4">
                            <PackageIcon className="h-16 w-16 text-orange-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{currentStock} Unidades</h3>
                        <p className="text-gray-500">Disponíveis em estoque físico</p>
                        <div className="mt-8 max-w-md mx-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-left">
                            <div className="flex justify-between mb-2"><span>Estoque Inicial (Compras):</span> <span className="font-bold">{initialStock}</span></div>
                            <div className="flex justify-between text-red-500"><span>Vendas Realizadas:</span> <span className="font-bold">-{totalSoldUnits}</span></div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Saldo Atual:</span> <span>{currentStock}</span></div>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD CUSTOMER MODAL */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Novo Cliente</h3>
                        <div className="space-y-4">
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nome do Cliente" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Telefone / WhatsApp" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Observações (Opcional)" value={newCustomer.notes} onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})} />
                            <button onClick={handleAddCustomer} className="w-full bg-purple-600 text-white py-2 rounded font-medium">Salvar Cliente</button>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD SALE MODAL */}
            {isSaleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Registrar Venda</h3>
                        <div className="space-y-4">
                             <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newSale.customerId} onChange={e => setNewSale({...newSale, customerId: e.target.value})}>
                                <option value="">Venda Avulsa (Sem Cadastro)</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Quantidade</label>
                                    <input type="number" min="1" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newSale.quantity} onChange={e => setNewSale({...newSale, quantity: Number(e.target.value)})} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Preço Unitário (R$)</label>
                                    <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newSale.price} onChange={e => setNewSale({...newSale, price: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-right font-bold text-gray-900 dark:text-white">
                                Total: {formatCurrency(newSale.quantity * newSale.price)}
                            </div>
                            <button onClick={handleAddSale} className="w-full bg-blue-600 text-white py-2 rounded font-medium">Confirmar Venda</button>
                            <button onClick={() => setIsSaleModalOpen(false)} className="w-full text-gray-500 py-2">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

const NewOrderScreen = ({ onClose, user }: { onClose: () => void, user: Consultant }) => {
    const [step, setStep] = useState(1);
    const [boxes, setBoxes] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix'>('whatsapp');
    
    const pricePerBox = 210;
    const total = boxes * pricePerBox;
    const shipping = boxes >= 4 ? 0 : 35;

    // InfinitePay Logic (Mock)
    const handleGeneratePix = async () => {
        setStep(3); // Show Pix QR Code
        // In real app, call API here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-brand-green-dark p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" /> Novo Pedido
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1"><CloseIcon className="h-6 w-6 text-white" /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                                <PackageIcon className="h-10 w-10 text-green-700" />
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">Caixa de Pomada Copaíba (12 un)</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Preço de revenda sugerido: R$ 35,00/un</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="font-bold text-xl text-green-700">R$ 210,00</p>
                                    <p className="text-xs text-gray-500">R$ 17,50 / unidade</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block font-medium text-gray-700 dark:text-gray-300">Quantidade de Caixas</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBoxes(Math.max(1, boxes - 1))} className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold">-</button>
                                    <span className="text-2xl font-bold w-12 text-center">{boxes}</span>
                                    <button onClick={() => setBoxes(boxes + 1)} className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-800 flex items-center justify-center text-xl font-bold">+</button>
                                </div>
                            </div>

                            {boxes < 4 && (
                                <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <TruckIcon />
                                    Faltam {4 - boxes} caixas para FRETE GRÁTIS!
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span>{shipping === 0 ? <span className="text-green-600 font-bold">GRÁTIS</span> : formatCurrency(shipping)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                                    <span>Total a Pagar</span>
                                    <span>{formatCurrency(total + shipping)}</span>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full bg-brand-green-dark text-white py-3 rounded-xl font-bold hover:bg-brand-green-mid transition-colors">
                                Continuar para Pagamento
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h4 className="font-bold text-lg mb-4">Como deseja pagar?</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('whatsapp')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                >
                                    <div className="bg-green-100 p-2 rounded-full"><HandshakeIcon className="h-6 w-6 text-green-600" /></div>
                                    <span className="font-bold text-sm">Negociar no WhatsApp</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'pix' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                >
                                    <div className="bg-blue-100 p-2 rounded-full"><QrCodeIcon className="h-6 w-6 text-blue-600" /></div>
                                    <span className="font-bold text-sm">Pagar Agora (Pix)</span>
                                </button>
                            </div>

                            {paymentMethod === 'whatsapp' ? (
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                                    Você será redirecionado para o WhatsApp da central para finalizar o pedido com um atendente.
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                    Gera um QR Code Pix instantâneo para pagamento automático. Seu pedido é aprovado na hora.
                                </div>
                            )}

                            <div className="flex gap-3 mt-auto">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl">Voltar</button>
                                <button 
                                    onClick={() => paymentMethod === 'whatsapp' ? window.open(`https://wa.me/5511999999999?text=Olá, quero pedir ${boxes} caixas. ID: ${user.id}`, '_blank') : handleGeneratePix()} 
                                    className="flex-[2] py-3 bg-brand-green-dark text-white rounded-xl font-bold"
                                >
                                    {paymentMethod === 'whatsapp' ? 'Abrir WhatsApp' : 'Gerar Pix'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6">
                             <div className="mx-auto w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                 {/* Mock QR Code */}
                                 <QrCodeIcon className="h-32 w-32 text-gray-400" />
                             </div>
                             <div>
                                 <p className="font-bold text-xl">{formatCurrency(total + shipping)}</p>
                                 <p className="text-sm text-gray-500">Escaneie o QR Code ou copie o código abaixo</p>
                             </div>
                             <div className="flex gap-2">
                                 <input readOnly value="00020126580014BR.GOV.BCB.PIX0136..." className="flex-1 bg-gray-50 border rounded-lg px-3 text-sm text-gray-500" />
                                 <button className="bg-blue-100 text-blue-700 px-4 rounded-lg font-bold text-sm hover:bg-blue-200">Copiar</button>
                             </div>
                             <button onClick={onClose} className="text-sm text-gray-500 underline">Fechar e Aguardar Confirmação</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const DashboardShell = ({ user, onLogout }: { user: Consultant, onLogout: () => void }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    
    // Mock Data
    const myTeam: Consultant[] = []; // Populate with real data in production

    // Determine Display Role
    let displayRole = 'Consultor';
    if (user.role === 'admin') displayRole = 'Administrador Geral';
    else if (user.role === 'leader') displayRole = 'Líder / Distribuidor';
    else if (myTeam.length > 0) displayRole = 'Distribuidor em Qualificação';

    const NavItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === id 
                ? 'bg-brand-green-light dark:bg-brand-green-mid/20 text-brand-green-dark dark:text-green-400 font-bold shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-green-dark dark:hover:text-white'
            }`}
        >
            <Icon className={`h-5 w-5 transition-colors ${activeTab === id ? 'text-brand-green-dark dark:text-green-400' : 'text-gray-400 group-hover:text-brand-green-dark'}`} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'dark bg-brand-dark-bg' : 'bg-gray-50'}`}>
            
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-brand-dark-card border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 z-30 shadow-lg">
                <div className="p-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
                    <BrandLogo className="h-14 w-auto mb-4" />
                    <div className="bg-brand-green-light dark:bg-green-900/30 text-brand-green-dark dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {displayRole}
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="h-10 w-10 rounded-full bg-brand-earth/20 flex items-center justify-center text-brand-earth font-bold text-lg border border-brand-earth/30">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">ID: {user.id}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <NavItem id="overview" label="Visão Geral" icon={ChartBarIcon} />
                        <NavItem id="business" label="Meu Negócio" icon={BriefcaseIcon} />
                        <NavItem id="materials" label="Materiais" icon={PhotoIcon} />
                        <NavItem id="unibrotos" label="UniBrotos" icon={AcademicCapIcon} />
                        {(user.role === 'admin' || myTeam.length > 0) && (
                             <NavItem id="team" label="Minha Equipe" icon={UsersIcon} />
                        )}
                        <button 
                            onClick={() => setIsNewOrderOpen(true)}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-amber-600 hover:bg-amber-50 font-medium mt-4"
                        >
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>Fazer Pedido</span>
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium px-4">
                        <LogoutIcon className="h-5 w-5" /> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header Mobile/Desktop */}
                <header className="bg-white/80 dark:bg-brand-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20 flex justify-between items-center lg:justify-end px-8">
                    <div className="lg:hidden flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-white">
                            <MenuIcon />
                        </button>
                        <BrandLogo className="h-8 w-auto" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white relative">
                            <BellIcon />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                            {isDarkMode ? <SunIcon /> : <MoonIcon />}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-brand-dark-card shadow-2xl p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <BrandLogo className="h-8 w-auto" />
                                <button onClick={() => setIsMobileMenuOpen(false)}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                            </div>
                            <nav className="space-y-1">
                                <NavItem id="overview" label="Visão Geral" icon={ChartBarIcon} />
                                <NavItem id="business" label="Meu Negócio" icon={BriefcaseIcon} />
                                <NavItem id="materials" label="Materiais" icon={PhotoIcon} />
                                <NavItem id="unibrotos" label="UniBrotos" icon={AcademicCapIcon} />
                                {(user.role === 'admin' || myTeam.length > 0) && (
                                    <NavItem id="team" label="Minha Equipe" icon={UsersIcon} />
                                )}
                                <button 
                                    onClick={() => { setIsNewOrderOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-amber-600 hover:bg-amber-50 font-medium mt-4"
                                >
                                    <ShoppingCartIcon className="h-5 w-5" />
                                    <span>Fazer Pedido</span>
                                </button>
                            </nav>
                             <div className="mt-auto border-t pt-4">
                                <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600">
                                    <LogoutIcon className="h-5 w-5" /> Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Body */}
                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-fade-in pb-20">
                    
                    {activeTab === 'overview' && (
                        <>
                             <div className="mb-8">
                                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
                                    Olá, {user.name.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Acompanhe o crescimento do seu negócio Brotos da Terra.
                                </p>
                            </div>

                            <BusinessModelSection 
                                onRequestInvite={() => setActiveTab('team')}
                                onRequestOrder={() => setIsNewOrderOpen(true)}
                            />
                            
                            <EarningsSimulator />

                            <TeamPerformanceSection team={myTeam} />
                        </>
                    )}

                    {activeTab === 'business' && <MyBusinessManagementScreen user={user} />}
                    
                    {activeTab === 'materials' && <SocialMediaMaterialsScreen user={user} />}
                    
                    {activeTab === 'unibrotos' && <UniBrotosScreen user={user} />}

                    {activeTab === 'team' && (
                        <div className="animate-fade-in">
                             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gestão de Equipe</h2>
                             <TeamPerformanceSection team={myTeam} />
                        </div>
                    )}
                </div>
            </main>

            {isNewOrderOpen && <NewOrderScreen user={user} onClose={() => setIsNewOrderOpen(false)} />}

        </div>
    );
};

export const ConsultantApp = () => {
    const [user, setUser] = useState<Consultant | null>(null);
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
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

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {user ? (
                <DashboardShell user={user} onLogout={handleLogout} />
            ) : (
                view === 'login' ? (
                    <LoginScreen onLogin={handleLogin} onRegisterClick={() => setView('register')} />
                ) : (
                    <RegisterScreen onBackToLogin={() => setView('login')} />
                )
            )}
        </ThemeContext.Provider>
    );
};
