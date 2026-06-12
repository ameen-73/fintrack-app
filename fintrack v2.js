import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithCustomToken,
    signInAnonymously,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc,
    setDoc,
    getDocs
} from 'firebase/firestore';

// ==========================================
// 1. FIREBASE SETUP & INITIALIZATION
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "mock-api-key",
        authDomain: "mock-auth-domain",
        projectId: "mock-project-id",
        storageBucket: "mock-storage-bucket",
        messagingSenderId: "mock-sender-id",
        appId: "mock-app-id"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'fintrack-pro';

// ==========================================
// 2. DESIGN DICTIONARIES & METADATA (Cream & Yellow Palette)
// ==========================================
const CATEGORIES = {
    salary: { emoji: '💰', color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Salary & Jobs', border: 'border-emerald-500/20' },
    food: { emoji: '🍔', color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Food & Dinners', border: 'border-amber-500/20' },
    utilities: { emoji: '⚡', color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Bills & Power', border: 'border-blue-500/20' },
    shopping: { emoji: '🛍️', color: 'text-fuchsia-600', bg: 'bg-fuchsia-500/10', label: 'Shopping', border: 'border-fuchsia-500/20' },
    transport: { emoji: '🚗', color: 'text-sky-600', bg: 'bg-sky-500/10', label: 'Transport', border: 'border-sky-500/20' },
    leisure: { emoji: '🎟️', color: 'text-purple-600', bg: 'bg-purple-500/10', label: 'Entertainment', border: 'border-purple-500/20' },
    other: { emoji: '📦', color: 'text-stone-600', bg: 'bg-stone-500/10', label: 'Miscellaneous', border: 'border-stone-500/20' }
};

const CURRENCIES = {
    INR: { symbol: '₹', label: 'Indian Rupee' },
    USD: { symbol: '$', label: 'US Dollar' },
    EUR: { symbol: '€', label: 'Euro' },
    GBP: { symbol: '£', label: 'British Pound' }
};

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
    const icons = {
        wallet: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        ),
        chart: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        ),
        sparkles: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        ),
        trash: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        ),
        users: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        ),
        user: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        ),
        download: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        ),
        plus: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        ),
        share: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.576-2.288m0 5.092l-4.576-2.288m6.816-4.266a3 3 0 11-6 0 3 3 0 016 0zm-6 11.882a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0z" />
        ),
        alert: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        ),
        info: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={className}
            {...props}
        >
            {icons[name] || <path d="M12 2v20M2 12h20" />}
        </svg>
    );
};

