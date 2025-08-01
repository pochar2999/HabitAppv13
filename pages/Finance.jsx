
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@/entities/User';
import { FinanceProfile } from '@/entities/FinanceProfile';
import { Liability } from '@/entities/Liability';
import { FinanceTransaction } from '@/entities/FinanceTransaction';
import { FinancialGoal } from '@/entities/FinancialGoal';
import { FinancialTip } from '@/entities/FinancialTip';
import { UserFinancialTipProgress } from '@/entities/UserFinancialTipProgress';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Ensure Textarea is imported
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge'; // Added Badge import
import {
    Plus, TrendingUp, PiggyBank, Banknote, ShieldCheck, Target, BarChart2, Info, Upload, CheckCircle, ArrowRight, Lightbulb, BookOpen,
    Sparkles, // Added Sparkles for CashFlowTab
    DollarSign, CreditCard, Calendar, PieChart as PieChartIcon, BarChart3, Wallet, ArrowLeft // New Lucide icons
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts'; // Renamed PieChart to RechartsPieChart
import { format, parseISO, startOfMonth, endOfMonth, differenceInMonths, addMonths, differenceInCalendarDays, subDays } from 'date-fns';
import { UploadFile } from "@/integrations/Core";
import { Link } from "react-router-dom"; // Added Link import
import { createPageUrl } from "@/utils"; // Added createPageUrl import


// #region Onboarding Component
const FinanceOnboarding = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        user_id: user.id,
        savings_goal_type: "percentage" // Initialized savings_goal_type
    });
    const [liabilities, setLiabilities] = useState([]);
    const [newLiability, setNewLiability] = useState({ type: 'other', interest_rate: 0 });

    const handleProfileChange = (field, value) => {
        setProfile(p => ({ ...p, [field]: value }));
    };

    const addLiability = () => {
        if (newLiability.name && newLiability.total_amount && newLiability.monthly_payment) {
            setLiabilities([...liabilities, newLiability]);
            setNewLiability({ type: 'other', interest_rate: 0 });
        }
    };

    const finishOnboarding = async () => {
        try {
            await FinanceProfile.create(profile);
            if (liabilities.length > 0) {
                const liabilitiesWithUser = liabilities.map(l => ({ ...l, user_id: user.id }));
                await Liability.bulkCreate(liabilitiesWithUser);
            }
            await User.updateMyUserData({ finance_onboarding_completed: true }); // Changed to updateMyUserData
            onComplete();
        } catch (error) {
            console.error("Error completing onboarding:", error);
            // Optionally, handle error display to the user
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome to Your Financial System</DialogTitle>
                    <p className="text-sm text-gray-500">Let's set up your finances in a few quick steps. This will take about 5 minutes.</p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Step 1: Your Income</h3>
                            <div><Label>Monthly Pre-Tax Income ($)</Label><Input type="number" placeholder="e.g., 5000" onChange={e => handleProfileChange('monthly_income', parseFloat(e.target.value) || 0)} /></div>
                            <div><Label>Estimated Federal & State Tax Rate (%)</Label><Input type="number" placeholder="e.g., 22" onChange={e => handleProfileChange('tax_rate', parseFloat(e.target.value) || 0)} /></div>
                            <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">Next</Button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Step 2: Your Investments</h3>
                            <p className="text-sm text-gray-600">Enter your monthly automated contributions.</p>
                            <div><Label>Monthly 401(k) Contribution ($)</Label><Input type="number" placeholder="e.g., 500" onChange={e => handleProfileChange('k401_contribution', parseFloat(e.target.value) || 0)} /></div>
                            <div><Label>Employer 401(k) Match (%)</Label><Input type="number" placeholder="e.g., 4" onChange={e => handleProfileChange('k401_employer_match', parseFloat(e.target.value) || 0)} /></div>
                            <div><Label>Monthly Roth IRA Contribution ($)</Label><Input type="number" placeholder="e.g., 500" onChange={e => handleProfileChange('roth_ira_contribution', parseFloat(e.target.value) || 0)} /></div>
                            <div className="flex justify-between pt-4"><Button onClick={() => setStep(1)} variant="outline">Back</Button><Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button></div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Step 3: Your Debts</h3>
                            <p className="text-sm text-gray-600">Add any outstanding debts like loans or credit cards. Add as many as you need.</p>
                            <div className="space-y-2 p-4 border rounded-lg max-h-32 overflow-y-auto">{liabilities.map((l, i) => <div key={i} className="text-sm">{l.name}: ${l.total_amount}</div>)}</div>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                                <Input placeholder="Loan Name (e.g., Car Loan)" value={newLiability.name || ''} onChange={e => setNewLiability({ ...newLiability, name: e.target.value })} />
                                <Select value={newLiability.type} onValueChange={v => setNewLiability({ ...newLiability, type: v })}>
                                    <SelectTrigger><SelectValue placeholder="Type..." /></SelectTrigger>
                                    <SelectContent><SelectItem value="home">Mortgage</SelectItem><SelectItem value="car">Car Loan</SelectItem><SelectItem value="student">Student Loan</SelectItem><SelectItem value="credit_card">Credit Card</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                                </Select>
                                <Input type="number" placeholder="Total Amount Owed ($)" value={newLiability.total_amount || ''} onChange={e => setNewLiability({ ...newLiability, total_amount: parseFloat(e.target.value) })} />
                                <Input type="number" placeholder="Minimum Monthly Payment ($)" value={newLiability.monthly_payment || ''} onChange={e => setNewLiability({ ...newLiability, monthly_payment: parseFloat(e.target.value) })} />
                                <Input type="number" placeholder="Interest Rate (%)" value={newLiability.interest_rate || ''} onChange={e => setNewLiability({ ...newLiability, interest_rate: parseFloat(e.target.value) })} />
                                <Button onClick={addLiability} variant="outline" className="col-span-2">Add This Debt</Button>
                            </div>
                            <div className="flex justify-between pt-4"><Button onClick={() => setStep(2)} variant="outline">Back</Button><Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700 text-white">Next</Button></div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Step 4: Your Savings Goals</h3>
                            <p className="text-sm text-gray-600">How do you want to define your primary savings goal?</p>
                            <div>
                                <Select value={profile.savings_goal_type} onValueChange={v => handleProfileChange('savings_goal_type', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select savings method..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage of my income</SelectItem>
                                        <SelectItem value="amount">A specific dollar amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {profile.savings_goal_type === 'percentage' &&
                                <div><Label>Percentage of Post-Tax Income to Save (%)</Label><Input type="number" placeholder="Ramit suggests 10%" onChange={e => handleProfileChange('savings_goal_value', parseFloat(e.target.value) || 0)} /></div>
                            }
                            {profile.savings_goal_type === 'amount' &&
                                <div><Label>Monthly Savings Amount ($)</Label><Input type="number" onChange={e => handleProfileChange('savings_goal_value', parseFloat(e.target.value) || 0)} /></div>
                            }
                            <div className="flex justify-between pt-4"><Button onClick={() => setStep(3)} variant="outline">Back</Button><Button onClick={finishOnboarding} className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg">All Done! Take Me to My Hub</Button></div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
// #endregion

// #region Edit Profile Dialog
const EditProfileDialog = ({ user, profile, liabilities, show, onHide, onSave }) => {
    const [editedProfile, setEditedProfile] = useState(profile);
    const [editedLiabilities, setEditedLiabilities] = useState(liabilities);

    useEffect(() => {
        setEditedProfile(profile);
        setEditedLiabilities(liabilities);
    }, [profile, liabilities]);

    const handleProfileChange = (field, value) => {
        setEditedProfile(p => ({ ...p, [field]: value }));
    };

    const handleLiabilityChange = (index, field, value) => {
        const updated = [...editedLiabilities];
        // Handle number inputs specifically
        if (['total_amount', 'monthly_payment', 'interest_rate'].includes(field)) {
            updated[index][field] = parseFloat(value) || 0; // Use 0 if parsing fails
        } else {
            updated[index][field] = value;
        }
        setEditedLiabilities(updated);
    };
    
    const handleSaveChanges = async () => {
        await onSave(editedProfile, editedLiabilities);
        onHide();
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Financial Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <h3 className="font-semibold text-lg">Income & Investments</h3>
                    <div><Label>Monthly Pre-Tax Income ($)</Label><Input type="number" value={editedProfile?.monthly_income ?? ''} onChange={e => handleProfileChange('monthly_income', parseFloat(e.target.value) || 0)} /></div>
                    <div><Label>Estimated Tax Rate (%)</Label><Input type="number" value={editedProfile?.tax_rate ?? ''} onChange={e => handleProfileChange('tax_rate', parseFloat(e.target.value) || 0)} /></div>
                    <div><Label>Monthly 401(k) Contribution ($)</Label><Input type="number" value={editedProfile?.k401_contribution ?? ''} onChange={e => handleProfileChange('k401_contribution', parseFloat(e.target.value) || 0)} /></div>
                    <div><Label>Employer 401(k) Match (%)</Label><Input type="number" value={editedProfile?.k401_employer_match ?? ''} onChange={e => handleProfileChange('k401_employer_match', parseFloat(e.target.value) || 0)} /></div>
                    <div><Label>Monthly Roth IRA Contribution ($)</Label><Input type="number" value={editedProfile?.roth_ira_contribution ?? ''} onChange={e => handleProfileChange('roth_ira_contribution', parseFloat(e.target.value) || 0)} /></div>
                    
                    <h3 className="font-semibold text-lg">Debts & Liabilities</h3>
                    {editedLiabilities.length === 0 ? (
                        <p className="text-gray-500">No liabilities to display.</p>
                    ) : (
                        editedLiabilities.map((liability, index) => (
                            <div key={liability.id || `new-${index}`} className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                               <Input placeholder="Loan Name" value={liability.name ?? ''} onChange={e => handleLiabilityChange(index, 'name', e.target.value)} />
                               <Input type="number" placeholder="Total Amount Owed ($)" value={liability.total_amount ?? ''} onChange={e => handleLiabilityChange(index, 'total_amount', e.target.value)} />
                               <Input type="number" placeholder="Monthly Payment ($)" value={liability.monthly_payment ?? ''} onChange={e => handleLiabilityChange(index, 'monthly_payment', e.target.value)} />
                               <Input type="number" placeholder="Interest Rate (%)" value={liability.interest_rate ?? ''} onChange={e => handleLiabilityChange(index, 'interest_rate', e.target.value)} />
                            </div>
                        ))
                    )}
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onHide}>Cancel</Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// #endregion

// #region Main Hub Component
export default function Finance() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [liabilities, setLiabilities] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [tips, setTips] = useState([]);
    const [completedTips, setCompletedTips] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const [showTransactionDialog, setShowTransactionDialog] = useState(false);
    const [newTransaction, setNewTransaction] = useState({});
    const [receiptFile, setReceiptFile] = useState(null);

    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

    const loadData = async () => {
        try {
            setLoading(true);
            const userData = await User.me();
            setUser(userData);
            if (!userData.finance_onboarding_completed) {
                setLoading(false);
                return;
            }
            const [profileData, liabilityData, transData, goalData, tipData, completedTipData] = await Promise.all([
                FinanceProfile.filter({ user_id: userData.id }),
                Liability.filter({ user_id: userData.id }),
                FinanceTransaction.filter({ user_id: userData.id }),
                FinancialGoal.filter({ user_id: userData.id }),
                FinancialTip.list(),
                UserFinancialTipProgress.filter({ user_id: userData.id })
            ]);
            setProfile(profileData[0]);
            setLiabilities(liabilityData);
            setTransactions(transData);
            setGoals(goalData);
            setTips(tipData);
            setCompletedTips(completedTipData.map(ct => ct.tip_id));
        } catch (error) {
            console.error("Error loading finance data:", error);
            // Consider displaying an error message to the user
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveTransaction = async () => {
        let receipt_url = '';
        if (receiptFile) {
            const result = await UploadFile({ file: receiptFile });
            receipt_url = result.file_url;
        }

        const transactionData = {
            ...newTransaction,
            user_id: user.id,
            receipt_url
        };
        await FinanceTransaction.create(transactionData);

        const transData = await FinanceTransaction.filter({ user_id: user.id });
        setTransactions(transData);

        setShowTransactionDialog(false);
        setNewTransaction({});
        setReceiptFile(null);
    };
    
    const handleProfileUpdate = async (updatedProfile, updatedLiabilities) => {
        try {
            await FinanceProfile.update(updatedProfile.id, updatedProfile);
            
            // This is a simplified update. A more robust solution might need to diff arrays.
            // For existing liabilities, update them. This dialog currently doesn't support adding/deleting liabilities.
            for (const liability of updatedLiabilities) {
                if (liability.id) { // Ensure it's an existing liability
                    await Liability.update(liability.id, liability);
                }
            }
            
            loadData(); // Reload all data to reflect changes
        } catch (error) {
            console.error("Error updating profile:", error);
            // Optionally, show an error message to the user
        }
    };

    const monthlyTransactions = useMemo(() => {
        if (!currentMonth) return [];
        const monthStart = startOfMonth(parseISO(currentMonth + '-01')); // Ensure valid date for parseISO
        const monthEnd = endOfMonth(parseISO(currentMonth + '-01')); // Ensure valid date for parseISO
        return transactions.filter(t => {
            const tDate = parseISO(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });
    }, [transactions, currentMonth]);

    const stats = useMemo(() => {
        if (!profile) return { income: 0, fixedCosts: 0, investments: 0, savings: 0, guiltFree: 0, net: 0, postTaxIncome: 0 };

        const grossIncome = profile.monthly_income;
        const postTaxIncome = grossIncome * (1 - (profile.tax_rate || 0) / 100);

        const monthExpenses = monthlyTransactions.filter(t => t.type === 'expense');
        const fixedCosts = monthExpenses.filter(e => e.spending_category === 'Fixed Costs').reduce((sum, e) => sum + e.amount, 0);
        const guiltFree = monthExpenses.filter(e => e.spending_category === 'Guilt-Free Spending').reduce((sum, e) => sum + e.amount, 0);

        const investments = (profile.k401_contribution || 0) + (profile.roth_ira_contribution || 0); // Ensure numbers for addition

        let savings = 0;
        if (profile.savings_goal_type === 'percentage') {
            savings = postTaxIncome * ((profile.savings_goal_value || 0) / 100); // Ensure number for division
        } else {
            savings = profile.savings_goal_value || 0;
        }

        // Only include actual debt payments in fixed costs for proper calculation
        const totalMonthlyDebtPayments = liabilities.reduce((sum, l) => sum + (l.monthly_payment || 0), 0);
        const effectiveFixedCosts = fixedCosts + totalMonthlyDebtPayments; // Add debt payments to fixed costs

        const totalOutflow = effectiveFixedCosts + investments + savings + guiltFree;
        const net = postTaxIncome - totalOutflow;

        return {
            income: grossIncome,
            postTaxIncome,
            fixedCosts: effectiveFixedCosts, // Return effective fixed costs
            investments,
            savings,
            guiltFree,
            net
        };
    }, [monthlyTransactions, profile, liabilities]); // Added liabilities to dependencies

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check user.finance_onboarding_completed directly after loading
    if (!user.finance_onboarding_completed) {
        return <FinanceOnboarding user={user} onComplete={loadData} />;
    }

    if (!profile) return <div>Error loading profile. Please try again.</div>

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <Link to={createPageUrl("Features")}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Smart Finance Hub</h1>
                    <p className="text-gray-600 mt-1">Your complete financial planning center</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    {/* H1 and P moved above for correct structure */}
                </div>
                <div className="flex items-center gap-2">
                    <Input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="w-48" />
                    <Button onClick={() => setShowEditDialog(true)} variant="outline">Edit Profile</Button>
                    <Button onClick={() => setShowTransactionDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />Add Transaction
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="cash-flow" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="investments">Investments</TabsTrigger>
                    <TabsTrigger value="debt">Debt Payoff</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="cash-flow" className="pt-4">
                    <CashFlowTab stats={stats} transactions={monthlyTransactions} />
                </TabsContent>
                <TabsContent value="goals" className="pt-4">
                    <GoalsTab goals={goals} loadData={loadData} user={user} />
                </TabsContent>
                <TabsContent value="investments" className="pt-4">
                    <InvestmentsTab profile={profile} />
                </TabsContent>
                <TabsContent value="debt" className="pt-4">
                    <DebtPayoffTab liabilities={liabilities} />
                </TabsContent>
                <TabsContent value="calendar" className="pt-4">
                    <FinancialCalendarTab liabilities={liabilities} goals={goals} />
                </TabsContent>
                <TabsContent value="tips" className="pt-4">
                    <TipsTab tips={tips} completedTips={completedTips} loadData={loadData} user={user} />
                </TabsContent>
            </Tabs>

            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add a New Transaction</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Select onValueChange={v => setNewTransaction({ ...newTransaction, type: v })}>
                            <SelectTrigger><SelectValue placeholder="Income or Expense..." /></SelectTrigger>
                            <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                        </Select>
                        <Input placeholder="Description" onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} />
                        <Input type="number" placeholder="Amount" onChange={e => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })} />
                        <Input type="date" onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} />

                        {newTransaction.type === 'expense' && (
                            <Select onValueChange={v => setNewTransaction({ ...newTransaction, spending_category: v })}>
                                <SelectTrigger><SelectValue placeholder="Conscious Spending Category..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed Costs">Fixed Costs</SelectItem>
                                    <SelectItem value="Guilt-Free Spending">Guilt-Free Spending</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <Input placeholder="Custom Category (e.g., Groceries, Rent)" onChange={e => setNewTransaction({ ...newTransaction, custom_category: e.target.value })} />
                        <Textarea placeholder="Notes..." onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })} />
                        <div><Label>Upload Receipt</Label><Input type="file" onChange={(e) => setReceiptFile(e.target.files[0])} /></div>
                        <Button onClick={handleSaveTransaction} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Transaction</Button>
                    </div>
                </DialogContent>
            </Dialog>
            
            {profile && (
                <EditProfileDialog 
                    user={user}
                    profile={profile}
                    liabilities={liabilities}
                    show={showEditDialog}
                    onHide={() => setShowEditDialog(false)}
                    onSave={handleProfileUpdate}
                />
            )}

        </div>
    );
}
// #endregion

// #region Tab Components

const CashFlowTab = ({ stats, transactions }) => {
    const spendingData = [
        { name: 'Fixed Costs', value: stats.fixedCosts, target: stats.postTaxIncome * 0.5 },
        { name: 'Investments', value: stats.investments, target: stats.postTaxIncome * 0.1 },
        { name: 'Savings', value: stats.savings, target: stats.postTaxIncome * 0.1 },
        { name: 'Guilt-Free', value: stats.guiltFree, target: stats.postTaxIncome * 0.3 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <StatCard title="Post-Tax Monthly Income" value={`$${stats.postTaxIncome.toFixed(2)}`} icon={Banknote} />
                <StatCard title="Fixed Costs" value={`$${stats.fixedCosts.toFixed(2)}`} icon={ShieldCheck} />
                <StatCard title="Investments" value={`$${stats.investments.toFixed(2)}`} icon={TrendingUp} />
                <StatCard title="Savings" value={`$${stats.savings.toFixed(2)}`} icon={PiggyBank} />
                <StatCard title="Guilt-Free Spending" value={`$${stats.guiltFree.toFixed(2)}`} icon={Sparkles} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Conscious Spending Plan</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart> {/* Changed to RechartsPieChart */}
                                <RechartsPieChart data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {spendingData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </RechartsPieChart>
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                    <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                        {transactions.length === 0 ? (
                            <p className="text-gray-500 text-center">No transactions for this month.</p>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium">{t.description}</p>
                                        <p className="text-xs text-gray-500">{t.custom_category || t.spending_category}</p>
                                    </div>
                                    <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>${t.amount.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const GoalsTab = ({ goals, loadData, user }) => {
    const [showGoalDialog, setShowGoalDialog] = useState(false);
    const [newGoal, setNewGoal] = useState({});

    const handleSaveGoal = async () => {
        await FinancialGoal.create({ ...newGoal, user_id: user.id });
        setShowGoalDialog(false);
        setNewGoal({});
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => setShowGoalDialog(true)}><Plus className="w-4 h-4 mr-2" /> New Goal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">
                        <p>No goals set yet. Click "New Goal" to add your first goal!</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                        return (
                            <Card key={goal.id}>
                                <CardHeader><CardTitle>{goal.title}</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                    <p className="font-bold text-lg">${(goal.current_amount || 0).toFixed(2)} / <span className="text-gray-600">${(goal.target_amount || 0).toFixed(2)}</span></p>
                                    <Progress value={progress} className="mt-2" />
                                    {goal.target_date && <p className="text-xs text-gray-500 mt-2">Target: {format(parseISO(goal.target_date), 'MMM yyyy')}</p>}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create a New Financial Goal</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Goal Title (e.g., House Down Payment)" onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
                        <Textarea placeholder="Description..." onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} />
                        <Input type="number" placeholder="Target Amount ($)" onChange={e => setNewGoal({ ...newGoal, target_amount: parseFloat(e.target.value) })} />
                        <Input type="number" placeholder="Current Amount Saved ($)" onChange={e => setNewGoal({ ...newGoal, current_amount: parseFloat(e.target.value) })} />
                        <div><Label>Target Date</Label><Input type="date" onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} /></div>
                        <Button onClick={handleSaveGoal} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Goal</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const InvestmentsTab = ({ profile }) => {
    const investmentData = useMemo(() => {
        const data = [];
        let currentValue = 0;
        const monthlyContribution = (profile.k401_contribution || 0) + (profile.roth_ira_contribution || 0);
        const annualReturnRate = 0.08; // Average 8% return

        for (let year = 0; year <= 30; year++) {
            data.push({ year: `Year ${year}`, value: currentValue });
            currentValue = (currentValue + (monthlyContribution * 12)) * (1 + annualReturnRate);
        }
        return data;
    }, [profile]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Automated Investment Plan</CardTitle>
                    <p className="text-sm text-gray-600">This is the "set it and forget it" engine of your wealth.</p>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                    <StatCard title="Monthly 401(k)" value={`$${(profile.k401_contribution || 0).toFixed(2)}`} icon={TrendingUp} />
                    <StatCard title="Monthly Roth IRA" value={`$${(profile.roth_ira_contribution || 0).toFixed(2)}`} icon={TrendingUp} />
                    <StatCard title="Total Monthly Investment" value={`$${((profile.k401_contribution || 0) + (profile.roth_ira_contribution || 0)).toFixed(2)}`} icon={TrendingUp} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Simulated 30-Year Growth</CardTitle>
                    <p className="text-sm text-gray-600">Based on your contributions with an average 8% annual return.</p>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={investmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Portfolio Value" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

const DebtPayoffTab = ({ liabilities }) => {
    const [strategy, setStrategy] = useState('avalanche'); // 'avalanche' or 'snowball'

    const sortedLiabilities = useMemo(() => {
        const toSort = [...liabilities];
        if (strategy === 'avalanche') {
            return toSort.sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0));
        }
        return toSort.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));
    }, [liabilities, strategy]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Debt Payoff Plan</CardTitle>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">Choose your strategy to become debt-free.</p>
                        <Select value={strategy} onValueChange={setStrategy}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
                                <SelectItem value="snowball">Snowball (Lowest Balance First)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {liabilities.length === 0 ? (
                        <p className="text-gray-500 text-center">No liabilities added yet. Add them in the onboarding or profile settings.</p>
                    ) : (
                        sortedLiabilities.map(debt => (
                            <Card key={debt.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{debt.name} ({debt.type})</h4>
                                        <p className="text-sm text-gray-500">Interest Rate: {(debt.interest_rate || 0)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">${(debt.total_amount || 0).toFixed(2)}</p>
                                        <p className="text-xs text-right text-gray-500">Min. Payment: ${(debt.monthly_payment || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const FinancialCalendarTab = ({ liabilities, goals }) => {
    const events = useMemo(() => {
        const today = new Date();
        const nextMonth = addMonths(today, 1); // Consider events for current and next month

        const billEvents = liabilities.map(l => {
            // Find the next upcoming payment date for the current month or next month
            let paymentDate = new Date(today.getFullYear(), today.getMonth(), 15);
            if (paymentDate < today) { // If mid-month date already passed for current month
                paymentDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);
            }

            return {
                id: `liability-${l.id}`,
                title: `Payment for ${l.name}`,
                date: format(paymentDate, 'yyyy-MM-dd'),
                color: 'red'
            };
        });
        const goalEvents = goals
            .filter(g => g.target_date && parseISO(g.target_date) >= today) // Only future goals
            .map(g => ({
                id: `goal-${g.id}`,
                title: `Deadline for ${g.title}`,
                date: g.target_date,
                color: 'green'
            }));
        return [...billEvents, ...goalEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [liabilities, goals]);

    // Simplified calendar display
    return (
        <Card>
            <CardHeader><CardTitle>Financial Calendar</CardTitle></CardHeader>
            <CardContent>
                <p>This calendar shows your upcoming bill payments and goal deadlines.</p>
                <div className="mt-4 space-y-2">
                    {events.length === 0 ? (
                        <p className="text-gray-500 text-center">No upcoming financial events.</p>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex items-center gap-2 p-2 rounded-md" style={{ borderLeft: `4px solid ${event.color}` }}>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-gray-600">{format(parseISO(event.date), 'MMMM dd, yyyy')}</p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const TipsTab = ({ tips, completedTips, loadData, user }) => {
    const handleCompleteTip = async (tipId) => {
        await UserFinancialTipProgress.create({
            user_id: user.id,
            tip_id: tipId,
            completed_date: format(new Date(), 'yyyy-MM-dd')
        });
        loadData();
    };

    return (
        <div className="space-y-6">
            {tips.length === 0 ? (
                <p className="text-gray-500 text-center">No financial tips available at the moment.</p>
            ) : (
                tips.map(tip => {
                    const isCompleted = completedTips.includes(tip.id);
                    return (
                        <Card key={tip.id} className={isCompleted ? 'bg-green-50 border-green-200' : ''}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{tip.title}</CardTitle>
                                        <p className="text-sm text-gray-500">{tip.category} • {tip.estimated_time} min read</p>
                                    </div>
                                    {isCompleted ? <CheckCircle className="w-6 h-6 text-green-500" /> : null}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-700">{tip.content}</p>
                                {!isCompleted &&
                                    <Button onClick={() => handleCompleteTip(tip.id)} size="sm">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Read
                                    </Button>
                                }
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value }) => (
    <Card className="text-center">
        <CardContent className="p-4">
            <Icon className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
        </CardContent>
    </Card>
);
// #endregion
