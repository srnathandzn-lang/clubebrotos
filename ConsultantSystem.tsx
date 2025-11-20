
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Consultant, ConsultantRole, ConsultantStats, Sale, Notification } from './types';
import { 
  BrandLogo, UsersIcon, ChartBarIcon, UserCircleIcon, LogoutIcon, 
  SearchIcon, PlusIcon, WhatsAppIcon, LocationIcon, CloseIcon,
  SparklesIcon, ShieldCheckIcon, ShoppingCartIcon,
  PackageIcon, TruckIcon, TrendingUpIcon,
  BanknotesIcon, PresentationChartLineIcon, CalendarIcon, MenuIcon,
  QrCodeIcon, DocumentDuplicateIcon, CheckCircleIcon, CreditCardIcon,
  PhotoIcon, DownloadIcon, ClipboardCopyIcon, TrashIcon,
  HandshakeIcon, TargetIcon, BellIcon, BriefcaseIcon, SunIcon, MoonIcon
} from './components/Icons';

// --- InfinitePay Config ---
const INFINITEPAY_API_KEY = ""; // Coloque sua API Key aqui para produção

// --- 1. Regras de Negócio ---
const BUSINESS_RULES = {
    BOX_PRICE: 210.00,
    UNITS_PER_BOX: 12,
    RETAIL_PRICE_PER_UNIT: 35.00, // Preço sugerido de venda por pomada
    FREE_SHIPPING_THRESHOLD: 4, // Em caixas
    DISTRIBUTOR_TARGET_BOXES: 50,
    BONUS_PER_BOX: 15.00, // Exemplo de bônus por caixa da equipe
};

// --- Types Local Definition for Materials ---
interface MarketingMaterial {
    id: number;
    type: 'image' | 'text';
    category: string;
    title: string;
    description?: string;
    content?: string;
    image_url?: string;
    created_at?: string;
}

