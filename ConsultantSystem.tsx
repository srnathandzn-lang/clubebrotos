
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Consultant, ConsultantRole, ConsultantStats } from './types';
import { 
  BrandLogo, UsersIcon, ChartBarIcon, UserCircleIcon, LogoutIcon, 
  SearchIcon, PlusIcon, WhatsAppIcon, LocationIcon, CloseIcon,
  SparklesIcon, ShieldCheckIcon, ShoppingCartIcon
} from './components/Icons';

// --- 1. Lógica Auxiliar ---

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

// --- 2. Contexto do Sistema ---

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
                activeConsultants: data.length,
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

// --- 3. Componentes de Interface ---

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
            // OBS: Isso requer que as políticas RLS estejam configuradas corretamente no SQL.
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
            
            // Recarrega a página para limpar estados
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // 1. Buscar Email através do ID na tabela 'consultants'
            // Isso exige que a tabela exista e tenha a política 'Public read' ativa.
            const { data, error: dbError } = await supabase
                .from('consultants')
                .select('email')
                .eq('id', id)
                .single();

            if (dbError || !data) {
                throw new Error("ID não encontrado. Verifique se digitou corretamente ou se o cadastro foi concluído.");
            }

            // 2. Autenticar com Supabase Auth
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
                                type="text" required placeholder="Ex: 000000"
                                value={id} onChange={(e) => setId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-green-dark focus:border-transparent outline-none transition-all"
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

const OrderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user } = useConsultant();
    const [quantity, setQuantity] = useState(50);
    const MIN_ORDER = 50;

    if (!isOpen) return null;

    const handleOrder = () => {
        if (quantity < MIN_ORDER) return;
        const message = `Olá, sou o consultor *${user?.name}* (ID: ${user?.id}).\n\n📝 *NOVO PEDIDO*\n\n📦 Produto: Pomada de Copaíba\n🔢 Quantidade: *${quantity} unidades*\n📍 Entrega: ${user?.address}\n\nAguardo PIX para pagamento.`;
        window.open(`https://wa.me/5571999999999?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-brand-green-dark p-4 flex justify-between items-center text-white shadow-md">
                    <h3 className="text-lg font-bold flex items-center gap-2"><ShoppingCartIcon /> Novo Pedido</h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><CloseIcon /></button>
                </div>
                <div className="p-6">
                     <div className="flex gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <img src="https://imgur.com/CGgz38b.png" alt="Pomada" className="w-20 h-20 object-contain bg-white rounded-md p-1 shadow-sm" />
                        <div>
                            <h4 className="font-bold text-gray-800">Pomada de Copaíba</h4>
                            <p className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full w-fit mt-1">Atacado</p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Quantidade (Mínimo {MIN_ORDER})</label>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={() => setQuantity(Math.max(MIN_ORDER, quantity - 10))} className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold text-xl transition">-</button>
                            <span className="text-2xl font-bold text-brand-green-dark w-16 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 10)} className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 font-bold text-xl transition">+</button>
                        </div>
                    </div>
                    <button onClick={handleOrder} className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2">
                        <WhatsAppIcon /> Enviar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardShell: React.FC = () => {
    const { user, stats, signOut, consultants } = useConsultant();
    const [activeTab, setActiveTab] = useState<'home' | 'team'>('home');
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const myTeam = user?.role === 'admin' 
        ? consultants 
        : consultants.filter(c => c.parent_id === user?.id);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
            <aside className="bg-brand-green-dark text-white w-full md:w-72 flex-shrink-0 flex flex-col shadow-2xl z-10">
                <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white rounded-lg shadow-lg"><BrandLogo /></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-brand-earth text-brand-green-dark flex items-center justify-center font-bold shadow-inner">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-xs opacity-70 font-mono">ID: {user?.id}</p>
                        </div>
                    </div>
                    {user?.role === 'admin' && (
                        <div className="mt-3 px-3 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-bold uppercase rounded border border-yellow-500/30 text-center shadow-sm">
                            Painel Administrativo
                        </div>
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'home' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                        <ChartBarIcon /> Painel Geral
                    </button>
                    <button onClick={() => setIsOrderOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-yellow-300 font-bold transition-colors">
                        <ShoppingCartIcon /> Novo Pedido
                    </button>
                     <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'team' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                        <UsersIcon /> Minha Equipe
                    </button>
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Ações Rápidas</p>
                        <button onClick={() => setIsInviteOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-green-300 font-bold transition-colors">
                            <PlusIcon /> Convidar Consultor
                        </button>
                    </div>
                </nav>
                <div className="p-4 bg-black/10">
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-200 transition-colors"><LogoutIcon /> Sair do Sistema</button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
                {activeTab === 'home' && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Olá, {user?.name.split(' ')[0]}! 👋</h2>
                        <p className="text-gray-500 mb-8">Aqui está o resumo do seu negócio hoje.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><UsersIcon /></div>
                                </div>
                                <h3 className="text-gray-500 font-medium text-sm">Total na Equipe</h3>
                                <p className="text-4xl font-bold text-gray-800 mt-1">{user?.role === 'admin' ? stats.totalConsultants : myTeam.length}</p>
                            </div>
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><SparklesIcon /></div>
                                </div>
                                <h3 className="text-gray-500 font-medium text-sm">Novos este Mês</h3>
                                <p className="text-4xl font-bold text-gray-800 mt-1">{stats.newThisMonth}</p>
                            </div>
                             <div className="bg-gradient-to-br from-brand-green-dark to-green-800 text-white p-6 rounded-2xl shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Indique e Cresça</h3>
                                <p className="text-white/80 text-sm mb-4">Convide novos consultores para sua rede e aumente seus ganhos.</p>
                                <button onClick={() => setIsInviteOpen(true)} className="bg-white text-brand-green-dark px-4 py-2 rounded-lg font-bold text-sm w-full hover:bg-gray-100 transition">Gerar Link de Convite</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                         <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Equipe</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-5">Consultor</th>
                                            <th className="p-5">ID</th>
                                            <th className="p-5">Contato</th>
                                            <th className="p-5">Localização</th>
                                            <th className="p-5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myTeam.length === 0 ? (
                                            <tr><td colSpan={5} className="p-12 text-center text-gray-500">Nenhum consultor na sua rede ainda.</td></tr>
                                        ) : (
                                            myTeam.map(c => (
                                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-5">
                                                        <p className="font-bold text-gray-800">{c.name}</p>
                                                        <p className="text-xs text-gray-400">{c.email}</p>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-1 rounded border border-gray-200">{c.id}</span>
                                                    </td>
                                                    <td className="p-5">
                                                        <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-1 text-green-600 hover:underline font-medium text-sm">
                                                            <WhatsAppIcon /> {c.whatsapp}
                                                        </a>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-500">{c.address}</td>
                                                    <td className="p-5"><span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Ativo</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <OrderModal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} />
            <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} myId={user?.id || ''} />
        </div>
    );
};

// --- 4. Ponto de Entrada ---

export const ConsultantSystem: React.FC = () => {
    const { user, loading } = useConsultant();
    const [referrerId, setReferrerId] = useState<string | null>(null);
    const [manualRegister, setManualRegister] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) setReferrerId(ref);
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-green-light text-brand-green-dark font-bold animate-pulse">Carregando Clube Brotos...</div>;

    // Roteamento: Tela de Cadastro
    if (!user && (referrerId || manualRegister)) {
        return <RegisterScreen 
            referrerId={referrerId || '000000'} 
            onBack={manualRegister ? () => setManualRegister(false) : undefined}
        />;
    }

    // Roteamento: Dashboard (se logado) ou Login (se deslogado)
    return user ? <DashboardShell /> : <LoginScreen onSignup={() => setManualRegister(true)} />;
};

export const ConsultantApp: React.FC = () => (
    <ConsultantProvider>
        <ConsultantSystem />
    </ConsultantProvider>
);