// ==========================================
// 3. MAIN REACT APP COMPONENT
// ==========================================
export default function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('INR');
    const [monthFilter, setMonthFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [ledgerScope, setLedgerScope] = useState('private');
    const [workspaceId, setWorkspaceId] = useState('family-budget');

    // Form fields
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('food');
    const [date, setDate] = useState('');

    // AI Assistant States
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    // Modals & Feedback Toasters
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [showResetModal, setShowResetModal] = useState(false);
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
    const [tempWorkspaceId, setTempWorkspaceId] = useState('family-budget');
    const [activeChartSegment, setActiveChartSegment] = useState(null);

    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        setMonthFilter(`${yyyy}-${mm}`);
    }, []);

    const showToast = (msg) => {
        setToast({ visible: true, message: msg });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // ==========================================
    // 4. AUTHENTICATION HANDSHAKES
    // ==========================================
    useEffect(() => {
        const initAuthentication = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (err) {
                console.error("Auth error:", err);
                showToast("Connected in sandbox offline mode.");
            } finally {
                setAuthLoading(false);
            }
        };

        initAuthentication();

        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
        });

        return () => unsubscribe();
    }, []);

    // ==========================================
    // 5. FIRESTORE DATABASE LISTENER
    // ==========================================
    useEffect(() => {
        if (!user) return;

        let firestoreCollectionRef;
        if (ledgerScope === 'private') {
            firestoreCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'ledger');
        } else {
            firestoreCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', `shared_ledger_${workspaceId}`);
        }

        const unsubscribeSnapshot = onSnapshot(
            firestoreCollectionRef,
            (snapshot) => {
                const fetchedData = [];
                snapshot.forEach((docSnap) => {
                    fetchedData.push({ id: docSnap.id, ...docSnap.data() });
                });
                setTransactions(fetchedData);
            },
            (error) => {
                console.error("Sync error:", error);
                showToast("Using local system ledger memory.");
            }
        );

        return () => unsubscribeSnapshot();
    }, [user, ledgerScope, workspaceId]);

    // ==========================================
    // 6. BUSINESS LOGIC & ARITHMETIC
    // ==========================================
    const currencySymbol = CURRENCIES[selectedCurrency].symbol;

    const processedLedgerList = useMemo(() => {
        let list = [...transactions];

        if (monthFilter) {
            list = list.filter(item => item.date && item.date.startsWith(monthFilter));
        }

        if (searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            list = list.filter(item =>
                (item.description && item.description.toLowerCase().includes(searchLower)) ||
                (item.category && item.category.toLowerCase().includes(searchLower))
            );
        }

        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, monthFilter, searchTerm]);

    const metrics = useMemo(() => {
        let income = 0;
        let expense = 0;
        let allTimeNet = 0;

        transactions.forEach(item => {
            const amt = parseFloat(item.amount) || 0;
            if (item.type === 'income') allTimeNet += amt;
            else allTimeNet -= amt;
        });

        processedLedgerList.forEach(item => {
            const amt = parseFloat(item.amount) || 0;
            if (item.type === 'income') income += amt;
            else expense += amt;
        });

        return {
            monthlyIncome: income,
            monthlyExpense: expense,
            monthlyNet: income - expense,
            allTimeNet
        };
    }, [transactions, processedLedgerList]);

    const categorySummaryData = useMemo(() => {
        const distribution = {};
        processedLedgerList.forEach(item => {
            if (item.type === 'expense') {
                const catName = item.category || 'other';
                distribution[catName] = (distribution[catName] || 0) + parseFloat(item.amount || 0);
            }
        });
        return distribution;
    }, [processedLedgerList]);

    // ==========================================
    // 7. TRANSACTION INTERACTIVE CONTROL
    // ==========================================
    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!desc.trim() || !amount || parseFloat(amount) <= 0) {
            showToast("Please enter a valid description & positive amount.");
            return;
        }

        const payload = {
            description: desc.trim(),
            amount: parseFloat(amount),
            type,
            category,
            date,
            timestamp: Date.now(),
            createdBy: user?.uid || 'anonymous'
        };

        try {
            let firestoreCollectionRef;
            if (ledgerScope === 'private') {
                firestoreCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'ledger');
            } else {
                firestoreCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', `shared_ledger_${workspaceId}`);
            }

            await addDoc(firestoreCollectionRef, payload);
            showToast("Transaction registered.");
            setDesc('');
            setAmount('');
        } catch (err) {
            console.error(err);
            showToast("Unable to reach cloud servers.");
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            let documentRef;
            if (ledgerScope === 'private') {
                documentRef = doc(db, 'artifacts', appId, 'users', user.uid, 'ledger', id);
            } else {
                documentRef = doc(db, 'artifacts', appId, 'public', 'data', `shared_ledger_${workspaceId}`, id);
            }
            await deleteDoc(documentRef);
            showToast("Dropped entry successfully.");
        } catch (err) {
            showToast("Failed deletion action.");
        }
    };

    const handleWipeDatabase = async () => {
        setShowResetModal(false);
        try {
            let firestoreCollectionRef;
            if (ledgerScope === 'private') {
                firestoreCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'ledger');
            } else {
                firestoreCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', `shared_ledger_${workspaceId}`);
            }

            const snapshot = await getDocs(firestoreCollectionRef);
            const deletePromises = snapshot.docs.map(docSnap => {
                let docRef;
                if (ledgerScope === 'private') {
                    docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'ledger', docSnap.id);
                } else {
                    docRef = doc(db, 'artifacts', appId, 'public', 'data', `shared_ledger_${workspaceId}`, docSnap.id);
                }
                return deleteDoc(docRef);
            });

            await Promise.all(deletePromises);
            showToast("Workspace wiped clean.");
        } catch (err) {
            showToast("Wipe routine failed.");
        }
    };

    // ==========================================
    // 8. GEMINI FINAI STRATEGIST
    // ==========================================
    const triggerGeminiAdvisor = async () => {
        if (processedLedgerList.length === 0) {
            showToast("Log entries first to compile insights.");
            return;
        }

        setAiLoading(true);
        setAiError('');
        setAiAnalysis('');

        const apiKey = "";
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const serializedData = processedLedgerList.map(item => ({
            desc: item.description,
            val: `${currencySymbol}${item.amount}`,
            type: item.type,
            cat: CATEGORIES[item.category]?.label || item.category,
            date: item.date
        }));

        const systemPrompt = "You are FinAI Pro, a personal finance strategist designed around premium, clear, high-contrast budgeting advice. Highlight key areas of budget optimization, provide 3 highly customized tips, and format your output with beautiful emojis and clear headers. Keep it to 3 short paragraphs.";

        const userPrompt = `
      Current Month Frame: ${monthFilter || 'Comprehensive'}
      Current Active Ledger Data:
      ${JSON.stringify(serializedData, null, 2)}
      
      Summary:
      - Monthly Inflow: ${currencySymbol}${metrics.monthlyIncome.toFixed(2)}
      - Monthly Outflow: ${currencySymbol}${metrics.monthlyExpense.toFixed(2)}
      - Monthly Net Savings: ${currencySymbol}${metrics.monthlyNet.toFixed(2)}
    `;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) throw new Error();
            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) throw new Error();
            setAiAnalysis(responseText);
        } catch (error) {
            setAiError("The AI advisor is temporarily offline. Try again shortly.");
        } finally {
            setAiLoading(false);
        }
    };

    // ==========================================
    // 9. DATA EXPORTS
    // ==========================================
    const handleExportCSV = () => {
        if (processedLedgerList.length === 0) return;
        const headers = ["ID", "Description", "Amount", "Type", "Category", "Date Logged"];
        const rows = processedLedgerList.map(t => [
            t.id,
            t.description.replace(/"/g, '""'),
            t.amount,
            t.type,
            CATEGORIES[t.category]?.label || t.category,
            t.date
        ]);

        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `FinTrack_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("CSV file downloaded.");
    };

    const handleWhatsAppReport = () => {
        if (processedLedgerList.length === 0) return;
        let itemsString = "";
        processedLedgerList.slice(0, 10).forEach(item => {
            const icon = item.type === 'income' ? '🟢' : '🔴';
            itemsString += `\n• ${icon} ${item.description}: ${currencySymbol}${item.amount.toFixed(2)}`;
        });

        const reportMessage = `📊 *FinTrack Premium Budget Statement*\n` +
            `💰 Monthly Inflow: ${currencySymbol}${metrics.monthlyIncome.toFixed(2)}\n` +
            `📉 Total Outflow: ${currencySymbol}${metrics.monthlyExpense.toFixed(2)}\n` +
            `⚖️ Remaining Net: ${currencySymbol}${metrics.monthlyNet.toFixed(2)}\n\n` +
            `*Latest Records:* ${itemsString}`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportMessage)}`, '_blank');
    };

    const donutChartSegments = useMemo(() => {
        const totalExpense = Object.values(categorySummaryData).reduce((a, b) => a + b, 0);
        if (totalExpense === 0) return [];

        let accumulatedPercentage = 0;
        return Object.entries(categorySummaryData).map(([categoryKey, amountValue]) => {
            const percentage = (amountValue / totalExpense) * 100;
            const segment = {
                key: categoryKey,
                value: amountValue,
                percentage,
                startAngle: (accumulatedPercentage * 360) / 100,
                endAngle: ((accumulatedPercentage + percentage) * 360) / 100
            };
            accumulatedPercentage += percentage;
            return segment;
        });
    }, [categorySummaryData]);

    return (
        <div className="w-full max-w-md bg-[#FAF6F0] min-h-screen shadow-2xl relative border-x border-[#E6DEC4] text-[#18191F] font-sans flex flex-col justify-between pb-28">

            {/* Toast Overlay */}
            {toast.visible && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#18191F] text-stone-100 text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="flex-grow flex flex-col">

                {/* Header - Creamy Glassmorphism */}
                <header className="bg-[#FAF6F0]/95 backdrop-blur-md sticky top-0 z-30 px-5 py-4 border-b border-[#E6DEC4] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                            {/* Gold/Mustard Icon Wrapper */}
                            <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg shadow-[#F59E0B]/10">
                                <Icon name="wallet" className="w-5 h-5 text-[#18191F]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-base font-extrabold text-[#18191F] tracking-tight font-serif">FinTrack</h1>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-[#D97706]' : 'bg-stone-300'} animate-pulse`} />
                                </div>
                                <p className="text-[9px] text-stone-500 font-bold tracking-wider uppercase">
                                    {ledgerScope === 'private' ? '👤 Personal Sandbox' : `👥 Shared Room: ${workspaceId}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="bg-white hover:bg-stone-50 text-[#18191F] text-xs font-bold rounded-xl px-2 py-1.5 border border-[#E6DEC4] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] cursor-pointer"
                            >
                                {Object.keys(CURRENCIES).map((curr) => (
                                    <option key={curr} value={curr}>{curr} ({CURRENCIES[curr].symbol})</option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    if (ledgerScope === 'private') {
                                        setShowWorkspaceModal(true);
                                    } else {
                                        setLedgerScope('private');
                                        showToast("Switched to Personal Sandbox");
                                    }
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 ${ledgerScope === 'shared' ? 'bg-[#F59E0B] text-[#18191F]' : 'bg-white text-stone-600 border border-[#E6DEC4] hover:bg-stone-50'}`}
                                title="Switch Multi-Device Sync Space"
                            >
                                <Icon name={ledgerScope === 'shared' ? 'users' : 'user'} className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="px-5 py-5 space-y-6 flex-grow">

                    {/* Headline Banner (Matching image_886fda.jpg typographic style) */}
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 bg-[#18191F] text-stone-100 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                            Switching from traditional spreadsheets?
                        </div>
                        <h2 className="text-2xl font-black text-[#18191F] font-serif tracking-tight leading-none pt-1">
                            Same job. Very <span className="bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-md inline-block">different</span> balance.
                        </h2>
                    </div>

                    {/* RecurPost Dark High-Contrast Capsule Card (From image_886fda.jpg dark badge) */}
                    <div className="bg-[#18191F] rounded-2xl p-6 shadow-xl relative overflow-hidden text-stone-100">
                        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-2xl" />

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                {monthFilter ? `${new Date(monthFilter + '-02').toLocaleString('default', { month: 'long' })} Statement` : 'Total Standing'}
                            </span>
                            <div className="text-[9px] bg-white/10 px-2.5 py-1 rounded-full text-stone-200 font-bold uppercase tracking-wider">
                                Active Scope
                            </div>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between gap-1">
                            <h3 className="text-4xl font-black text-white tracking-tight">
                                {currencySymbol}{metrics.monthlyNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                            <span className="text-xs font-bold text-amber-400">Net Remaining</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/10 text-xs">
                            <div>
                                <p className="text-stone-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Income Inflow
                                </p>
                                <p className="text-sm font-black text-emerald-400 mt-1">
                                    {currencySymbol}{metrics.monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p className="text-stone-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Monthly Burn
                                </p>
                                <p className="text-sm font-black text-rose-400 mt-1">
                                    {currencySymbol}{metrics.monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FinAI Smart Strategist Container */}
                    <div className="bg-white rounded-2xl p-5 border border-[#E6DEC4] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                                    <Icon name="sparkles" className="w-4 h-4 text-[#D97706]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-[#18191F] font-serif">FinAI Pro Advisor</h3>
                                    <p className="text-[9px] text-stone-500">Intelligent ledger advisor</p>
                                </div>
                            </div>
                            <button
                                onClick={triggerGeminiAdvisor}
                                disabled={aiLoading}
                                className="text-[10px] font-black text-[#D97706] bg-[#FEF3C7] hover:bg-[#FDE68A] transition px-3 py-1.5 rounded-xl disabled:opacity-50"
                            >
                                {aiLoading ? 'Compiling...' : 'Run Advisor'}
                            </button>
                        </div>

                        {aiLoading && (
                            <div className="space-y-2.5 pt-1">
                                <div className="h-4 bg-stone-100 rounded-md animate-pulse w-3/4" />
                                <div className="h-3 bg-stone-100 rounded-md animate-pulse w-full" />
                                <div className="h-3 bg-stone-100 rounded-md animate-pulse w-5/6" />
                            </div>
                        )}

                        {aiError && (
                            <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 flex gap-2">
                                <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{aiError}</p>
                            </div>
                        )}

                        {aiAnalysis && !aiLoading && (
                            <div className="text-stone-700 text-xs leading-relaxed bg-[#FAF6F0] p-4 rounded-xl border border-[#E6DEC4] max-h-56 overflow-y-auto whitespace-pre-line custom-scrollbar">
                                {aiAnalysis}
                            </div>
                        )}

                        {!aiAnalysis && !aiLoading && !aiError && (
                            <p className="text-[10.5px] text-stone-500 leading-relaxed">
                                Click <span className="text-[#D97706] font-extrabold">Run Advisor</span> to pass your transactions to the AI strategist.
                            </p>
                        )}
                    </div>

                    {/* Allocation Doughnut Chart */}
                    <div className="bg-white rounded-2xl p-5 border border-[#E6DEC4] shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-[#18191F] flex items-center gap-2 font-serif text-sm">
                            <Icon name="chart" className="w-4 h-4 text-[#D97706]" /> Budget Allocation
                        </h3>

                        {donutChartSegments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                                <div className="w-11 h-11 rounded-full bg-[#FAF6F0] flex items-center justify-center border border-[#E6DEC4]">
                                    <Icon name="info" className="w-4 h-4 text-stone-400" />
                                </div>
                                <p className="text-xs text-stone-400">No expenses logged yet under this month scope</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center sm:flex-row sm:justify-around gap-6 py-1">
                                {/* Responsive Custom SVG Donut */}
                                <div className="relative w-36 h-36">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FAF6F0" strokeWidth="12" />
                                        {donutChartSegments.map((segment, idx) => {
                                            const r = 40;
                                            const circumference = 2 * Math.PI * r;
                                            const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;

                                            let offsetPercent = 0;
                                            for (let i = 0; i < idx; i++) {
                                                offsetPercent += donutChartSegments[i].percentage;
                                            }
                                            const strokeDashoffset = -((offsetPercent / 100) * circumference);

                                            const isHovered = activeChartSegment === idx;

                                            return (
                                                <circle
                                                    key={segment.key}
                                                    cx="50"
                                                    cy="50"
                                                    r={r}
                                                    fill="transparent"
                                                    stroke={
                                                        segment.key === 'salary' ? '#10b981' :
                                                            segment.key === 'food' ? '#F59E0B' :
                                                                segment.key === 'utilities' ? '#3b82f6' :
                                                                    segment.key === 'shopping' ? '#d946ef' :
                                                                        segment.key === 'transport' ? '#0ea5e9' :
                                                                            segment.key === 'leisure' ? '#a855f7' : '#78716c'
                                                    }
                                                    strokeWidth={isHovered ? 15 : 12}
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    className="transition-all duration-300 cursor-pointer"
                                                    onMouseEnter={() => setActiveChartSegment(idx)}
                                                    onMouseLeave={() => setActiveChartSegment(null)}
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Burn</span>
                                        <span className="text-sm font-black text-[#18191F]">
                                            {currencySymbol}{metrics.monthlyExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Legend list matching color swatches */}
                                <div className="flex-grow space-y-1 w-full max-w-[180px]">
                                    {donutChartSegments.map((segment, idx) => {
                                        const cat = CATEGORIES[segment.key] || CATEGORIES.other;
                                        const isHovered = activeChartSegment === idx;
                                        return (
                                            <div
                                                key={segment.key}
                                                className={`flex items-center justify-between text-xs p-1 rounded-lg transition-all duration-150 ${isHovered ? 'bg-stone-100' : ''}`}
                                                onMouseEnter={() => setActiveChartSegment(idx)}
                                                onMouseLeave={() => setActiveChartSegment(null)}
                                            >
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-sm">{cat.emoji}</span>
                                                    <span className="text-stone-600 truncate">{cat.label}</span>
                                                </div>
                                                <span className="text-stone-900 font-black">{segment.percentage.toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Transaction Entry Form */}
                    <div className="bg-white rounded-2xl p-5 border border-[#E6DEC4] shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-[#18191F] flex items-center gap-2 font-serif text-sm">
                            <Icon name="plus" className="w-4 h-4 text-[#D97706]" /> Log Transaction
                        </h3>

                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="e.g. Workspace stipend, Diner hub, Power bill"
                                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] placeholder:text-stone-400 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-1">Amount ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] placeholder:text-stone-400 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] cursor-pointer"
                                    >
                                        <option value="expense">Expense (-)</option>
                                        <option value="income">Income (+)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] cursor-pointer"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.emoji} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#18191F] hover:bg-stone-800 text-stone-100 text-xs font-bold py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                            >
                                <Icon name="plus" className="w-3.5 h-3.5 text-amber-400" /> Save Row to Cloud
                            </button>
                        </form>
                    </div>

                    {/* Ledger History Panel */}
                    <div className="bg-white rounded-2xl p-5 border border-[#E6DEC4] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-[#18191F] flex items-center gap-2 font-serif text-sm">
                                <Icon name="wallet" className="w-4 h-4 text-[#D97706]" /> Workspace Register
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handleExportCSV}
                                    className="p-1.5 text-stone-500 hover:text-[#18191F] bg-[#FAF6F0] rounded-lg border border-[#E6DEC4] transition-all"
                                    title="Export report sheets"
                                >
                                    <Icon name="download" className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] font-bold px-2 py-0.5 rounded-full">
                                    {processedLedgerList.length} Rows
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-8 relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by description..."
                                    className="w-full pl-8 pr-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] placeholder:text-stone-400 transition"
                                />
                                <svg className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="month"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    className="w-full px-2 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F] cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                            {processedLedgerList.length === 0 ? (
                                <div className="text-center py-10 text-stone-400 text-xs flex flex-col items-center justify-center space-y-2">
                                    <Icon name="info" className="w-6 h-6 text-stone-300" />
                                    <span>No ledger matched filters.</span>
                                </div>
                            ) : (
                                processedLedgerList.map((item) => {
                                    const catMeta = CATEGORIES[item.category] || CATEGORIES.other;
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3.5 bg-white border border-[#E6DEC4] hover:shadow-sm rounded-xl transition group"
                                        >
                                            <div className="flex items-center space-x-3 min-w-0">
                                                <div className={`w-8.5 h-8.5 rounded-lg ${catMeta.bg} flex items-center justify-center text-sm border ${catMeta.border}`}>
                                                    {catMeta.emoji}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#18191F] truncate pr-2">{item.description}</p>
                                                    <span className="text-[8px] text-stone-500 font-extrabold uppercase tracking-wider block mt-0.5">
                                                        {catMeta.label} • {item.date}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 shrink-0">
                                                <span className={`text-xs font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {item.type === 'income' ? '+' : '-'} {currencySymbol}{parseFloat(item.amount).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTransaction(item.id)}
                                                    className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-50 rounded transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <Icon name="trash" className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Share tool with RecurPost clean accent buttons */}
                    <div className="bg-white rounded-2xl p-5 border border-[#E6DEC4] shadow-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-[#FEF3C7] text-[#D97706] rounded-xl border border-amber-200">
                                <Icon name="share" className="w-5 h-5 text-[#D97706]" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-[#18191F] font-serif">Sync Report on WhatsApp</h4>
                                <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5">
                                    Generate and share a fully compiled text budget register sheet directly to friends or family.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleWhatsAppReport}
                            className="w-full bg-[#18191F] hover:bg-stone-800 text-stone-100 text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            Export Report to WhatsApp
                        </button>
                    </div>

                </main>
            </div>

            {/* Footer bar */}
            <footer className="bg-[#FAF6F0]/90 border-t border-[#E6DEC4] px-5 py-4 flex justify-between items-center absolute bottom-0 left-0 right-0 z-30 backdrop-blur-md">
                <div>
                    <p className="text-[9px] text-stone-500 uppercase font-black tracking-wider">All-Time Standing Net</p>
                    <p className="text-sm font-black text-[#D97706]">
                        {currencySymbol}{metrics.allTimeNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <button
                    onClick={() => setShowResetModal(true)}
                    className="text-[11px] font-black text-stone-500 hover:text-rose-600 transition flex items-center gap-1.5 p-2 rounded-lg hover:bg-stone-100"
                >
                    <Icon name="trash" className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" /> WIPE SANDBOX
                </button>
            </footer>

            {/* Workspace modal dialog */}
            {showWorkspaceModal && (
                <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center px-6">
                    <div className="bg-white border border-[#E6DEC4] p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="p-3 bg-[#FEF3C7] text-[#D97706] w-fit rounded-xl">
                            <Icon name="users" className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-[#18191F] font-serif">Collaborative Workspace ID</h4>
                            <p className="text-xs text-stone-500 mt-1">
                                Enter an identifier code to access or initialize a public collaborative ledger room with family.
                            </p>
                        </div>
                        <div>
                            <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Room Code ID</label>
                            <input
                                type="text"
                                value={tempWorkspaceId}
                                onChange={(e) => setTempWorkspaceId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                                placeholder="e.g. family-budget"
                                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#E6DEC4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-xs text-[#18191F]"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowWorkspaceModal(false)}
                                className="flex-1 py-2 bg-[#FAF6F0] hover:bg-stone-100 text-xs font-bold text-stone-600 border border-[#E6DEC4] rounded-xl transition"
                            >
                                Keep Private
                            </button>
                            <button
                                onClick={() => {
                                    if (!tempWorkspaceId.trim()) return;
                                    setWorkspaceId(tempWorkspaceId.trim());
                                    setLedgerScope('shared');
                                    setShowWorkspaceModal(false);
                                    showToast(`Connected: ${tempWorkspaceId}`);
                                }}
                                className="flex-1 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-xs font-bold text-[#18191F] rounded-xl transition"
                            >
                                Join & Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center px-6">
                    <div className="bg-white border border-[#E6DEC4] p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                        <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-xl border border-rose-200">
                            <Icon name="alert" className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-[#18191F] font-serif">Wipe Workspace Entries?</h4>
                            <p className="text-xs text-stone-500 mt-1">
                                You are about to completely clear all ledger records matching your active database scope view. This process cannot be reversed.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2 bg-[#FAF6F0] hover:bg-stone-100 text-xs font-bold text-stone-600 border border-[#E6DEC4] rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWipeDatabase}
                                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-xl transition"
                            >
                                Execute Wipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}