// --- Theme Context ---
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Componente de Simulação de Ganhos (Novo) ---
const EarningsSimulator: React.FC = () => {
    // Regra: Lucro Unitário = R$ 17,50
    const PROFIT_PER_UNIT = 17.50;
    const DAYS_IN_MONTH = 30;

    // Estado para o Slider de Meta Financeira
    const [financialGoal, setFinancialGoal] = useState(2500);
    
    // Cálculo dinâmico de vendas necessárias
    const salesNeededPerMonth = Math.ceil(financialGoal / PROFIT_PER_UNIT);
    const salesNeededPerDay = Math.ceil(salesNeededPerMonth / DAYS_IN_MONTH);

    // Cenários pré-definidos
    const scenarios = [
        { sales: 2, label: "Inicial", color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" },
        { sales: 5, label: "Focada", color: "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300" },
        { sales: 10, label: "Visionária", color: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300" }
    ];

    return (
        <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all hover:shadow-xl animate-fade-in">
            {/* Cabeçalho Motivacional */}
            <div className="bg-gradient-to-br from-brand-green-dark to-green-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <SparklesIcon />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 leading-tight relative z-10">
                    Seja dona do seu próprio negócio.
                </h3>
                <p className="text-green-100 text-xs md:text-sm opacity-90 max-w-md relative z-10">
                    Você define onde vai atuar, quanto tempo vai dedicar e quanto quer ganhar.
                </p>
            </div>

            <div className="p-6 flex flex-col gap-8">
                {/* Seção 1: Cenários de Vendas (Cards Visuais) */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-brand-green-dark dark:text-green-400 font-bold text-sm uppercase tracking-wide">
                        <BanknotesIcon className="w-5 h-5" />
                        <span>Possibilidades de Ganho no Mês</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenarios.map((scenario) => {
                            const monthlyProfit = scenario.sales * DAYS_IN_MONTH * PROFIT_PER_UNIT;
                            return (
                                <div key={scenario.sales} className={`p-4 rounded-2xl border-2 ${scenario.color} transition-transform hover:-translate-y-1 cursor-default group backdrop-blur-sm`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase opacity-70">{scenario.label}</span>
                                        <span className="text-xs font-bold bg-white/60 dark:bg-black/20 px-2 py-1 rounded-full">
                                            {scenario.sales} / dia
                                        </span>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-xs opacity-70 block mb-1">Lucro Mensal</span>
                                        <span className="text-xl md:text-2xl font-black tracking-tight">
                                            R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Divisor */}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

                {/* Seção 2: Calculadora Interativa (Slider) */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-700 dark:text-gray-200 font-bold text-sm">
                            Quanto você gostaria de ganhar?
                        </p>
                        <div className="bg-brand-green-light dark:bg-green-900/50 text-brand-green-dark dark:text-green-300 px-4 py-1 rounded-full font-bold text-sm shadow-inner">
                            Meta: R$ {financialGoal.toLocaleString('pt-BR')}
                        </div>
                    </div>

                    {/* Slider Customizado */}
                    <div className="relative mb-8 px-2">
                        <input 
                            type="range" 
                            min="500" 
                            max="6000" 
                            step="100" 
                            value={financialGoal}
                            onChange={(e) => setFinancialGoal(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-green-dark dark:accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>R$ 500</span>
                            <span>R$ 3.000</span>
                            <span>R$ 6.000+</span>
                        </div>
                    </div>

                    {/* Resultado do Cálculo */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-brand-green-dark dark:text-green-400">
                                <PackageIcon />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Meta de Vendas</p>
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-tight">Para atingir sua meta financeira.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-brand-green-dark dark:text-green-400">
                                ~{salesNeededPerDay}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">pomadas / dia</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componente: Modelo de Negócio (NOVO - Redesenhado) ---
const BusinessModelScreen: React.FC<{ onRequestInvite: () => void; onRequestOrder: () => void }> = ({ onRequestInvite, onRequestOrder }) => {
    const [activeTab, setActiveTab] = useState<'sales' | 'team'>('sales');

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-green-dark to-green-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-8">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
                    <HandshakeIcon className="h-64 w-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        Faça seu negócio do seu jeito
                    </h2>
                    <p className="text-green-100 text-base md:text-lg opacity-90 leading-relaxed mb-6">
                        A liberdade é o nosso principal pilar. Você escolhe como quer atuar: 
                        apenas com vendas diretas focadas em lucro rápido, ou construindo 
                        um legado através da formação de equipes.
                    </p>
                    
                    {/* Tab Switcher */}
                    <div className="inline-flex bg-green-900/30 backdrop-blur-sm p-1 rounded-full border border-white/10">
                        <button 
                            onClick={() => setActiveTab('sales')}
                            className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'sales' 
                                ? 'bg-white text-brand-green-dark shadow-lg transform scale-105' 
                                : 'text-green-100 hover:bg-white/10'
                            }`}
                        >
                            <ShoppingCartIcon className="w-4 h-4" /> Venda Direta
                        </button>
                        <button 
                            onClick={() => setActiveTab('team')}
                            className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'team' 
                                ? 'bg-white text-brand-green-dark shadow-lg transform scale-105' 
                                : 'text-green-100 hover:bg-white/10'
                            }`}
                        >
                            <UsersIcon className="w-4 h-4" /> Construção de Time
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Main Info */}
                <div className="md:col-span-8">
                    <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 h-full relative overflow-hidden transition-colors">
                        
                        {activeTab === 'sales' ? (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-center">
                                        <BanknotesIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-serif">Caminho da Venda</h3>
                                        <p className="text-green-600 dark:text-green-400 font-bold text-sm">Lucro imediato e autonomia</p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    Ideal para quem busca renda extra rápida ou quer fazer da venda de produtos sua atividade principal. 
                                    Aqui, o resultado depende exclusivamente do seu esforço diário.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-green-500 w-5 h-5" /> 100% de Lucro</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Compre no atacado e revenda com margem cheia. Dinheiro rápido no bolso.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-green-500 w-5 h-5" /> Zero Chefes</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Você define seus horários, suas rotas e sua estratégia de abordagem.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-green-500 w-5 h-5" /> Produto Validado</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Alta aceitação no mercado, facilitando a conversão de vendas.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-green-500 w-5 h-5" /> Material de Apoio</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Acesso ao nosso acervo de posts e scripts prontos para vender.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-center">
                                        <TrendingUpIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-serif">Caminho da Liderança</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">Escala, renda passiva e propósito</p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    Ideal para quem tem perfil empreendedor e deseja multiplicar seus ganhos ajudando outras pessoas a crescerem. 
                                    Torne-se um distribuidor e lidere sua própria organização.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-blue-500 w-5 h-5" /> Renda Passiva</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ganhe uma porcentagem sobre a produtividade de toda a sua equipe.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-blue-500 w-5 h-5" /> Sem Limites</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Não há teto de ganhos. Quanto maior seu time, maior seu faturamento.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-blue-500 w-5 h-5" /> Reconhecimento</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Prêmios exclusivos e destaque no ranking nacional de líderes.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2"><CheckCircleIcon className="text-blue-500 w-5 h-5" /> Impacto</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Transforme a vida de outras pessoas oferecendo uma oportunidade real.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Action */}
                <div className="md:col-span-4 space-y-6">
                    <div className={`rounded-3xl p-6 text-white shadow-lg transition-colors duration-500 ${activeTab === 'sales' ? 'bg-brand-green-dark' : 'bg-blue-600'}`}>
                        <h4 className="font-bold text-xl mb-2 font-serif">
                            {activeTab === 'sales' ? 'Comece a Lucrar' : 'Comece a Liderar'}
                        </h4>
                        <p className="text-white/80 text-sm mb-6">
                            {activeTab === 'sales' 
                            ? 'Faça seu pedido agora e garanta seu estoque para começar as vendas.' 
                            : 'Convide seu primeiro consultor e dê o primeiro passo na sua liderança.'}
                        </p>
                        
                        <button 
                            onClick={activeTab === 'sales' ? onRequestOrder : onRequestInvite}
                            className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            {activeTab === 'sales' ? <><ShoppingCartIcon /> Fazer Pedido</> : <><PlusIcon /> Convidar Agora</>}
                        </button>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-3xl p-6">
                        <div className="flex items-start gap-3">
                            <SparklesIcon className="text-yellow-600 dark:text-yellow-400 w-6 h-6 shrink-0" />
                            <div>
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm mb-1">Dica de Sucesso</h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300/80 leading-relaxed">
                                    Você não precisa escolher apenas um! Os maiores líderes da Brotos começaram com vendas fortes e naturalmente atraíram pessoas para o negócio pelo seu exemplo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. Lógica Auxiliar ---

const generateNewID = async (referrerId?: string): Promise<string> => {
    const prefix = referrerId === '000000' ? '00' : '01';
    
    let isUnique = false;
    let newId = '';

    // Tenta gerar um ID único verificando no banco de dados real
    for(let i = 0; i < 10; i++) {
        const random = Math.floor(1000 + Math.random() * 9000).toString(); 
        newId = `${prefix}${random}`;
        
        // Verifica se já existe
        const { data, error } = await supabase.from('consultants').select('id').eq('id', newId).maybeSingle();
        
        if (error) {
            // Se houver erro de conexão, lança erro real
            console.error("Erro ao verificar ID:", error);
            continue;
        }

        if (!data) {
            isUnique = true;
            break;
        }
    }

    if (!isUnique) {
        throw new Error("Não foi possível gerar um ID único após várias tentativas. Tente novamente.");
    }

    return newId;
};

// --- 3. Contexto do Sistema ---

interface ConsultantContextType {
    user: Consultant | null;
    loading: boolean;
    stats: ConsultantStats;
    signOut: () => Promise<void>;
    refreshData: () => void;
    consultants: Consultant[];
    notifications: Notification[];
    markNotificationAsRead: (id: number) => Promise<void>;
    unreadCount: number;
}

const ConsultantContext = createContext<ConsultantContextType | undefined>(undefined);

export const ConsultantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Consultant | null>(null);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ConsultantStats>({ 
        totalConsultants: 0, activeConsultants: 0, totalTeams: 0, newThisMonth: 0 
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchProfile = async (authId: string) => {
        try {
            const { data, error } = await supabase
                .from('consultants')
                .select('*')
                .eq('auth_id', authId)
                .single();
            
            if (error) throw error;
            setUser(data);
            fetchTeamData();
            fetchNotifications(data.id);
        } catch (error) {
            console.error("Erro ao carregar perfil do consultor:", error);
            // Se o usuário existe no Auth mas não tem perfil no banco, faz logout para corrigir estado
            await supabase.auth.signOut();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamData = async () => {
        const { data, error } = await supabase
            .from('consultants')
            .select('*');
            
        if (!error && data) {
            setConsultants(data);
            
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            setStats({
                totalConsultants: data.length,
                activeConsultants: data.length, // Simplificado para este exemplo
                totalTeams: new Set(data.map(c => c.parent_id).filter(Boolean)).size,
                newThisMonth: data.filter(c => new Date(c.created_at) >= startOfMonth).length
            });
        }
    };

    const fetchNotifications = async (userId: string) => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (data) setNotifications(data);
    };

    const markNotificationAsRead = async (id: number) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
            
        // Atualiza localmente para feedback rápido
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        // Verifica sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Escuta mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <ConsultantContext.Provider value={{ 
            user, loading, stats, signOut, refreshData: fetchTeamData, consultants,
            notifications, markNotificationAsRead, unreadCount
        }}>
            {children}
        </ConsultantContext.Provider>
    );
};

const useConsultant = () => {
    const context = useContext(ConsultantContext);
    if (!context) throw new Error('useConsultant must be used within a ConsultantProvider');
    return context;
};

// --- 4. Componentes de Interface ---

const RegisterScreen: React.FC<{ referrerId: string; onBack?: () => void }> = ({ referrerId, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '',
        document: '', 
        address: '',
        city: '',
        state: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Gerar novo ID
            const newId = await generateNewID(referrerId);
            const newRole = referrerId === '000000' ? 'leader' : 'consultant';

            // 2. Criar usuário na Autenticação do Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.name } }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erro fatal: Usuário de autenticação não criado.");

            // 3. Criar registro no Banco de Dados
            const { error: dbError } = await supabase
                .from('consultants')
                .insert([{
                    id: newId,
                    auth_id: authData.user.id,
                    name: formData.name,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    document_id: formData.document,
                    address: `${formData.address} - ${formData.city}/${formData.state}`,
                    role: newRole,
                    parent_id: referrerId,
                    created_at: new Date().toISOString()
                }]);

            if (dbError) {
                throw new Error(`Erro ao salvar no banco: ${dbError.message}.`);
            }

            // 4. Login Automático após sucesso
            await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });
            
            window.location.href = '/';

        } catch (err: any) {
            console.error("Erro no processo de registro:", err);
            setError(err.message || "Ocorreu um erro desconhecido.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-green-light to-green-200 dark:from-brand-dark-bg dark:to-brand-dark-card flex items-center justify-center p-4">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full my-8 animate-fade-in border border-white/20 dark:border-white/5">
                <div className="flex justify-center mb-4"><BrandLogo /></div>
                <h2 className="text-2xl font-bold text-center text-brand-green-dark dark:text-white mb-2 font-serif">Cadastro Clube Brotos 🌱</h2>
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg mb-6 text-center text-sm text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                    {referrerId === '000000' 
                        ? 'Cadastro direto (Administrativo)' 
                        : <span>Convite de ID: <strong>{referrerId}</strong></span>
                    }
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Nome Completo</label>
                        <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">WhatsApp</label>
                            <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" placeholder="(XX) XXXXX-XXXX"
                                value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">CPF / CNPJ</label>
                            <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" 
                                value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Endereço</label>
                        <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" placeholder="Rua, Número, Bairro"
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Cidade</label>
                            <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" 
                                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Estado</label>
                            <input required type="text" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" maxLength={2} placeholder="UF"
                                value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">E-mail (Login)</label>
                        <input required type="email" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Senha de Acesso</label>
                        <input required type="password" className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-brand-green-dark dark:text-white transition-all" minLength={6}
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    {error && <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</div>}

                    <button disabled={loading} type="submit" className="w-full bg-brand-green-dark text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-green-900/20 transform active:scale-[0.98]">
                        {loading ? 'Registrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    {onBack ? (
                        <button onClick={onBack} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">Voltar para Login</button>
                    ) : (
                        <a href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">Já tenho ID? Fazer Login</a>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoginScreen: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [placeholderId, setPlaceholderId] = useState("Ex: 014823");

    useEffect(() => {
        // Gera um exemplo de ID aleatório para o placeholder para parecer mais dinâmico
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        setPlaceholderId(`Ex: 01${randomNum}`);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { data, error: dbError } = await supabase
                .from('consultants')
                .select('email')
                .eq('id', id)
                .single();

            if (dbError || !data) {
                throw new Error("ID não encontrado. Verifique o ID digitado.");
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password,
            });

            if (authError) throw new Error("Senha incorreta.");

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSetupAdmin = async () => {
        const confirmSetup = window.confirm("Isso tentará criar o Admin com ID 000000 e senha 'jo1234'. Certifique-se de ter apagado o usuário antigo no SQL do Supabase primeiro. Continuar?");
        if (!confirmSetup) return;

        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: 'admin@brotos.com',
                password: 'jo1234',
                options: { data: { full_name: 'Administrador Principal' } }
            });

            if (authError) throw authError;

            if (authData.user) {
                const { error: dbError } = await supabase.from('consultants').upsert({
                    id: '000000',
                    auth_id: authData.user.id,
                    name: 'Administrador Principal',
                    email: 'admin@brotos.com',
                    whatsapp: '00000000000',
                    role: 'admin',
                    address: 'Matriz'
                }, { onConflict: 'id' });
                
                if (dbError) throw dbError;
                
                alert("Admin criado com sucesso! Agora faça login com ID 000000 e senha jo1234.");
                setId('000000');
                setPassword('jo1234');
            } else {
                alert("Verifique seu email para confirmar o cadastro.");
            }
        } catch (err: any) {
            alert("Erro ao configurar admin: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center flex items-center justify-center p-4 relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-brand-green-dark/80 dark:bg-black/80 backdrop-blur-sm"></div>
            
            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/20 dark:border-white/5 relative z-10 animate-fade-in">
                <div className="flex justify-center mb-6 transform hover:scale-105 transition-transform"><BrandLogo /></div>
                <h2 className="text-3xl font-serif font-bold text-brand-green-dark dark:text-white mb-1">Clube Brotos 🌱</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm tracking-wide">Área restrita para consultores.</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-left group">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">ID de Consultor</label>
                        <div className="relative">
                            <input 
                                type="text" required placeholder={placeholderId}
                                value={id} onChange={(e) => setId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 focus:ring-2 focus:ring-brand-green-dark dark:text-white outline-none transition-all font-mono"
                            />
                        </div>
                    </div>
                    <div className="text-left">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Sua Senha</label>
                        <input 
                            type="password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 focus:ring-2 focus:ring-brand-green-dark dark:text-white outline-none transition-all"
                        />
                    </div>
                    
                    {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center justify-center gap-2 border border-red-100 dark:border-red-800"><ShieldCheckIcon /> {error}</div>}
                    
                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-brand-green-dark text-white font-bold py-4 rounded-xl hover:bg-green-900 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
                    >
                        {loading ? 'Acessando...' : 'Entrar no Sistema'}
                    </button>
                </form>
                
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-transparent text-gray-500 dark:text-gray-400">ou</span></div>
                </div>

                <button 
                    onClick={onSignup}
                    className="w-full bg-white dark:bg-transparent text-brand-green-dark dark:text-green-400 border-2 border-brand-green-dark dark:border-green-500 font-bold py-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                    Quero ser um Consultor
                </button>
                
                <button 
                    onClick={handleSetupAdmin}
                    className="mt-8 text-xs text-gray-400 hover:text-brand-green-dark dark:hover:text-green-400 underline transition-colors"
                >
                    Configurar Admin (Primeiro Acesso)
                </button>
            </div>
        </div>
    );
};

const InviteModal: React.FC<{ isOpen: boolean; onClose: () => void; myId: string }> = ({ isOpen, onClose, myId }) => {
    if (!isOpen) return null;
    const inviteLink = `${window.location.origin}?ref=${myId}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-2xl w-full max-w-md p-6 text-center animate-fade-in border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-brand-green-dark dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <PlusIcon />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Expandir Equipe</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Envie este link para um novo consultor. O sistema identificará você como líder e gerará o ID dele automaticamente.</p>
                
                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl break-all font-mono text-sm mb-6 border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {inviteLink}
                </div>
                
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">Fechar</button>
                    <button onClick={() => {navigator.clipboard.writeText(inviteLink); alert('Link copiado!');}} className="flex-1 py-3 bg-brand-green-dark text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-md">Copiar Link</button>
                </div>
            </div>
        </div>
    );
};

// --- NOVO: Tela de Materiais para Redes Sociais ---
const SocialMediaMaterialsScreen: React.FC = () => {
    const { user } = useConsultant();
    const isAdmin = user?.role === 'admin';
    const [activeCategory, setActiveCategory] = useState('all');
    const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Admin States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Partial<MarketingMaterial>>({ type: 'image', category: 'products' });

    const fetchMaterials = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('marketing_materials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setMaterials(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    // Helper function to format Imgur links to direct links
    const formatImgurUrl = (url: string | undefined) => {
        if (!url) return '';
        
        let cleanUrl = url.split('?')[0].trim();
        
        // Se já é um link direto (tem extensão), retorna
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl)) {
            return cleanUrl;
        }

        // Se for um link do Imgur sem extensão
        if (cleanUrl.includes('imgur.com')) {
            // Remove 'https://' e 'www' para facilitar o parse
            const parts = cleanUrl.split('/');
            const id = parts[parts.length - 1];
            // Retorna formato direto (i.imgur.com/ID.png)
            return `https://i.imgur.com/${id}.png`;
        }

        return url;
    };

    const handleAddMaterial = async () => {
        if (!newMaterial.title || !newMaterial.category) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        // Apply formatting to URL before saving
        const formattedMaterial = { ...newMaterial };
        if (formattedMaterial.type === 'image' && formattedMaterial.image_url) {
            formattedMaterial.image_url = formatImgurUrl(formattedMaterial.image_url);
        }

        const { error } = await supabase.from('marketing_materials').insert([formattedMaterial]);
        
        if (error) {
            alert("Erro ao adicionar: " + error.message);
        } else {
            setIsAddModalOpen(false);
            setNewMaterial({ type: 'image', category: 'products' }); // Reset
            fetchMaterials();
        }
    };

    const handleDeleteMaterial = async (id: number) => {
        if(!window.confirm("Tem certeza que deseja excluir este material?")) return;

        const { error } = await supabase.from('marketing_materials').delete().eq('id', id);
        if (error) {
            alert("Erro ao deletar: " + error.message);
        } else {
            fetchMaterials();
        }
    };

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'products', label: '📦 Produtos' },
        { id: 'company', label: '💼 Empresa' },
        { id: 'texts', label: '💬 Textos Prontos' },
        { id: 'promo', label: '📣 Promoções' },
    ];

    const filteredMaterials = activeCategory === 'all' 
        ? materials 
        : materials.filter(m => m.category === activeCategory);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Texto copiado para a área de transferência!");
    };

    const handleDownload = (url: string) => {
        // Ensure we are downloading the formatted URL
        const directUrl = formatImgurUrl(url);
        window.open(directUrl, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Header da Seção */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 font-serif">Acervo de Posts para Divulgação</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-3xl">
                        Use estes materiais para divulgar os produtos e a empresa nas suas redes sociais: Instagram, Facebook, WhatsApp e muito mais.
                    </p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-green-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition flex items-center gap-2"
                    >
                        <PlusIcon /> Adicionar Material
                    </button>
                )}
            </header>

            {/* Filtro de Categorias */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat.id 
                                ? 'bg-brand-green-dark text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                /* Grid de Materiais */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.length > 0 ? filteredMaterials.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-brand-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group relative">
                            
                            {/* Botão de Delete (Admin Only) */}
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDeleteMaterial(item.id)}
                                    className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/50 hover:bg-red-100 p-2 rounded-full text-red-500 shadow-sm backdrop-blur-sm transition-colors"
                                    title="Excluir Material"
                                >
                                    <TrashIcon />
                                </button>
                            )}

                            {item.type === 'image' ? (
                                // Card de Imagem
                                <>
                                    <div className={`h-48 w-full bg-gray-100 dark:bg-black/30 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-200 transition-colors`}>
                                        {item.image_url ? (
                                            <img 
                                                src={formatImgurUrl(item.image_url)} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                                onError={(e) => {
                                                    // Fallback em caso de erro no link
                                                    (e.target as HTMLImageElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Imagem+Indispon%C3%ADvel";
                                                }}
                                            />
                                        ) : (
                                            <PhotoIcon className="w-12 h-12 text-gray-300" />
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold uppercase">
                                            Imagem
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{item.description}</p>
                                        <button 
                                            onClick={() => handleDownload(item.image_url || '')}
                                            className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-green-dark hover:text-white dark:hover:bg-brand-green-dark transition-colors flex items-center justify-center gap-2"
                                        >
                                            <DownloadIcon /> Baixar / Ver Imagem
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Card de Texto
                                <>
                                    <div className="p-5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg">
                                                <ClipboardCopyIcon />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Script</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-mono mb-4 flex-1 border border-yellow-100 dark:border-yellow-800 italic relative overflow-y-auto max-h-32">
                                            "{item.content}"
                                        </div>
                                        <button 
                                            onClick={() => handleCopy(item.content || '')}
                                            className="w-full py-2 bg-brand-green-dark text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ClipboardCopyIcon /> Copiar Texto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )) : (
                        <div className="col-span-3 text-center py-12 text-gray-400">
                            <p>Nenhum material encontrado nesta categoria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Adicionar Material (Admin) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Novo Material</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tipo de Conteúdo</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNewMaterial({...newMaterial, type: 'image'})}
                                        className={`flex-1 py-2 rounded border font-bold text-sm ${newMaterial.type === 'image' ? 'bg-brand-green-dark text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                    >
                                        Imagem (Post)
                                    </button>
                                    <button 
                                        onClick={() => setNewMaterial({...newMaterial, type: 'text'})}
                                        className={`flex-1 py-2 rounded border font-bold text-sm ${newMaterial.type === 'text' ? 'bg-brand-green-dark text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                    >
                                        Texto (Script)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
                                <select 
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-black/20 p-2 rounded dark:text-white"
                                    value={newMaterial.category}
                                    onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                                >
                                    <option value="products">Produtos</option>
                                    <option value="company">Empresa</option>
                                    <option value="texts">Textos Prontos</option>
                                    <option value="promo">Promoções</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Título do Material</label>
                                <input 
                                    type="text" 
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-black/20 p-2 rounded dark:text-white"
                                    placeholder="Ex: Card Promoção Copaíba"
                                    value={newMaterial.title || ''}
                                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                                />
                            </div>

                            {newMaterial.type === 'image' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Link da Imagem (Imgur)</label>
                                        <input 
                                            type="text" 
                                            className="w-full border dark:border-gray-700 bg-white dark:bg-black/20 p-2 rounded dark:text-white"
                                            placeholder="Cole o link do post do Imgur aqui"
                                            value={newMaterial.image_url || ''}
                                            onChange={(e) => setNewMaterial({...newMaterial, image_url: e.target.value})}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">O sistema ajustará automaticamente links do Imgur.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Descrição Curta</label>
                                        <input 
                                            type="text" 
                                            className="w-full border dark:border-gray-700 bg-white dark:bg-black/20 p-2 rounded dark:text-white"
                                            placeholder="Ex: Use nos stories..."
                                            value={newMaterial.description || ''}
                                            onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Conteúdo do Texto</label>
                                    <textarea 
                                        className="w-full border dark:border-gray-700 bg-white dark:bg-black/20 p-2 rounded h-24 dark:text-white"
                                        placeholder="Digite o script de venda aqui..."
                                        value={newMaterial.content || ''}
                                        onChange={(e) => setNewMaterial({...newMaterial, content: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">Cancelar</button>
                            <button onClick={handleAddMaterial} className="flex-1 py-3 bg-brand-green-dark text-white rounded-lg font-bold hover:bg-opacity-90">Salvar Material</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NewOrderScreen: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, refreshData } = useConsultant();
    const [boxes, setBoxes] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix'>('whatsapp');
    const [pixStatus, setPixStatus] = useState<'idle' | 'loading' | 'generated'>('idle');
    const [pixData, setPixData] = useState({ qrCode: '', copyPaste: '' });
    
    if (!isOpen) return null;

    const boxPrice = BUSINESS_RULES.BOX_PRICE;
    const subtotal = boxes * boxPrice;
    const hasFreeShipping = boxes >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD;
    
    const createInfinitePayPixTransaction = async () => {
        setPixStatus('loading');
        try {
            // Simulação robusta de chamada à API da InfinitePay (V2)
            // Em produção, você deve configurar o CORS ou usar uma Edge Function
            const response = await fetch('https://api.infinitepay.io/v2/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${INFINITEPAY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: Math.round(subtotal * 100), // em centavos
                    capture_method: "pix",
                    metadata: {
                        order_id: `PED-${Date.now()}`,
                        customer_id: user?.id,
                        customer_name: user?.name
                    }
                })
            });
            
            const data = await response.json();

            if (data.id) {
                 setPixData({
                     qrCode: data.attributes?.pix_qr_code_url,
                     copyPaste: data.attributes?.br_code
                 });
                 setPixStatus('generated');
                 
                 // Registrar venda no banco de dados para disparar trigger de notificação
                 await supabase.from('sales').insert([{
                     consultant_id: user?.id,
                     quantity: boxes,
                     total_amount: subtotal
                 }]);
                 
                 refreshData();
            } else {
                // Fallback para simulação visual
                 setTimeout(async () => {
                     setPixData({
                         qrCode: "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA",
                         copyPaste: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA"
                     });
                     setPixStatus('generated');
                     
                     // Registrar venda (simulado)
                     await supabase.from('sales').insert([{
                        consultant_id: user?.id,
                        quantity: boxes,
                        total_amount: subtotal
                     }]);
                     refreshData();
                 }, 1500);
            }

        } catch (e) {
            console.error("Erro na integração InfinitePay:", e);
            setTimeout(async () => {
                setPixData({
                    qrCode: "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA",
                    copyPaste: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA"
                });
                setPixStatus('generated');
                await supabase.from('sales').insert([{
                    consultant_id: user?.id,
                    quantity: boxes,
                    total_amount: subtotal
                }]);
                refreshData();
            }, 1500);
        }
    };

    const handleWhatsAppOrder = async () => {
        const shippingText = hasFreeShipping ? "*Frete Grátis!* 🚚" : "*Frete a calcular*";
        
        const message = 
`Olá, sou o consultor *${user?.name}* (ID: ${user?.id}).

🛒 *NOVO PEDIDO CLUBE BROTOS*

📦 *${boxes}x Caixas Fechadas* (${BUSINESS_RULES.UNITS_PER_BOX}un/caixa)
💰 Valor Unit. Caixa: R$ ${boxPrice.toFixed(2).replace('.', ',')}
💲 *Total Pedido: R$ ${subtotal.toFixed(2).replace('.', ',')}*
📍 ${shippingText}

📍 *Endereço de Entrega:*
${user?.address}

Aguardo dados PIX para pagamento.`;

        // Registra a "Intenção de Venda" no banco para fins de notificação
        await supabase.from('sales').insert([{
            consultant_id: user?.id,
            quantity: boxes,
            total_amount: subtotal
        }]);
        
        refreshData();

        window.open(`https://wa.me/5571999999999?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                <div className="bg-brand-green-dark p-4 flex justify-between items-center text-white shadow-md shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingCartIcon /> Novo Pedido</h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><CloseIcon className="h-6 w-6 text-white" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Produto Principal */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="w-full md:w-1/3">
                            <div className="bg-gray-100 dark:bg-black/20 rounded-xl p-4 flex items-center justify-center aspect-square mb-2">
                                <img src="https://imgur.com/CGgz38b.png" alt="Caixa Pomada" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">Imagem ilustrativa</p>
                        </div>
                        
                        <div className="w-full md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Caixa Display - Pomada Copaíba</h4>
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-full">Atacado</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Contém 12 unidades de 15g cada. Fórmula original Brotos da Terra.</p>
                                
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 mb-4">
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">Preço por Caixa:</span>
                                    <span className="text-xl font-bold text-brand-green-dark dark:text-green-400">R$ {boxPrice.toFixed(2).replace('.',',')}</span>
                                </div>
                            </div>

                            {/* Seletor de Quantidade */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantidade de Caixas</label>
                                <div className="flex items-center gap-4 mb-4">
                                    <button onClick={() => setBoxes(Math.max(1, boxes - 1))} className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-xl transition text-gray-600 dark:text-gray-200">-</button>
                                    <div className="flex-1 bg-white dark:bg-black/20 border-2 border-gray-200 dark:border-gray-700 rounded-xl h-12 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-brand-green-dark dark:text-green-400">{boxes}</span>
                                    </div>
                                    <button onClick={() => setBoxes(boxes + 1)} className="w-12 h-12 flex items-center justify-center bg-brand-green-dark text-white rounded-xl hover:bg-opacity-90 font-bold text-xl transition">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regras e Benefícios */}
                    <div className="mb-6">
                        {/* Frete */}
                        <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${hasFreeShipping ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                            <div className={`p-2 rounded-full ${hasFreeShipping ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                                <TruckIcon />
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${hasFreeShipping ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {hasFreeShipping ? 'Frete Grátis Aplicado!' : 'Frete não incluso'}
                                </p>
                                {!hasFreeShipping && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Faltam {BUSINESS_RULES.FREE_SHIPPING_THRESHOLD - boxes} caixas para frete grátis.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Método de Pagamento Tabs */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Forma de Pagamento</label>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <button 
                                onClick={() => setPaymentMethod('whatsapp')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'whatsapp' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <WhatsAppIcon /> Negociar (WhatsApp)
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('pix')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-gray-700 text-brand-green-dark dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <QrCodeIcon className="w-5 h-5" /> Pagar Online (PIX)
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo de Pagamento */}
                    {paymentMethod === 'whatsapp' ? (
                         <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/50 mb-6 text-center">
                            <p className="text-green-800 dark:text-green-300 font-medium mb-2">Você será redirecionado para o WhatsApp Oficial.</p>
                            <p className="text-sm text-green-600 dark:text-green-400">Lá, nossa equipe confirmará o estoque e enviará os dados bancários manualmente.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
                            {pixStatus === 'idle' && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">Pague com PIX Automático (InfinitePay) e seu pedido será processado imediatamente.</p>
                                    <button onClick={createInfinitePayPixTransaction} className="bg-brand-green-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all w-full">
                                        Gerar Código PIX
                                    </button>
                                </div>
                            )}
                            {pixStatus === 'loading' && (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gerando pagamento seguro...</p>
                                </div>
                            )}
                            {pixStatus === 'generated' && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Escaneie o QR Code abaixo:</p>
                                    <div className="bg-white p-2 inline-block rounded-lg shadow-sm mb-4 border border-gray-200">
                                        <img src={pixData.qrCode} alt="QR Code Pix" className="w-48 h-48 object-contain" />
                                    </div>
                                    <div className="bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center gap-2 mb-4">
                                        <input type="text" readOnly value={pixData.copyPaste} className="w-full text-xs text-gray-500 dark:text-gray-300 bg-transparent outline-none font-mono truncate" />
                                        <button onClick={() => {navigator.clipboard.writeText(pixData.copyPaste); alert('Copiado!');}} className="text-brand-green-dark dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded transition">
                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                        <CheckCircleIcon /> Aguardando pagamento...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resumo Financeiro */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800 dark:text-white text-lg">Total a Pagar:</span>
                            <span className="font-bold text-brand-green-dark dark:text-green-400 text-2xl">R$ {subtotal.toFixed(2).replace('.',',')}</span>
                        </div>
                    </div>

                    {paymentMethod === 'whatsapp' && (
                        <button onClick={handleWhatsAppOrder} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transform active:scale-[0.99] transition-all flex justify-center items-center gap-2 text-lg">
                            <WhatsAppIcon /> Finalizar no WhatsApp
                        </button>
                    )}
                    {paymentMethod === 'pix' && pixStatus === 'generated' && (
                         <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white py-4 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                            Já paguei (Fechar)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { notifications, markNotificationAsRead } = useConsultant();

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-brand-dark-card rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h3 className="font-bold text-gray-700 dark:text-white">Notificações</h3>
                <button onClick={onClose}><CloseIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Nenhuma notificação nova.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => markNotificationAsRead(n.id)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!n.read ? 'bg-green-50/50 dark:bg-green-900/20 border-l-4 border-brand-green-dark' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold ${!n.read ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{n.title}</h4>
                                    <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardShell: React.FC = () => {
    const { user, stats, signOut, consultants, unreadCount } = useConsultant();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState<'home' | 'team' | 'shop' | 'materials' | 'business'>('home');
    const [activeTeamTab, setActiveTeamTab] = useState<'active' | 'inactive'>('active');
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const myTeam = isAdmin 
        ? consultants 
        : consultants.filter(c => c.parent_id === user?.id);
    
    const hasTeam = myTeam.length > 0;

    // Filtro de Ativos/Inativos com lógica de 7 dias
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const processedTeam = myTeam.map(member => {
        // Como não carregamos todas as vendas aqui no contexto simplificado, 
        // vamos simular a data da última venda baseada no ID para demonstração
        // Em produção, faríamos um join ou query específica
        const mockLastSaleDate = new Date(now.getTime() - (parseInt(member.id.slice(-2)) % 10) * 24 * 60 * 60 * 1000);
        const daysSinceLastSale = Math.floor((now.getTime() - mockLastSaleDate.getTime()) / (1000 * 3600 * 24));
        
        return {
            ...member,
            lastSaleDate: mockLastSaleDate,
            daysSinceLastSale,
            isActive: daysSinceLastSale <= 7
        };
    });

    const activeMembers = processedTeam.filter(m => m.isActive);
    const inactiveMembers = processedTeam.filter(m => !m.isActive);
    const currentList = activeTeamTab === 'active' ? activeMembers : inactiveMembers;

    // Lógica de Nível de Exibição
    let displayRole = 'Consultor';

    if (isAdmin) {
        displayRole = 'Administrador Geral';
    } else if (user?.role === 'leader') {
        displayRole = 'Distribuidor';
    } else if (activeMembers.length > 0) {
        // Se tiver equipe E pelo menos um membro ativo (fez compra)
        displayRole = 'Distribuidor em Qualificação';
    }

    // Lógica de Dashboard Administrativo
    const topRecruiters = isAdmin ? React.useMemo(() => {
        const counts: Record<string, number> = {};
        consultants.forEach(c => {
            if(c.parent_id && c.parent_id !== '000000') {
                counts[c.parent_id] = (counts[c.parent_id] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([id, count]) => {
                const leader = consultants.find(c => c.id === id);
                return { id, name: leader?.name || 'Desconhecido', count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5
    }, [consultants]) : [];

    const recentSignups = isAdmin ? consultants
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) : [];

    const handleOpenShop = () => {
        if (isAdmin) return;
        setActiveTab('shop');
        setIsOrderOpen(true);
        setIsSidebarOpen(false);
    };

    const handleNav = (tab: typeof activeTab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    // Função Admin para rodar verificação manual
    const runInactivityCheck = async () => {
        if(!isAdmin) return;
        if(confirm("Deseja rodar a verificação de inatividade (7 dias) e enviar notificações?")) {
            const { error } = await supabase.rpc('check_inactivity_7days');
            if(error) alert("Erro: " + error.message);
            else alert("Verificação concluída e notificações enviadas.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-brand-dark-bg flex flex-col font-sans relative transition-colors duration-300">
            
            {/* Overlay for Menu (Visible on all screens when open) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Universal Header (Visible on all screens) */}
            <div className="bg-white/90 dark:bg-brand-dark-card/90 text-brand-text dark:text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <MenuIcon className="h-8 w-8 text-brand-green-dark dark:text-white" />
                    </button>
                    <div className="h-10 w-auto flex items-center justify-center">
                        <BrandLogo className="h-8 w-auto" />
                    </div>
                </div>
                
                {/* Right side of header */}
                <div className="flex items-center gap-3 relative">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                    >
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>

                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <BellIcon className="h-6 w-6 text-brand-green-dark dark:text-white" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white dark:border-brand-dark-card">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                     <div className="w-8 h-8 rounded-full bg-brand-earth text-white flex items-center justify-center font-bold shadow-md text-sm">
                        {user?.name?.charAt(0)}
                    </div>

                    <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                </div>
            </div>

            {/* Sidebar Navigation (Off-canvas Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-brand-green-dark dark:bg-brand-dark-card text-white flex flex-col shadow-2xl 
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                 {/* Close Button */}
                 <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <CloseIcon className="h-8 w-8 text-white" />
                </button>

                <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center gap-3 mb-6 mt-2">
                        <div className="p-2 bg-white rounded-lg shadow-lg w-full flex justify-center"><BrandLogo /></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-brand-earth text-white flex items-center justify-center font-bold shadow-inner flex-shrink-0">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs opacity-70 font-mono">ID: {user?.id}</p>
                        </div>
                    </div>
                    <div className="mt-3 px-3 py-1 bg-white/10 text-white/80 text-xs font-bold uppercase rounded border border-white/10 text-center shadow-sm">
                        Nível: {displayRole}
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => handleNav('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-white text-brand-green-dark font-bold shadow-lg transform scale-105' : 'hover:bg-white/10'}`}>
                        <ChartBarIcon /> Visão Geral
                    </button>

                    {!isAdmin && (
                        <button onClick={() => handleNav('business')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'business' ? 'bg-white text-brand-green-dark font-bold shadow-lg transform scale-105' : 'hover:bg-white/10'}`}>
                            <BriefcaseIcon /> Meu Negócio
                        </button>
                    )}
                    
                    {/* O Admin também pode ver os materiais para editar */}
                    <button onClick={() => handleNav('materials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'materials' ? 'bg-white text-brand-green-dark font-bold shadow-lg transform scale-105' : 'hover:bg-white/10'}`}>
                        <PhotoIcon /> Materiais para Redes Sociais
                    </button>

                    {!isAdmin && (
                        <button onClick={handleOpenShop} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'shop' ? 'bg-white text-brand-green-dark font-bold shadow-lg transform scale-105' : 'hover:bg-white/10 text-yellow-300 font-bold'}`}>
                            <ShoppingCartIcon /> Fazer Pedido
                        </button>
                    )}
                    
                    {/* A aba de equipe só aparece para o admin ou para quem tem indicados (hasTeam) */}
                    {(isAdmin || hasTeam) && (
                        <button onClick={() => handleNav('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'team' ? 'bg-white text-brand-green-dark font-bold shadow-lg transform scale-105' : 'hover:bg-white/10'}`}>
                            <UsersIcon /> {isAdmin ? 'Todos Consultores' : 'Minha Equipe'}
                        </button>
                    )}
                    
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Expansão</p>
                        <button onClick={() => {setIsInviteOpen(true); setIsSidebarOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-green-300 font-bold transition-colors">
                            <PlusIcon /> Convidar Consultor
                        </button>
                    </div>
                </nav>
                <div className="p-4 bg-black/10">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-200 transition-colors"><LogoutIcon /> Sair do Sistema</button>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                {activeTab === 'home' && (
                    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
                        <header className="mb-4 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 font-serif">Olá, {user?.name.split(' ')[0]}! 👋</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base whitespace-pre-line">
                                {isAdmin 
                                    ? "Visão geral e monitoramento do sistema Brotos da Terra."
                                    : "Parabéns pela decisão de se tornar uma consultora de vendas independente.\n\nAgora você pode construir seu negócio de sucesso de duas formas; como uma consultora de vendas e também como uma distribuidora independente de vendas."
                                }
                            </p>
                        </header>

                        {/* VISÃO DO ADMINISTRADOR */}
                        {isAdmin ? (
                            <div className="space-y-8">
                                {/* 1. Cards de KPI (Key Performance Indicators) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><UsersIcon /></div>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded flex items-center gap-1"><TrendingUpIcon /> Total</span>
                                        </div>
                                        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Total Consultores</h3>
                                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalConsultants}</p>
                                    </div>

                                    <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"><PlusIcon /></div>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Mensal</span>
                                        </div>
                                        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Novos em {new Date().toLocaleString('default', { month: 'long' })}</h3>
                                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.newThisMonth}</p>
                                    </div>

                                    <div className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><UserCircleIcon /></div>
                                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">Ativos</span>
                                        </div>
                                        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Líderes de Equipe</h3>
                                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalTeams}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-brand-green-dark to-green-800 dark:from-green-900 dark:to-black p-6 rounded-2xl shadow-lg text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-white/20 rounded-xl"><BanknotesIcon /></div>
                                        </div>
                                        <h3 className="text-white/70 font-medium text-sm uppercase tracking-wider">Faturamento Rede (Est.)</h3>
                                        <p className="text-3xl font-bold mt-1">R$ {(stats.totalConsultants * 210).toLocaleString('pt-BR')}</p>
                                        <p className="text-[10px] opacity-60 mt-2">Baseado em média de 1 cx/ativo</p>
                                    </div>
                                </div>

                                {/* 2. Seção de Dados Detalhados */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Coluna Esquerda: Ranking e Gráfico (Visual) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Tabela de Últimos Cadastros */}
                                        <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm md:text-base"><CalendarIcon /> Últimos Cadastros</h3>
                                                <button onClick={() => setActiveTab('team')} className="text-sm text-brand-green-dark dark:text-green-400 hover:underline">Ver todos</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm min-w-[500px]">
                                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                                                        <tr>
                                                            <th className="p-4">Nome</th>
                                                            <th className="p-4">ID</th>
                                                            <th className="p-4">Data</th>
                                                            <th className="p-4">Cidade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {recentSignups.map(c => (
                                                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                                                                <td className="p-4 text-gray-500 dark:text-gray-400 font-mono">{c.id}</td>
                                                                <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                                                                <td className="p-4 text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{c.address?.split('-')[1] || 'N/A'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Gráfico Simulado de Crescimento */}
                                        <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                            <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-sm md:text-base"><PresentationChartLineIcon /> Crescimento da Rede (Semestral)</h3>
                                            <div className="h-48 flex items-end justify-between gap-2 px-2">
                                                {[35, 45, 40, 60, 75, 90].map((height, i) => (
                                                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                                        <div 
                                                            className="w-full bg-green-100 dark:bg-green-900/30 rounded-t-lg group-hover:bg-brand-green-dark dark:group-hover:bg-green-500 transition-all duration-500 relative" 
                                                            style={{height: `${height}%`}}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {height * 2}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-bold uppercase">
                                                            {['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'][i]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coluna Direita: Top Líderes */}
                                    <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/10 dark:to-transparent">
                                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm md:text-base">
                                                <SparklesIcon /> Top Recrutadores
                                            </h3>
                                        </div>
                                        <div className="p-2">
                                            {topRecruiters.length > 0 ? topRecruiters.map((leader, idx) => (
                                                <div key={leader.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                                                        ${idx === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : idx === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : idx === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}
                                                    `}>
                                                        {idx + 1}º
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{leader.name}</p>
                                                        <p className="text-xs text-gray-400">ID: {leader.id}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="font-bold text-brand-green-dark dark:text-green-400">{leader.count}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase">Indicados</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-8 text-center text-gray-400 text-sm">Nenhum dado de recrutamento ainda.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                        /* VISÃO DO CONSULTOR */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* NOVO CARD INTERATIVO: Simulador de Ganhos */}
                                <EarningsSimulator />
                                
                                {/* Card de Materiais para Redes Sociais (Novo Atalho no Dashboard) */}
                                <div onClick={() => setActiveTab('materials')} className="bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors"><PhotoIcon /></div>
                                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">Novo</span>
                                    </div>
                                    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Divulgação</h3>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1 mb-2">Materiais Prontos</p>
                                    <p className="text-xs text-gray-400 mt-auto">Posts, cards e textos para suas redes sociais.</p>
                                    <button className="mt-4 w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                                        Ver Materiais
                                    </button>
                                </div>

                                <div onClick={handleOpenShop} className="bg-brand-green-dark dark:bg-green-900 text-white p-6 rounded-3xl shadow-lg cursor-pointer hover:bg-opacity-90 transition-all relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-xl mb-1">Fazer Pedido</h3>
                                        <p className="text-white/70 text-sm mb-4">Reabasteça seu estoque com preço de atacado.</p>
                                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-white/30 transition-all">
                                            <ShoppingCartIcon /> Comprar Agora
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-white/10 transform group-hover:scale-110 transition-transform duration-500">
                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Atalho secundário para Minha Equipe (Aparece apenas se tiver indicados) */}
                            {hasTeam && (
                             <div className="mt-6 bg-white dark:bg-brand-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full"><UsersIcon /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-white">Minha Equipe</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Você possui {myTeam.length} consultores indicados.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('team')} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                                        Gerenciar Equipe
                                    </button>
                                </div>
                            </div>
                            )}
                        </>
                        )}
                    </div>
                )}
                
                {/* Business Model Tab (NOVO - Atualizado) */}
                {activeTab === 'business' && (
                    <BusinessModelScreen 
                        onRequestInvite={() => {setIsInviteOpen(true); setIsSidebarOpen(false);}}
                        onRequestOrder={() => {setIsOrderOpen(true); setIsSidebarOpen(false);}}
                    />
                )}

                {/* Team Tab - Nova Estrutura Completa */}
                {activeTab === 'team' && (
                    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
                        <header className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                    {isAdmin ? 'Todos os Consultores' : 'Minha Equipe'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">Gerencie seus indicados e acompanhe o desempenho.</p>
                            </div>
                            {isAdmin && (
                                <button onClick={runInactivityCheck} className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-lg font-bold text-gray-600 dark:text-gray-200">
                                    ⚙️ Verificar Inatividade
                                </button>
                            )}
                        </header>

                        {/* Seção 1: Bonificações (Mockup Visual) */}
                        {!isAdmin && hasTeam && (
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-black text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
                                    <BanknotesIcon className="w-48 h-48" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Painel de Bonificações</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-blue-200 text-sm mb-1">Volume da Equipe (Mês)</p>
                                            <p className="text-3xl font-bold">0 cx</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-200 text-sm mb-1">Bônus Estimado</p>
                                            <p className="text-3xl font-bold text-yellow-300">R$ 0,00</p>
                                            <p className="text-[10px] opacity-70">Valores calculados após fechamento.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Abas Ativos / Inativos */}
                        <div className="flex gap-2 mb-4">
                             <button 
                                onClick={() => setActiveTeamTab('active')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTeamTab === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-white dark:bg-brand-dark-card text-gray-500 dark:text-gray-400'}`}
                            >
                                Ativos ({activeMembers.length})
                            </button>
                            <button 
                                onClick={() => setActiveTeamTab('inactive')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTeamTab === 'inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-white dark:bg-brand-dark-card text-gray-500 dark:text-gray-400'}`}
                            >
                                Inativos ({inactiveMembers.length})
                            </button>
                        </div>

                        {/* Seção 2: Meus Indicados (Tabela com Pedidos) */}
                        <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {activeTeamTab === 'active' ? <CheckCircleIcon className="text-green-500" /> : <CloseIcon className="text-red-500" />}
                                    {activeTeamTab === 'active' ? 'Consultores Ativos (Venda em 7 dias)' : 'Consultores Inativos (+7 dias sem venda)'}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[700px]">
                                    <thead className="bg-white dark:bg-brand-dark-card text-gray-500 dark:text-gray-400 font-bold uppercase border-b border-gray-100 dark:border-gray-800">
                                        <tr>
                                            <th className="p-4">Nome / ID</th>
                                            <th className="p-4">Contato</th>
                                            <th className="p-4">Localização</th>
                                            <th className="p-4">{activeTeamTab === 'active' ? 'Último Pedido' : 'Dias sem Vender'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {currentList.length > 0 ? currentList.map((member) => {
                                            return (
                                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800 dark:text-white">{member.name}</div>
                                                        <div className="text-xs text-gray-400 font-mono">ID: {member.id}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <a 
                                                            href={`https://wa.me/55${member.whatsapp.replace(/\D/g, '')}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <WhatsAppIcon /> Falar
                                                        </a>
                                                    </td>
                                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <LocationIcon />
                                                            <span className="truncate max-w-[150px]">
                                                                {member.address?.includes('-') 
                                                                    ? member.address.split('-')[1].trim() 
                                                                    : member.address || 'Não informado'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {activeTeamTab === 'active' ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-brand-green-dark dark:text-green-400">1 caixa(s)</span>
                                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{member.lastSaleDate.toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-red-500">{member.daysSinceLastSale} dias</span>
                                                                <span className="text-[10px] text-gray-400">Última: {member.lastSaleDate.toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                        <p>Nenhum consultor nesta lista.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Materials Tab (Aba de Materiais - Visível para todos, Editável para Admin) */}
                {activeTab === 'materials' && <SocialMediaMaterialsScreen />}

                {/* Shop Tab (Placeholder, as modal opens) */}
                {activeTab === 'shop' && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-4 text-brand-green-dark dark:text-green-400">
                             <ShoppingCartIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Loja do Consultor</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">O catálogo de produtos foi aberto no formulário de pedido. Se fechou, clique abaixo para reabrir.</p>
                        <button onClick={() => setIsOrderOpen(true)} className="mt-4 bg-brand-green-dark text-white px-6 py-2 rounded-lg font-bold">Abrir Pedido</button>
                    </div>
                )}

            </main>

            {/* Modals */}
            <NewOrderScreen isOpen={isOrderOpen} onClose={() => {setIsOrderOpen(false); if(activeTab === 'shop') setActiveTab('home');}} />
            <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} myId={user?.id || ''} />

        </div>
    );
};

const MainContent: React.FC = () => {
    const { user, loading } = useConsultant();
    const [isRegistering, setIsRegistering] = useState(false);
    const [referrerId, setReferrerId] = useState('000000');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setReferrerId(ref);
            setIsRegistering(true);
        }
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-brand-dark-bg">
            <div className="w-8 h-8 border-4 border-brand-green-dark dark:border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (user) return <DashboardShell />;

    if (isRegistering) return <RegisterScreen referrerId={referrerId} onBack={() => setIsRegistering(false)} />;

    return <LoginScreen onSignup={() => setIsRegistering(true)} />;
};

export const ConsultantApp: React.FC = () => {
    return (
        <ThemeProvider>
            <ConsultantProvider>
                <MainContent />
            </ConsultantProvider>
        </ThemeProvider>
    );
};
