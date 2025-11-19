
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Consultant, ConsultantRole, ConsultantStats } from './types';
import { 
  BrandLogo, UsersIcon, ChartBarIcon, UserCircleIcon, LogoutIcon, 
  SearchIcon, PlusIcon, WhatsAppIcon, LocationIcon, CloseIcon,
  SparklesIcon, ShieldCheckIcon, ShoppingCartIcon,
  PackageIcon, TruckIcon, TrendingUpIcon,
  BanknotesIcon, PresentationChartLineIcon, CalendarIcon, MenuIcon
} from './components/Icons';

// --- 1. Regras de Negócio ---
const BUSINESS_RULES = {
    BOX_PRICE: 210.00,
    UNITS_PER_BOX: 12,
    RETAIL_PRICE_PER_UNIT: 35.00, // Preço sugerido de venda por pomada
    FREE_SHIPPING_THRESHOLD: 4, // Em caixas
    DISTRIBUTOR_TARGET_BOXES: 50,
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

// Simula um histórico de pedidos para o painel financeiro
const getMockFinancialHistory = () => {
    const history = [
        { id: 'PED-8921', date: '14/11/2023', boxes: 2, total: 420.00, status: 'Entregue' },
        { id: 'PED-9102', date: '02/12/2023', boxes: 5, total: 1050.00, status: 'Entregue' },
        { id: 'PED-9543', date: '20/01/2024', boxes: 1, total: 210.00, status: 'Entregue' },
        { id: 'PED-9981', date: '15/02/2024', boxes: 8, total: 1680.00, status: 'Em Trânsito' },
    ];
    return history;
};

const FinancialScreen: React.FC = () => {
    const transactions = getMockFinancialHistory();
    
    // Cálculos Financeiros Totais
    const totalBoxesPurchased = transactions.reduce((acc, curr) => acc + curr.boxes, 0);
    const totalInvested = transactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalUnits = totalBoxesPurchased * BUSINESS_RULES.UNITS_PER_BOX;
    const potentialRevenue = totalUnits * BUSINESS_RULES.RETAIL_PRICE_PER_UNIT;
    const potentialProfit = potentialRevenue - totalInvested;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Painel Financeiro</h2>
                    <p className="text-gray-500 text-sm md:text-base">Acompanhe o rendimento do seu negócio.</p>
                </div>
                <div className="bg-green-100 text-brand-green-dark px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 w-full md:w-auto justify-center">
                    <TrendingUpIcon /> Lucro de 100% na revenda
                </div>
            </header>

            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card de Lucro Estimado */}
                <div className="bg-gradient-to-br from-green-600 to-brand-green-dark rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4 opacity-90">
                        <div className="p-2 bg-white/20 rounded-lg"><BanknotesIcon /></div>
                        <span className="font-medium">Lucro Estimado</span>
                    </div>
                    <p className="text-4xl font-bold mb-2">R$ {potentialProfit.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs opacity-70">Baseado na venda de todas as unidades pelo preço sugerido.</p>
                </div>

                {/* Card de Faturamento Potencial */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PresentationChartLineIcon /></div>
                        <span className="font-medium">Faturamento Total (Potencial)</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-2">R$ {potentialRevenue.toFixed(2).replace('.', ',')}</p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <span className="bg-green-50 px-2 py-0.5 rounded">+100%</span>
                        <span>sobre o investimento</span>
                    </div>
                </div>

                 {/* Card de Investimento */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-gray-600">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><PackageIcon /></div>
                        <span className="font-medium">Total Investido (Custo)</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-2">R$ {totalInvested.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-gray-400">{totalBoxesPurchased} caixas adquiridas no total.</p>
                </div>
            </div>

            {/* Tabela de Histórico */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="font-bold text-gray-800">Histórico de Pedidos</h3>
                    <button className="text-sm text-brand-green-dark hover:underline font-medium">Exportar Relatório</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Data</th>
                                <th className="p-5">Pedido</th>
                                <th className="p-5">Volume</th>
                                <th className="p-5">Valor Investido</th>
                                <th className="p-5">Lucro Previsto</th>
                                <th className="p-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5 flex items-center gap-2 text-gray-600">
                                        <CalendarIcon /> {t.date}
                                    </td>
                                    <td className="p-5 font-mono text-xs font-bold text-gray-500">{t.id}</td>
                                    <td className="p-5 text-gray-800 font-medium">{t.boxes} cx ({t.boxes * 12} un)</td>
                                    <td className="p-5 text-gray-600">R$ {t.total.toFixed(2).replace('.',',')}</td>
                                    <td className="p-5 font-bold text-green-600">
                                        + R$ {(t.total).toFixed(2).replace('.',',')}
                                    </td>
                                    <td className="p-5">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            t.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const NewOrderScreen: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user } = useConsultant();
    const [boxes, setBoxes] = useState(1);
    
    if (!isOpen) return null;

    const boxPrice = BUSINESS_RULES.BOX_PRICE;
    const subtotal = boxes * boxPrice;
    const hasFreeShipping = boxes >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD;
    
    // Lucro potencial
    const totalUnits = boxes * BUSINESS_RULES.UNITS_PER_BOX;
    const potentialRevenue = totalUnits * BUSINESS_RULES.RETAIL_PRICE_PER_UNIT;
    const potentialProfit = potentialRevenue - subtotal;

    // Progresso Distribuidor nesta compra
    const progressPercentage = Math.min(100, (boxes / BUSINESS_RULES.DISTRIBUTOR_TARGET_BOXES) * 100);

    const handleOrder = () => {
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
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition"><CloseIcon /></button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                        {/* Distribuidor */}
                        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-yellow-800 uppercase">Meta Distribuidor</span>
                                <span className="text-xs font-bold text-yellow-800">{boxes}/{BUSINESS_RULES.DISTRIBUTOR_TARGET_BOXES} caixas</span>
                            </div>
                            <div className="w-full bg-yellow-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-[10px] text-yellow-700 mt-1 text-center">Compre 50 caixas para se tornar Distribuidor</p>
                        </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Total em Produtos ({totalUnits} un):</span>
                            <span className="font-medium">R$ {subtotal.toFixed(2).replace('.',',')}</span>
                        </div>
                         <div className="flex justify-between text-sm mb-2 text-green-600">
                            <span className="">Potencial de Venda (R$ 35/un):</span>
                            <span className="font-medium">R$ {potentialRevenue.toFixed(2).replace('.',',')}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">Total a Pagar:</span>
                            <span className="font-bold text-brand-green-dark text-2xl">R$ {subtotal.toFixed(2).replace('.',',')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                             <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Seu Lucro Potencial: R$ {potentialProfit.toFixed(2).replace('.',',')}</span>
                        </div>
                    </div>

                    <button onClick={handleOrder} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transform active:scale-[0.99] transition-all flex justify-center items-center gap-2 text-lg">
                        <WhatsAppIcon /> Enviar Pedido via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardShell: React.FC = () => {
    const { user, stats, signOut, consultants } = useConsultant();
    const [activeTab, setActiveTab] = useState<'home' | 'team' | 'shop' | 'finance'>('home');
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const myTeam = isAdmin 
        ? consultants 
        : consultants.filter(c => c.parent_id === user?.id);

    // Simulação de progresso (No futuro, isso viria do banco de dados de pedidos)
    // Para demonstração, vamos assumir que ele tem 0 compras se não for admin
    const currentBoxes = 0; 
    const distributorProgress = (currentBoxes / BUSINESS_RULES.DISTRIBUTOR_TARGET_BOXES) * 100;

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
                        <MenuIcon />
                    </button>
                    <div className="w-24 filter brightness-0 invert"><BrandLogo /></div>
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
                    <CloseIcon />
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
                    
                    {!isAdmin && (
                        <>
                            <button onClick={() => handleNav('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'finance' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10'}`}>
                                <BanknotesIcon /> Financeiro
                            </button>
                            <button onClick={handleOpenShop} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'shop' ? 'bg-white text-brand-green-dark font-bold shadow-md' : 'hover:bg-white/10 text-yellow-300 font-bold'}`}>
                                <ShoppingCartIcon /> Fazer Pedido
                            </button>
                        </>
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
                            <p className="text-gray-500 text-sm md:text-base">
                                {isAdmin 
                                    ? "Visão geral e monitoramento do sistema Brotos da Terra."
                                    : "Acompanhe o crescimento do seu negócio Brotos da Terra."
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
                            {/* Card de Carreira / Meta Distribuidor */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                        <TrendingUpIcon /> Plano de Carreira: Distribuidor
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between text-xs uppercase font-bold mb-2 opacity-80">
                                                <span>Consultor (Atual)</span>
                                                <span>Meta: {BUSINESS_RULES.DISTRIBUTOR_TARGET_BOXES} Caixas</span>
                                            </div>
                                            <div className="w-full bg-gray-600 h-4 rounded-full overflow-hidden border border-gray-500">
                                                <div className="bg-yellow-400 h-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{width: `${distributorProgress}%`}}></div>
                                            </div>
                                            <p className="text-xs mt-2 text-gray-300">Adquira 50 caixas para se tornar um Distribuidor oficial e liderar sua rede.</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[200px] w-full md:w-auto mt-4 md:mt-0 text-center md:text-left">
                                            <p className="text-xs text-gray-300 uppercase mb-1">Preço Exclusivo</p>
                                            <p className="text-2xl font-bold text-yellow-400">R$ 210,00</p>
                                            <p className="text-xs text-gray-300">por caixa (12un)</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative background elements */}
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div onClick={() => setActiveTab('finance')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors"><BanknotesIcon /></div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Ver Detalhes</span>
                                    </div>
                                    <h3 className="text-gray-500 font-medium text-sm">Lucro Estimado</h3>
                                    <p className="text-4xl font-bold text-gray-800 mt-1">R$ 3.360</p>
                                    <p className="text-xs text-green-600 mt-2">Com base no histórico</p>
                                </div>
                                
                                <div onClick={() => setActiveTab('team')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors"><UsersIcon /></div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Gerenciar</span>
                                    </div>
                                    <h3 className="text-gray-500 font-medium text-sm">Minha Equipe</h3>
                                    <p className="text-4xl font-bold text-gray-800 mt-1">{myTeam.length}</p>
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
                        </>
                        )}
                    </div>
                )}

                {activeTab === 'finance' && !isAdmin && <FinancialScreen />}

                {activeTab === 'team' && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                             <h2 className="text-2xl font-bold text-gray-800">
                                 {isAdmin ? 'Administração de Consultores' : 'Gestão de Equipe'}
                             </h2>
                             <button onClick={() => {setIsInviteOpen(true); setIsSidebarOpen(false);}} className="bg-brand-green-dark text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition w-full md:w-auto justify-center">
                                 <PlusIcon /> {isAdmin ? 'Novo Consultor' : 'Novo Membro'}
                             </button>
                         </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-5">Consultor</th>
                                            <th className="p-5">ID</th>
                                            <th className="p-5">Contato</th>
                                            <th className="p-5">Localização</th>
                                            {isAdmin && <th className="p-5">Líder (ID)</th>}
                                            <th className="p-5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myTeam.length === 0 ? (
                                            <tr><td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-gray-500">Nenhum consultor encontrado.</td></tr>
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
                                                    {isAdmin && (
                                                        <td className="p-5 text-sm text-gray-500">
                                                            {c.parent_id === '000000' ? 'Direto' : c.parent_id || '-'}
                                                        </td>
                                                    )}
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

                {activeTab === 'shop' && !isAdmin && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Catálogo do Consultor</h2>
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-full md:w-1/3 bg-gray-50 rounded-xl p-8 aspect-square flex items-center justify-center">
                                 <img src="https://imgur.com/CGgz38b.png" alt="Caixa Pomada" className="w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="w-full md:w-2/3">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="bg-brand-green-dark text-white text-xs font-bold px-2 py-1 rounded uppercase">Carro Chefe</span>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Margem Alta</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Caixa Display - Pomada de Copaíba</h3>
                                <p className="text-gray-500 mb-6 leading-relaxed text-sm md:text-base">
                                    O produto campeão de vendas. Caixa display pronta para exposição no balcão, contendo 12 unidades da autêntica Pomada de Copaíba Brotos da Terra. Alívio imediato e fidelização garantida.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Você Paga</p>
                                        <p className="text-xl md:text-2xl font-bold text-brand-green-dark">R$ 210,00</p>
                                        <p className="text-[10px] md:text-xs text-gray-400">R$ 17,50 / unidade</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <p className="text-xs text-green-600 uppercase font-bold">Preço Sugerido</p>
                                        <p className="text-xl md:text-2xl font-bold text-green-700">R$ 420,00</p>
                                        <p className="text-[10px] md:text-xs text-green-600">R$ 35,00 / unidade</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => setIsOrderOpen(true)} className="flex-1 bg-brand-green-dark text-white font-bold py-4 rounded-xl hover:bg-opacity-90 shadow-lg transition-all flex items-center justify-center gap-2">
                                        <ShoppingCartIcon /> Comprar Agora
                                    </button>
                                    <div className="flex-1 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-200 p-2">
                                        <TruckIcon /> Frete grátis acima de 4 cxs
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <NewOrderScreen isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} />
            <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} myId={user?.id || ''} />
        </div>
    );
};

// --- 5. Ponto de Entrada ---

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
