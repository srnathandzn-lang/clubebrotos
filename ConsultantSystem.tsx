
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
  HandshakeIcon, TargetIcon, BellIcon, BriefcaseIcon, SunIcon, MoonIcon,
  UserPlusIcon, CurrencyDollarIcon, ClipboardListIcon, TagIcon, CalculatorIcon,
  AcademicCapIcon, PlayCircleIcon, VideoCameraIcon
} from './components/Icons';

// --- InfinitePay Config ---
const INFINITEPAY_API_KEY = ""; // Coloque sua API Key aqui para produção

// --- 1. Regras de Negócio ---
const BUSINESS_RULES = {
    BOX_PRICE: 210.00,
    UNITS_PER_BOX: 12,
    RETAIL_PRICE_PER_UNIT: 35.00, // Preço sugerido de venda por pomada
    UNIT_COST: 210.00 / 12, // R$ 17.50
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

interface UniversityContent {
    id: number;
    title: string;
    description?: string;
    video_url: string;
    category: string;
    created_at?: string;
}

interface Customer {
    id: number;
    name: string;
    phone?: string;
    notes?: string;
}

interface PrivateSale {
    id: number;
    customer_id?: number;
    product_name: string;
    quantity: number;
    sale_price: number;
    sale_date: string;
    customer?: Customer; // Join
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
        <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all hover:shadow-xl animate-fade-in h-full">
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

// --- Componente: Seção de Modelo de Negócio (Conteúdo Educativo) ---
const BusinessModelSection: React.FC<{ onRequestInvite: () => void; onRequestOrder: () => void }> = ({ onRequestInvite, onRequestOrder }) => {
    const [activeTab, setActiveTab] = useState<'sales' | 'team'>('sales');

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-green-dark to-green-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl mb-8">
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
                            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                                activeTab === 'sales' 
                                ? 'bg-white text-brand-green-dark shadow-lg transform scale-105' 
                                : 'text-green-100 hover:bg-white/10'
                            }`}
                        >
                            <ShoppingCartIcon className="w-4 h-4" /> Venda Direta
                        </button>
                        <button 
                            onClick={() => setActiveTab('team')}
                            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
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

// --- NOVO: Tela de Gestão do Negócio (CRM Completo) ---
const MyBusinessManagementScreen: React.FC<{ onRequestOrder: () => void }> = ({ onRequestOrder }) => {
    const { user } = useConsultant();
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'stock'>('overview');
    
    // Data States
    const [purchases, setPurchases] = useState<Sale[]>([]); // Entradas (Compras na Brotos)
    const [privateSales, setPrivateSales] = useState<PrivateSale[]>([]); // Saídas (Vendas para Clientes)
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Form States
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', notes: '' });
    const [newSale, setNewSale] = useState({ customer_id: '', product_name: 'Pomada Copaíba', quantity: 1, sale_price: 35.00 });

    useEffect(() => {
        if(user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        // 1. Buscar Compras (Entradas)
        const { data: purchaseData } = await supabase.from('sales').select('*').eq('consultant_id', user?.id);
        if(purchaseData) setPurchases(purchaseData);

        // 2. Buscar Vendas Pessoais (Saídas)
        const { data: salesData } = await supabase.from('private_sales').select('*, customer:customers(*)').eq('consultant_id', user?.id);
        if(salesData) setPrivateSales(salesData as any); // Casting temporário se tabela não existir no types

        // 3. Buscar Clientes
        const { data: customerData } = await supabase.from('private_customers').select('*').eq('consultant_id', user?.id);
        if(customerData) setCustomers(customerData);

        setLoading(false);
    };

    // Cálculos
    const totalBoxesBought = purchases.reduce((acc, p) => acc + p.quantity, 0);
    const totalUnitsBought = totalBoxesBought * 12;
    const totalUnitsSold = privateSales.reduce((acc, s) => acc + s.quantity, 0);
    const currentStock = totalUnitsBought - totalUnitsSold;
    
    const totalRevenue = privateSales.reduce((acc, s) => acc + (s.sale_price * s.quantity), 0);
    const totalCostEstimate = totalUnitsSold * BUSINESS_RULES.UNIT_COST;
    const totalProfit = totalRevenue - totalCostEstimate;

    // Handlers
    const handleAddCustomer = async () => {
        if(!newCustomer.name) return alert("Nome é obrigatório");
        const { error } = await supabase.from('private_customers').insert([{
            consultant_id: user?.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            notes: newCustomer.notes
        }]);
        if(error) alert("Erro ao adicionar cliente: " + error.message);
        else {
            setIsCustomerModalOpen(false);
            setNewCustomer({ name: '', phone: '', notes: '' });
            fetchData();
        }
    };

    const handleAddSale = async () => {
        if(newSale.quantity > currentStock) return alert("Estoque insuficiente!");
        const { error } = await supabase.from('private_sales').insert([{
            consultant_id: user?.id,
            customer_id: newSale.customer_id ? parseInt(newSale.customer_id) : null,
            product_name: newSale.product_name,
            quantity: newSale.quantity,
            sale_price: newSale.sale_price
        }]);
        if(error) alert("Erro ao registrar venda: " + error.message);
        else {
            setIsSaleModalOpen(false);
            fetchData();
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-24 md:pb-0">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 font-serif">Meu Negócio</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestão completa de estoque, vendas e clientes.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setIsSaleModalOpen(true)} className="flex-1 md:flex-none bg-brand-green-dark text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-opacity-90 flex items-center justify-center gap-2 text-sm">
                        <CurrencyDollarIcon className="w-5 h-5" /> Nova Venda
                    </button>
                    <button onClick={() => setIsCustomerModalOpen(true)} className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-opacity-90 flex items-center justify-center gap-2 text-sm">
                        <UserPlusIcon className="w-5 h-5" /> Novo Cliente
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>Visão Geral</button>
                <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'sales' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>Minhas Vendas</button>
                <button onClick={() => setActiveTab('customers')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'customers' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>Meus Clientes</button>
                <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'stock' ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}>Histórico de Compras</button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase"><PackageIcon className="w-4 h-4" /> Estoque Atual</div>
                            <p className={`text-2xl md:text-3xl font-bold ${currentStock < 10 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{currentStock}</p>
                            <p className="text-[10px] text-gray-400">unidades disponíveis</p>
                        </div>
                        <div className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase"><ShoppingCartIcon className="w-4 h-4" /> Vendas Totais</div>
                            <p className="text-2xl md:text-3xl font-bold text-brand-green-dark dark:text-green-400">{totalUnitsSold}</p>
                            <p className="text-[10px] text-gray-400">unidades vendidas</p>
                        </div>
                        <div className="bg-white dark:bg-brand-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase"><CurrencyDollarIcon className="w-4 h-4" /> Receita Bruta</div>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</p>
                            <p className="text-[10px] text-gray-400">total arrecadado</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-brand-green-dark p-4 rounded-2xl shadow-lg text-white">
                            <div className="flex items-center gap-2 mb-2 text-green-100 text-xs font-bold uppercase"><TrendingUpIcon className="w-4 h-4" /> Lucro Líquido</div>
                            <p className="text-2xl md:text-3xl font-bold">R$ {totalProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            <p className="text-[10px] text-green-100 opacity-80">Receita - Custo Produto</p>
                        </div>
                    </div>

                    {/* Atalhos Rápidos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <button onClick={() => setIsSaleModalOpen(true)} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800 transition-all group text-left">
                             <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                 <CurrencyDollarIcon />
                             </div>
                             <h3 className="font-bold text-gray-800 dark:text-white">Registrar Nova Venda</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400">Baixe seu estoque e contabilize seu lucro imediatamente.</p>
                         </button>
                         <button onClick={onRequestOrder} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-200 dark:hover:border-yellow-800 transition-all group text-left">
                             <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                 <ShoppingCartIcon />
                             </div>
                             <h3 className="font-bold text-gray-800 dark:text-white">Repor Estoque (Comprar)</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400">Adquira mais caixas com a Brotos para continuar vendendo.</p>
                         </button>
                    </div>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
                     <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><ClipboardListIcon /> Histórico de Vendas</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Produto</th>
                                    <th className="p-4 text-center">Qtd</th>
                                    <th className="p-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {privateSales.length > 0 ? privateSales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-4 text-gray-500">{new Date(sale.sale_date).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium text-gray-800 dark:text-white">{(sale as any).customer?.name || 'Cliente Avulso'}</td>
                                        <td className="p-4 text-gray-500">{sale.product_name}</td>
                                        <td className="p-4 text-center font-bold">{sale.quantity}</td>
                                        <td className="p-4 text-right text-green-600 font-bold">R$ {sale.sale_price.toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma venda registrada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
                     <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><UsersIcon /> Carteira de Clientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                                <tr>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4">Telefone</th>
                                    <th className="p-4">Observações</th>
                                    <th className="p-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {customers.length > 0 ? customers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-4 font-bold text-gray-800 dark:text-white">{customer.name}</td>
                                        <td className="p-4 text-gray-500">{customer.phone || '-'}</td>
                                        <td className="p-4 text-gray-500 truncate max-w-xs">{customer.notes || '-'}</td>
                                        <td className="p-4">
                                            {customer.phone && (
                                                <a href={`https://wa.me/55${customer.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-600 hover:underline text-xs font-bold flex items-center gap-1">
                                                    <WhatsAppIcon /> Contatar
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhum cliente cadastrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'stock' && (
                <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <TruckIcon /> Histórico de Compras na Brotos
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4 text-center">Qtd. Caixas</th>
                                    <th className="p-4 text-right">Valor Total</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {purchases.length > 0 ? purchases.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-center font-bold text-gray-800 dark:text-white">{order.quantity}</td>
                                        <td className="p-4 text-right font-bold text-brand-green-dark dark:text-green-400">
                                            R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                                                Concluído
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhuma compra realizada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Nova Venda */}
            {isSaleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Registrar Venda</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Cliente</label>
                                <select 
                                    className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                    value={newSale.customer_id}
                                    onChange={e => setNewSale({...newSale, customer_id: e.target.value})}
                                >
                                    <option value="">Venda Avulsa (Sem cadastro)</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Qtd (Unidades)</label>
                                    <input type="number" min="1" className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                        value={newSale.quantity} onChange={e => setNewSale({...newSale, quantity: parseInt(e.target.value)})} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Valor Total (R$)</label>
                                    <input type="number" step="0.50" className="w-full p-2 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                        value={newSale.sale_price} onChange={e => setNewSale({...newSale, sale_price: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Lucro estimado nesta venda: R$ {((newSale.sale_price - (newSale.quantity * BUSINESS_RULES.UNIT_COST))).toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setIsSaleModalOpen(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleAddSale} className="flex-1 py-3 bg-brand-green-dark text-white rounded-lg font-bold hover:bg-opacity-90">Confirmar Venda</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo Cliente */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Novo Cliente</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nome do Cliente" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                            <input type="text" placeholder="WhatsApp (Opcional)" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                            <textarea placeholder="Observações (Endereço, Preferências...)" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white h-24"
                                value={newCustomer.notes} onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})} />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleAddCustomer} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-opacity-90">Salvar Cliente</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NOVO: UniBrotos (Universidade Corporativa) ---
const UniBrotosScreen: React.FC = () => {
    const { user } = useConsultant();
    const isAdmin = user?.role === 'admin';
    const [videos, setVideos] = useState<UniversityContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Admin Add Video
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newVideo, setNewVideo] = useState<Partial<UniversityContent>>({ category: 'sales' });

    const fetchVideos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('university_content')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) setVideos(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.video_url) return alert("Título e Link são obrigatórios");
        
        const { error } = await supabase.from('university_content').insert([newVideo]);
        if (error) alert("Erro: " + error.message);
        else {
            setIsAddModalOpen(false);
            setNewVideo({ category: 'sales' });
            fetchVideos();
        }
    };
    
    const handleDeleteVideo = async (id: number) => {
        if(!confirm("Deletar esta aula?")) return;
        await supabase.from('university_content').delete().eq('id', id);
        fetchVideos();
    };

    const categories = [
        { id: 'all', label: 'Todas as Aulas' },
        { id: 'sales', label: '💰 Técnicas de Venda' },
        { id: 'products', label: '📦 Produtos' },
        { id: 'marketing', label: '📱 Marketing Digital' },
        { id: 'leadership', label: '🚀 Liderança' },
    ];

    const filteredVideos = activeCategory === 'all' ? videos : videos.filter(v => v.category === activeCategory);

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-24">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-brand-green-dark p-2 rounded-lg text-white shadow-lg"><AcademicCapIcon className="w-8 h-8" /></div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-serif">UniBrotos</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                        Sua universidade corporativa. Aprenda tudo sobre nossos produtos, técnicas de venda e como liderar sua equipe para o sucesso.
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 flex items-center gap-2">
                        <VideoCameraIcon /> Adicionar Aula
                    </button>
                )}
            </header>

            {/* Categorias */}
            <div className="flex overflow-x-auto gap-3 mb-8 pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat.id 
                                ? 'bg-brand-green-dark text-white shadow-md scale-105' 
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVideos.length > 0 ? filteredVideos.map(video => {
                        const videoId = getYouTubeId(video.video_url);
                        return (
                            <div key={video.id} className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 group hover:shadow-2xl transition-all duration-300 flex flex-col">
                                <div className="relative aspect-video bg-black">
                                    {videoId ? (
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={`https://www.youtube.com/embed/${videoId}`} 
                                            title={video.title}
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50"><PlayCircleIcon /> Link Inválido</div>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => handleDeleteVideo(video.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 z-10">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                            {categories.find(c => c.id === video.category)?.label || video.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 leading-tight group-hover:text-brand-green-dark transition-colors">{video.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{video.description}</p>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="col-span-3 py-12 text-center text-gray-400">
                            <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Nenhuma aula encontrada nesta categoria.</p>
                        </div>
                    )}
                </div>
            )}

             {/* Modal Add Video */}
             {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Aula</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Título da Aula" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                value={newVideo.title || ''} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
                            
                            <input type="text" placeholder="Link do YouTube" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                value={newVideo.video_url || ''} onChange={e => setNewVideo({...newVideo, video_url: e.target.value})} />
                            
                            <select className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white"
                                value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})}>
                                {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>

                            <textarea placeholder="Descrição (Opcional)" className="w-full p-3 border dark:border-gray-700 rounded-lg dark:bg-black/20 dark:text-white h-24"
                                value={newVideo.description || ''} onChange={e => setNewVideo({...newVideo, description: e.target.value})} />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold">Cancelar</button>
                            <button onClick={handleAddVideo} className="flex-1 py-3 bg-brand-green-dark text-white rounded-lg font-bold hover:bg-opacity-90">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
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

const SocialMediaMaterialsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'images' | 'scripts'>('images');
    
    const materials = [
        { id: 1, type: 'image', title: 'Post Benefícios', url: 'https://i.imgur.com/ntlcx07.png' }, // Placeholder
        { id: 2, type: 'image', title: 'Antes e Depois', url: 'https://i.imgur.com/ntlcx07.png' }, // Placeholder
        { id: 3, type: 'script', title: 'Abordagem WhatsApp', content: 'Olá! Tudo bem? Gostaria de apresentar...' },
        { id: 4, type: 'script', title: 'Recuperação de Cliente', content: 'Oi sumida! Chegou reposição...' },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-24">
             <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-serif mb-2">Materiais de Divulgação</h2>
                <p className="text-gray-500 dark:text-gray-400">Baixe imagens e copie scripts para vender mais.</p>
            </header>

            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setActiveTab('images')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'images' ? 'border-brand-green-dark text-brand-green-dark dark:border-green-400 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Imagens & Posts
                </button>
                <button 
                    onClick={() => setActiveTab('scripts')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'scripts' ? 'border-brand-green-dark text-brand-green-dark dark:border-green-400 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Scripts de Venda
                </button>
            </div>

            {activeTab === 'images' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {materials.filter(m => m.type === 'image').map((item) => (
                        <div key={item.id} className="group relative bg-white dark:bg-brand-dark-card rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-3">
                                <p className="font-bold text-sm text-gray-800 dark:text-white mb-2 truncate">{item.title}</p>
                                <button className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors">
                                    <DownloadIcon className="w-4 h-4" /> Baixar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.filter(m => m.type === 'script').map((item) => (
                        <div key={item.id} className="bg-white dark:bg-brand-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-gray-800 dark:text-white">{item.title}</h3>
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(item.content || ''); alert('Copiado!');}}
                                    className="text-brand-green-dark dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 p-2 rounded-lg transition-colors"
                                    title="Copiar"
                                >
                                    <ClipboardCopyIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-gray-700">
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const NewOrderScreen: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user } = useConsultant();
    const [quantity, setQuantity] = useState(1);
    const [step, setStep] = useState(1); // 1: Select, 2: Payment, 3: Success

    if (!isOpen) return null;

    const boxPrice = BUSINESS_RULES.BOX_PRICE;
    const total = quantity * boxPrice;
    const shipping = quantity >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD ? 0 : 45.00;
    const grandTotal = total + shipping;

    const handlePayment = () => {
        // Mock payment process
        setStep(3);
        // Here you would integrate with InfinitePay API or similar
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-brand-dark-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
                {/* Header */}
                <div className="bg-brand-green-dark p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold font-serif">Novo Pedido</h2>
                        <p className="text-xs opacity-80">Reabasteça seu estoque com margem máxima.</p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-8">
                            {/* Product Selection */}
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <PackageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Caixa Pomada Copaíba (12 un)</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Caixa fechada para revenda.</p>
                                    <div className="flex items-center gap-2 text-brand-green-dark dark:text-green-400 font-bold">
                                        <span className="text-xl">R$ {boxPrice.toFixed(2)}</span>
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-green-700 dark:text-green-300">R$ {(boxPrice/12).toFixed(2)} /un</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Control */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Quantidade de Caixas:</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold">-</button>
                                    <span className="w-8 text-center font-bold text-xl">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full bg-brand-green-dark text-white flex items-center justify-center hover:bg-opacity-90 transition-colors font-bold">+</button>
                                </div>
                            </div>

                             {/* Summary */}
                             <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>R$ {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Frete {quantity >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD && <span className="text-green-500 font-bold">(Grátis!)</span>}</span>
                                    <span>{shipping === 0 ? 'R$ 0,00' : `R$ ${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                                    <span>Total</span>
                                    <span>R$ {grandTotal.toFixed(2)}</span>
                                </div>
                             </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Pagamento via Pix</h3>
                            <div className="bg-gray-100 dark:bg-black/30 p-4 rounded-xl mb-6 inline-block">
                                <QrCodeIcon className="w-48 h-48 mx-auto text-gray-800 dark:text-white" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Escaneie o QR Code ou copie o código abaixo para pagar.</p>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center gap-2 mb-6 border border-gray-200 dark:border-gray-700">
                                <code className="text-xs text-gray-600 dark:text-gray-300 flex-1 break-all">00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Sao Paulo62070503***63041234</code>
                                <button className="text-brand-green-dark dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded transition-colors"><ClipboardCopyIcon /></button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12">
                             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircleIcon className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pedido Realizado!</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Seu pagamento está sendo processado. Você receberá a confirmação no WhatsApp.</p>
                            <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Voltar ao Início
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step !== 3 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
                        {step === 2 && (
                            <button onClick={() => setStep(1)} className="flex-1 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl font-bold transition-colors">
                                Voltar
                            </button>
                        )}
                        <button 
                            onClick={() => step === 1 ? setStep(2) : handlePayment()} 
                            className="flex-1 bg-brand-green-dark text-white py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all"
                        >
                            {step === 1 ? 'Ir para Pagamento' : 'Já fiz o Pagamento'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

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
                    className="w-full bg-white dark:bg-transparent text-brand-green-dark dark:text-green-400 border-2 border-brand-green-dark dark:border-green-500 font-bold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all mb-4"
                >
                    Quero ser um Consultor
                </button>
                
                <button onClick={handleSetupAdmin} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">
                    Configurar Admin (Primeiro Acesso)
                </button>
            </div>
        </div>
    );
};

const DashboardShell: React.FC = () => {
    const { user, signOut, unreadCount } = useConsultant();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState<'home' | 'business' | 'materials' | 'university'>('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

    // Determine Display Role logic
    // Admin -> Admin
    // Leader -> Distribuidor
    // Consultant with Team and Active -> Distribuidor em Qualificação
    // Consultant -> Consultor
    let displayRole = 'Consultor';
    if (user?.role === 'admin') displayRole = 'Administrador Geral';
    else if (user?.role === 'leader') displayRole = 'Distribuidor';
    else {
        // Check qualification logic if needed, simplified here
        displayRole = 'Consultor';
    }

    const menuItems = [
        { id: 'home', label: 'Visão Geral', icon: ChartBarIcon },
        { id: 'business', label: 'Meu Negócio', icon: BriefcaseIcon },
        { id: 'materials', label: 'Materiais', icon: PhotoIcon },
        { id: 'university', label: 'UniBrotos', icon: AcademicCapIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-brand-dark-bg flex transition-colors duration-300 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-brand-green-dark dark:bg-brand-dark-card text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 flex flex-col items-center border-b border-white/10">
                    <div className="bg-white p-2 rounded-xl mb-4 shadow-lg"><BrandLogo className="h-8 w-auto" /></div>
                    <div className="text-center w-full">
                        <div className="w-16 h-16 bg-brand-earth text-brand-green-dark rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 border-white/10 shadow-inner font-serif">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-lg truncate leading-tight">{user?.name}</h3>
                        <p className="text-xs text-green-300 font-mono mb-3">ID: {user?.id}</p>
                        <div className="bg-white/10 rounded-lg py-1 px-3 text-xs font-bold tracking-wider uppercase border border-white/20">
                            {displayRole}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                activeTab === item.id 
                                ? 'bg-white text-brand-green-dark shadow-lg font-bold translate-x-1' 
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon className={activeTab === item.id ? "w-6 h-6" : "w-5 h-5 opacity-70"} />
                            {item.label}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button 
                            onClick={() => setIsNewOrderOpen(true)}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-yellow-400 hover:bg-yellow-400/10 transition-all font-bold"
                        >
                            <ShoppingCartIcon className="w-5 h-5" /> Fazer Pedido
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-bold">
                        <LogoutIcon /> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Header */}
                <header className="bg-white dark:bg-brand-dark-card border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm transition-colors">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-brand-green-dark dark:text-white p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <MenuIcon className="w-8 h-8" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white font-serif hidden md:block">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <div className="relative">
                            <BellIcon className="text-gray-600 dark:text-gray-300 w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-brand-earth text-white rounded-full flex items-center justify-center font-serif font-bold shadow-md md:hidden">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {activeTab === 'home' && (
                        <div className="space-y-10 animate-slide-up">
                            {/* Welcome Section */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 font-serif">
                                        Olá, {user?.name.split(' ')[0]}! 👋
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                        Parabéns pela decisão de se tornar uma consultora de vendas independente. 
                                        Agora você pode construir seu negócio de sucesso de duas formas; como uma 
                                        consultora de vendas e também como uma distribuidora independente.
                                    </p>
                                </div>
                            </div>

                            {/* Business Model (Education) - Now on Top */}
                            <BusinessModelSection 
                                onRequestInvite={() => alert("Funcionalidade de convite será implementada em breve!")}
                                onRequestOrder={() => setIsNewOrderOpen(true)}
                            />

                            {/* Earnings Simulator */}
                            <div className="max-w-4xl mx-auto">
                                <EarningsSimulator />
                            </div>

                            {/* Team Section at Bottom (Mockup for now if needed) */}
                            {/* Could be expanded based on role */}
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <MyBusinessManagementScreen onRequestOrder={() => setIsNewOrderOpen(true)} />
                    )}

                    {activeTab === 'materials' && (
                        <SocialMediaMaterialsScreen />
                    )}

                    {activeTab === 'university' && (
                        <UniBrotosScreen />
                    )}
                </div>
            </main>

            {/* New Order Modal */}
            <NewOrderScreen isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} />
        </div>
    );
};

const AppContent: React.FC = () => {
    const { user, loading } = useConsultant();
    const [view, setView] = useState<'login' | 'register'>('login');

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-green-light dark:bg-brand-dark-bg flex items-center justify-center transition-colors">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <BrandLogo className="h-16 w-auto opacity-50" />
                    <div className="w-12 h-12 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (user) {
        return <DashboardShell />;
    }

    return view === 'login' 
        ? <LoginScreen onSignup={() => setView('register')} /> 
        : <RegisterScreen referrerId="000000" onBack={() => setView('login')} />;
};

export const ConsultantApp: React.FC = () => {
    return (
        <ThemeProvider>
            <ConsultantProvider>
                <AppContent />
            </ConsultantProvider>
        </ThemeProvider>
    );
};
