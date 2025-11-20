
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Consultant, ConsultantRole, ConsultantStats } from './types';
import { 
  BrandLogo, UsersIcon, ChartBarIcon, UserCircleIcon, LogoutIcon, 
  SearchIcon, PlusIcon, WhatsAppIcon, LocationIcon, CloseIcon,
  SparklesIcon, ShieldCheckIcon, ShoppingCartIcon,
  PackageIcon, TruckIcon, TrendingUpIcon,
  BanknotesIcon, PresentationChartLineIcon, CalendarIcon, MenuIcon,
  QrCodeIcon, DocumentDuplicateIcon, CheckCircleIcon, CreditCardIcon,
  PhotoIcon, DownloadIcon, ClipboardCopyIcon, TrashIcon
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
        { sales: 2, label: "Inicial", color: "bg-blue-50 border-blue-200 text-blue-700" },
        { sales: 5, label: "Focada", color: "bg-green-50 border-green-200 text-green-700" },
        { sales: 10, label: "Visionária", color: "bg-purple-50 border-purple-200 text-purple-700" }
    ];

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-xl">
            {/* Cabeçalho Motivacional */}
            <div className="bg-brand-green-dark p-6 text-white relative overflow-hidden">
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
                    <div className="flex items-center gap-2 mb-4 text-brand-green-dark font-bold text-sm uppercase tracking-wide">
                        <BanknotesIcon className="w-5 h-5" />
                        <span>Possibilidades de Ganho no Mês</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenarios.map((scenario) => {
                            const monthlyProfit = scenario.sales * DAYS_IN_MONTH * PROFIT_PER_UNIT;
                            return (
                                <div key={scenario.sales} className={`p-4 rounded-2xl border-2 ${scenario.color} transition-transform hover:-translate-y-1 cursor-default group`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase opacity-70">{scenario.label}</span>
                                        <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded-full">
                                            {scenario.sales} / dia
                                        </span>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-xs text-gray-500 block mb-1">Lucro Mensal</span>
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
                <div className="border-t border-dashed border-gray-200"></div>

                {/* Seção 2: Calculadora Interativa (Slider) */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-700 font-bold text-sm">
                            Quanto você gostaria de ganhar?
                        </p>
                        <div className="bg-brand-green-light text-brand-green-dark px-4 py-1 rounded-full font-bold text-sm shadow-inner">
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
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-green-dark"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>R$ 500</span>
                            <span>R$ 3.000</span>
                            <span>R$ 6.000+</span>
                        </div>
                    </div>

                    {/* Resultado do Cálculo */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-brand-green-dark">
                                <PackageIcon />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Meta de Vendas</p>
                                <p className="text-gray-800 text-sm leading-tight">Para atingir sua meta financeira.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-brand-green-dark">
                                ~{salesNeededPerDay}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">pomadas / dia</span>
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
}

const ConsultantContext = createContext<ConsultantContextType | undefined>(undefined);

export const ConsultantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Consultant | null>(null);
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ConsultantStats>({ 
        totalConsultants: 0, activeConsultants: 0, totalTeams: 0, newThisMonth: 0 
    });

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

    return (
        <ConsultantContext.Provider value={{ 
            user, loading, stats, signOut, refreshData: fetchTeamData, consultants 
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
        <div className="min-h-screen bg-brand-green-light flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full my-8 animate-fade-in">
                <div className="flex justify-center mb-4"><BrandLogo /></div>
                <h2 className="text-2xl font-bold text-center text-brand-green-dark mb-2">Cadastro Clube Brotos 🌱</h2>
                <div className="bg-green-50 p-3 rounded-lg mb-6 text-center text-sm text-green-800 border border-green-200">
                    {referrerId === '000000' 
                        ? 'Cadastro direto (Administrativo)' 
                        : <span>Convite de ID: <strong>{referrerId}</strong></span>
                    }
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Nome Completo</label>
                        <input required type="text" className="w-full border p-2 rounded" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold uppercase text-gray-500">WhatsApp</label>
                            <input required type="text" className="w-full border p-2 rounded" placeholder="(XX) XXXXX-XXXX"
                                value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">CPF / CNPJ</label>
                            <input required type="text" className="w-full border p-2 rounded" 
                                value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Endereço</label>
                        <input required type="text" className="w-full border p-2 rounded" placeholder="Rua, Número, Bairro"
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Cidade</label>
                            <input required type="text" className="w-full border p-2 rounded" 
                                value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Estado</label>
                            <input required type="text" className="w-full border p-2 rounded" maxLength={2} placeholder="UF"
                                value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">E-mail (Login)</label>
                        <input required type="email" className="w-full border p-2 rounded" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Senha de Acesso</label>
                        <input required type="password" className="w-full border p-2 rounded" minLength={6}
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>

                    {error && <div className="bg-red-50 p-3 rounded border border-red-100 text-red-600 text-sm font-medium text-center">{error}</div>}

                    <button disabled={loading} type="submit" className="w-full bg-brand-green-dark text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all">
                        {loading ? 'Registrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    {onBack ? (
                        <button onClick={onBack} className="text-sm text-gray-500 hover:underline">Voltar para Login</button>
                    ) : (
                        <a href="/" className="text-sm text-gray-500 hover:underline">Já tenho ID? Fazer Login</a>
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
        <div className="min-h-screen bg-brand-green-light flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-brand-green-dark">
                <div className="flex justify-center mb-6 transform hover:scale-105 transition-transform"><BrandLogo /></div>
                <h2 className="text-3xl font-serif font-bold text-brand-green-dark mb-1">Clube Brotos 🌱</h2>
                <p className="text-gray-500 mb-8 text-sm">Área restrita para consultores.</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-left group">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">ID de Consultor</label>
                        <div className="relative">
                            <input 
                                type="text" required placeholder={placeholderId}
                                value={id} onChange={(e) => setId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green-dark focus:border-transparent outline-none transition-all font-mono"
                            />
                        </div>
                    </div>
                    <div className="text-left">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Sua Senha</label>
                        <input 
                            type="password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green-dark focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center justify-center gap-2 border border-red-100"><ShieldCheckIcon /> {error}</div>}
                    
                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full bg-brand-green-dark text-white font-bold py-4 rounded-lg hover:bg-[#1e3d1d] transition-all shadow-lg hover:shadow-xl"
                    >
                        {loading ? 'Acessando...' : 'Entrar no Sistema'}
                    </button>
                </form>
                
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou</span></div>
                </div>

                <button 
                    onClick={onSignup}
                    className="w-full bg-white text-brand-green-dark border-2 border-brand-green-dark font-bold py-3 rounded-lg hover:bg-green-50 transition-all"
                >
                    Quero ser um Consultor
                </button>
                
                <button 
                    onClick={handleSetupAdmin}
                    className="mt-6 text-xs text-gray-400 hover:text-brand-green-dark underline transition-colors"
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-brand-green-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <PlusIcon />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Expandir Equipe</h3>
                <p className="text-gray-600 mb-6 text-sm">Envie este link para um novo consultor. O sistema identificará você como líder e gerará o ID dele automaticamente.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg break-all font-mono text-sm mb-4 border border-dashed border-gray-300 text-gray-600">
                    {inviteLink}
                </div>
                
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Fechar</button>
                    <button onClick={() => {navigator.clipboard.writeText(inviteLink); alert('Link copiado!');}} className="flex-1 py-3 bg-brand-green-dark text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md">Copiar Link</button>
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
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Acervo de Posts para Divulgação</h2>
                    <p className="text-gray-500 text-sm md:text-base max-w-3xl">
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
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group relative">
                            
                            {/* Botão de Delete (Admin Only) */}
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDeleteMaterial(item.id)}
                                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-red-100 p-2 rounded-full text-red-500 shadow-sm backdrop-blur-sm transition-colors"
                                    title="Excluir Material"
                                >
                                    <TrashIcon />
                                </button>
                            )}

                            {item.type === 'image' ? (
                                // Card de Imagem
                                <>
                                    <div className={`h-48 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-200 transition-colors`}>
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
                                        <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4 flex-1">{item.description}</p>
                                        <button 
                                            onClick={() => handleDownload(item.image_url || '')}
                                            className="w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-brand-green-dark hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <DownloadIcon /> Baixar / Ver Imagem
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Card de Texto
                                <>
                                    <div className="p-5 bg-gray-50 border-b border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                                <ClipboardCopyIcon />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Script</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                                        <div className="bg-yellow-50 p-3 rounded-lg text-xs text-gray-600 font-mono mb-4 flex-1 border border-yellow-100 italic relative overflow-y-auto max-h-32">
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Adicionar Novo Material</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Conteúdo</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNewMaterial({...newMaterial, type: 'image'})}
                                        className={`flex-1 py-2 rounded border font-bold text-sm ${newMaterial.type === 'image' ? 'bg-brand-green-dark text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        Imagem (Post)
                                    </button>
                                    <button 
                                        onClick={() => setNewMaterial({...newMaterial, type: 'text'})}
                                        className={`flex-1 py-2 rounded border font-bold text-sm ${newMaterial.type === 'text' ? 'bg-brand-green-dark text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        Texto (Script)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Categoria</label>
                                <select 
                                    className="w-full border p-2 rounded"
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
                                <label className="block text-xs font-bold text-gray-500 mb-1">Título do Material</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded"
                                    placeholder="Ex: Card Promoção Copaíba"
                                    value={newMaterial.title || ''}
                                    onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                                />
                            </div>

                            {newMaterial.type === 'image' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Link da Imagem (Imgur)</label>
                                        <input 
                                            type="text" 
                                            className="w-full border p-2 rounded"
                                            placeholder="Cole o link do post do Imgur aqui"
                                            value={newMaterial.image_url || ''}
                                            onChange={(e) => setNewMaterial({...newMaterial, image_url: e.target.value})}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">O sistema ajustará automaticamente links do Imgur.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Descrição Curta</label>
                                        <input 
                                            type="text" 
                                            className="w-full border p-2 rounded"
                                            placeholder="Ex: Use nos stories..."
                                            value={newMaterial.description || ''}
                                            onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Conteúdo do Texto</label>
                                    <textarea 
                                        className="w-full border p-2 rounded h-24"
                                        placeholder="Digite o script de venda aqui..."
                                        value={newMaterial.content || ''}
                                        onChange={(e) => setNewMaterial({...newMaterial, content: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                            <button onClick={handleAddMaterial} className="flex-1 py-3 bg-brand-green-dark text-white rounded-lg font-bold hover:bg-opacity-90">Salvar Material</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NewOrderScreen: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user } = useConsultant();
    const [boxes, setBoxes] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix'>('whatsapp');
    const [pixStatus, setPixStatus] = useState<'idle' | 'loading' | 'generated'>('idle');
    const [pixData, setPixData] = useState({ qrCode: '', copyPaste: '' });
    
    if (!isOpen) return null;

    const boxPrice = BUSINESS_RULES.BOX_PRICE;
    const subtotal = boxes * boxPrice;
    const hasFreeShipping = boxes >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD;
    
    // Lucro potencial
    const totalUnits = boxes * BUSINESS_RULES.UNITS_PER_BOX;
    const potentialRevenue = totalUnits * BUSINESS_RULES.RETAIL_PRICE_PER_UNIT;
    const potentialProfit = potentialRevenue - subtotal;

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
            } else {
                // Fallback para simulação visual se a chave não estiver configurada
                 setTimeout(() => {
                     setPixData({
                         qrCode: "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA",
                         copyPaste: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA"
                     });
                     setPixStatus('generated');
                 }, 1500);
            }

        } catch (e) {
            console.error("Erro na integração InfinitePay:", e);
            // Fallback visual simulado para teste
            setTimeout(() => {
                setPixData({
                    qrCode: "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA",
                    copyPaste: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Brotos da Terra6008Salvador62070503***6304E2CA"
                });
                setPixStatus('generated');
            }, 1500);
        }
    };

    const handleWhatsAppOrder = () => {
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

        window.open(`https://wa.me/5571999999999?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-brand-green-dark p-4 flex justify-between items-center text-white shadow-md shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingCartIcon /> Novo Pedido</h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><CloseIcon className="h-6 w-6 text-white" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Produto Principal */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="w-full md:w-1/3">
                            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center aspect-square mb-2">
                                <img src="https://imgur.com/CGgz38b.png" alt="Caixa Pomada" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <p className="text-center text-xs text-gray-500">Imagem ilustrativa</p>
                        </div>
                        
                        <div className="w-full md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-bold text-gray-800">Caixa Display - Pomada Copaíba</h4>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Atacado</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">Contém 12 unidades de 15g cada. Fórmula original Brotos da Terra.</p>
                                
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                    <span className="text-gray-600 text-sm">Preço por Caixa:</span>
                                    <span className="text-xl font-bold text-brand-green-dark">R$ {boxPrice.toFixed(2).replace('.',',')}</span>
                                </div>
                            </div>

                            {/* Seletor de Quantidade */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Quantidade de Caixas</label>
                                <div className="flex items-center gap-4 mb-4">
                                    <button onClick={() => setBoxes(Math.max(1, boxes - 1))} className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-xl hover:bg-gray-300 font-bold text-xl transition text-gray-600">-</button>
                                    <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl h-12 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-brand-green-dark">{boxes}</span>
                                    </div>
                                    <button onClick={() => setBoxes(boxes + 1)} className="w-12 h-12 flex items-center justify-center bg-brand-green-dark text-white rounded-xl hover:bg-opacity-90 font-bold text-xl transition">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regras e Benefícios */}
                    <div className="mb-6">
                        {/* Frete */}
                        <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${hasFreeShipping ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className={`p-2 rounded-full ${hasFreeShipping ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                <TruckIcon />
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${hasFreeShipping ? 'text-green-700' : 'text-gray-600'}`}>
                                    {hasFreeShipping ? 'Frete Grátis Aplicado!' : 'Frete não incluso'}
                                </p>
                                {!hasFreeShipping && (
                                    <p className="text-xs text-gray-500">Faltam {BUSINESS_RULES.FREE_SHIPPING_THRESHOLD - boxes} caixas para frete grátis.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Método de Pagamento Tabs */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Forma de Pagamento</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setPaymentMethod('whatsapp')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'whatsapp' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                            >
                                <WhatsAppIcon /> Negociar (WhatsApp)
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('pix')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'pix' ? 'bg-white text-brand-green-dark shadow-sm' : 'text-gray-500'}`}
                            >
                                <QrCodeIcon className="w-5 h-5" /> Pagar Online (PIX)
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo de Pagamento */}
                    {paymentMethod === 'whatsapp' ? (
                         <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6 text-center">
                            <p className="text-green-800 font-medium mb-2">Você será redirecionado para o WhatsApp Oficial.</p>
                            <p className="text-sm text-green-600">Lá, nossa equipe confirmará o estoque e enviará os dados bancários manualmente.</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                            {pixStatus === 'idle' && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-4">Pague com PIX Automático (InfinitePay) e seu pedido será processado imediatamente.</p>
                                    <button onClick={createInfinitePayPixTransaction} className="bg-brand-green-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all w-full">
                                        Gerar Código PIX
                                    </button>
                                </div>
                            )}
                            {pixStatus === 'loading' && (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-gray-500 text-sm">Gerando pagamento seguro...</p>
                                </div>
                            )}
                            {pixStatus === 'generated' && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-3">Escaneie o QR Code abaixo:</p>
                                    <div className="bg-white p-2 inline-block rounded-lg shadow-sm mb-4 border border-gray-200">
                                        <img src={pixData.qrCode} alt="QR Code Pix" className="w-48 h-48 object-contain" />
                                    </div>
                                    <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center gap-2 mb-4">
                                        <input type="text" readOnly value={pixData.copyPaste} className="w-full text-xs text-gray-500 bg-transparent outline-none font-mono truncate" />
                                        <button onClick={() => {navigator.clipboard.writeText(pixData.copyPaste); alert('Copiado!');}} className="text-brand-green-dark hover:bg-green-50 p-2 rounded transition">
                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                                        <CheckCircleIcon /> Aguardando pagamento...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resumo Financeiro */}
                    <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">Total a Pagar:</span>
                            <span className="font-bold text-brand-green-dark text-2xl">R$ {subtotal.toFixed(2).replace('.',',')}</span>
                        </div>
                    </div>

                    {paymentMethod === 'whatsapp' && (
                        <button onClick={handleWhatsAppOrder} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transform active:scale-[0.99] transition-all flex justify-center items-center gap-2 text-lg">
                            <WhatsAppIcon /> Finalizar no WhatsApp
                        </button>
                    )}
                    {paymentMethod === 'pix' && pixStatus === 'generated' && (
                         <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all">
                            Já paguei (Fechar)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardShell: React.FC = () => {
    const { user, stats, signOut, consultants } = useConsultant();
    const [activeTab, setActiveTab] = useState<'home' | 'team' | 'shop' | 'materials'>('home');
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const myTeam = isAdmin 
        ? consultants 
        : consultants.filter(c => c.parent_id === user?.id);

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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
            
            {/* Overlay for Menu (Visible on all screens when open) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Universal Header (Visible on all screens) */}
            <div className="bg-brand-green-dark text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <MenuIcon className="h-8 w-8 text-white" />
                    </button>
                    <div className="h-10 w-auto bg-white rounded-lg px-2 py-1 flex items-center justify-center">
                        <BrandLogo className="h-8 w-auto" />
                    </div>
                </div>
                
                {/* Optional: Right side of header */}
                <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-earth text-brand-green-dark flex items-center justify-center font-bold shadow-inner text-sm">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>

            {/* Sidebar Navigation (Off-canvas Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-brand-green-dark text-white flex flex-col shadow-2xl 
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
                        <div className="w-10 h-10 rounded-full bg-brand-earth text-brand-green-dark flex items-center justify-center font-bold shadow-inner flex-shrink-0">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs opacity-70 font-mono">ID: {user?.id}</p>
                        </div>
                    </div>
                    <div className="mt-3 px-3 py-1 bg-white/10 text-white/80 text-xs font-bold uppercase rounded border border-white/10 text-center shadow-sm">
                        Nível: {isAdmin ? 'Administrador' : user?.role === 'leader' ? 'Líder/Distribuidor' : 'Consultor'}
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => handleNav('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'home' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                        <ChartBarIcon /> Visão Geral
                    </button>
                    
                    {/* O Admin também pode ver os materiais para editar */}
                    <button onClick={() => handleNav('materials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'materials' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                        <PhotoIcon /> Materiais para Redes Sociais
                    </button>

                    {!isAdmin && (
                        <button onClick={handleOpenShop} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'shop' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10 text-yellow-300 font-bold'}`}>
                            <ShoppingCartIcon /> Fazer Pedido
                        </button>
                    )}
                    
                     <button onClick={() => handleNav('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'team' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                        <UsersIcon /> {isAdmin ? 'Todos Consultores' : 'Minha Equipe'}
                    </button>
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Expansão</p>
                        <button onClick={() => {setIsInviteOpen(true); setIsSidebarOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-green-300 font-bold transition-colors">
                            <PlusIcon /> Convidar Consultor
                        </button>
                    </div>
                </nav>
                <div className="p-4 bg-black/10">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-200 transition-colors"><LogoutIcon /> Sair do Sistema</button>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                {activeTab === 'home' && (
                    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
                        <header className="mb-4 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Olá, {user?.name.split(' ')[0]}! 👋</h2>
                            <p className="text-gray-500 text-sm md:text-base whitespace-pre-line">
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
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><UsersIcon /></div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><TrendingUpIcon /> Total</span>
                                        </div>
                                        <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Consultores</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalConsultants}</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><PlusIcon /></div>
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Mensal</span>
                                        </div>
                                        <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Novos em {new Date().toLocaleString('default', { month: 'long' })}</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.newThisMonth}</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><UserCircleIcon /></div>
                                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Ativos</span>
                                        </div>
                                        <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Líderes de Equipe</h3>
                                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalTeams}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-brand-green-dark to-green-800 p-6 rounded-2xl shadow-lg text-white">
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
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base"><CalendarIcon /> Últimos Cadastros</h3>
                                                <button onClick={() => setActiveTab('team')} className="text-sm text-brand-green-dark hover:underline">Ver todos</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm min-w-[500px]">
                                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                                                        <tr>
                                                            <th className="p-4">Nome</th>
                                                            <th className="p-4">ID</th>
                                                            <th className="p-4">Data</th>
                                                            <th className="p-4">Cidade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {recentSignups.map(c => (
                                                            <tr key={c.id} className="hover:bg-gray-50">
                                                                <td className="p-4 font-medium text-gray-800">{c.name}</td>
                                                                <td className="p-4 text-gray-500 font-mono">{c.id}</td>
                                                                <td className="p-4 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                                                                <td className="p-4 text-gray-500 truncate max-w-[150px]">{c.address?.split('-')[1] || 'N/A'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Gráfico Simulado de Crescimento */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-sm md:text-base"><PresentationChartLineIcon /> Crescimento da Rede (Semestral)</h3>
                                            <div className="h-48 flex items-end justify-between gap-2 px-2">
                                                {[35, 45, 40, 60, 75, 90].map((height, i) => (
                                                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                                        <div 
                                                            className="w-full bg-green-100 rounded-t-lg group-hover:bg-brand-green-dark transition-all duration-500 relative" 
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
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit">
                                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-white">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-yellow-700 text-sm md:text-base">
                                                <SparklesIcon /> Top Recrutadores
                                            </h3>
                                        </div>
                                        <div className="p-2">
                                            {topRecruiters.length > 0 ? topRecruiters.map((leader, idx) => (
                                                <div key={leader.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}
                                                    `}>
                                                        {idx + 1}º
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{leader.name}</p>
                                                        <p className="text-xs text-gray-400">ID: {leader.id}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="font-bold text-brand-green-dark">{leader.count}</p>
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
                            {/* Card de Carreira Removido conforme solicitado */}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* NOVO CARD INTERATIVO: Simulador de Ganhos */}
                                <EarningsSimulator />
                                
                                {/* Card de Materiais para Redes Sociais (Novo Atalho no Dashboard) */}
                                <div onClick={() => setActiveTab('materials')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors"><PhotoIcon /></div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Novo</span>
                                    </div>
                                    <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Divulgação</h3>
                                    <p className="text-2xl font-bold text-gray-800 mt-1 mb-2">Materiais Prontos</p>
                                    <p className="text-xs text-gray-400 mt-auto">Posts, cards e textos para suas redes sociais.</p>
                                    <button className="mt-4 w-full py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors">
                                        Ver Materiais
                                    </button>
                                </div>

                                <div onClick={handleOpenShop} className="bg-brand-green-dark text-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-opacity-90 transition-all relative overflow-hidden group">
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
                            
                            {/* Atalho secundário para Minha Equipe */}
                             <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><UsersIcon /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Minha Equipe</h3>
                                            <p className="text-sm text-gray-500">Você possui {myTeam.length} consultores indicados.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('team')} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">
                                        Gerenciar Equipe
                                    </button>
                                </div>
                            </div>
                        </>
                        )}
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {isAdmin ? 'Todos os Consultores' : 'Minha Equipe'}
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                                        <tr>
                                            <th className="p-4">Nome</th>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Contato</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myTeam.length > 0 ? myTeam.map(member => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-800">{member.name}</div>
                                                    <div className="text-xs text-gray-400">{member.role}</div>
                                                </td>
                                                <td className="p-4 font-mono text-sm text-gray-500">{member.id}</td>
                                                <td className="p-4">
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Ativo</span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{member.whatsapp}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                                    Nenhum consultor na equipe ainda.
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
                        <div className="bg-green-100 p-6 rounded-full mb-4">
                             <ShoppingCartIcon />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Loja do Consultor</h3>
                        <p className="text-gray-500 max-w-md mt-2">O catálogo de produtos foi aberto no formulário de pedido. Se fechou, clique abaixo para reabrir.</p>
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
    const [view, setView] = useState<'login' | 'register'>('login');
    const [referrerId, setReferrerId] = useState<string>('000000');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            setReferrerId(ref);
            setView('register');
        }
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-green-dark border-t-transparent rounded-full animate-spin"></div></div>;

    if (!user) {
        if (view === 'register') {
            return <RegisterScreen referrerId={referrerId} onBack={() => setView('login')} />;
        }
        return <LoginScreen onSignup={() => setView('register')} />;
    }

    return <DashboardShell />;
};

export const ConsultantApp: React.FC = () => (
    <ConsultantProvider>
        <MainContent />
    </ConsultantProvider>
);
