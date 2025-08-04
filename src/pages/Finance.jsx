import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../entities/User";
import { FinanceProfile } from "../entities/FinanceProfile";
import { FinanceTransaction } from "../entities/FinanceTransaction";
import { FinancialGoal } from "../entities/FinancialGoal";
import { Liability } from "../entities/Liability";
import { FinancialTip } from "../entities/FinancialTip";
import { UserFinancialTipProgress } from "../entities/UserFinancialTipProgress";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  PlusCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Finance() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [tips, setTips] = useState([]);
  const [completedTips, setCompletedTips] = useState([]);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showLiabilityDialog, setShowLiabilityDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    monthly_income: '',
    tax_rate: '',
    k401_contribution: '',
    k401_employer_match: '',
    roth_ira_contribution: '',
    savings_goal_type: 'percentage',
    savings_goal_value: '',
    savings_goal_deadline: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'expense',
    spending_category: 'Fixed Costs',
    custom_category: '',
    description: '',
    notes: ''
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_amount: '',
    target_date: ''
  });
  const [newLiability, setNewLiability] = useState({
    name: '',
    type: 'credit_card',
    total_amount: '',
    monthly_payment: '',
    interest_rate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
      loadData().catch(console.error);
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const userData = await User.me(currentUser);
      if (!userData) {
        console.warn("User data is null, cannot load dependent data.");
        return;
      }
      setUser(userData);
      
      const profileData = await FinanceProfile.filter({ user_id: userData.id });
      if (profileData.length > 0) {
        setProfile(profileData[0]);
        setProfileData(profileData[0]);
      }
      
      const transactionData = await FinanceTransaction.filter({ user_id: userData.id });
      setTransactions(transactionData);
      
      const goalData = await FinancialGoal.filter({ user_id: userData.id });
      setGoals(goalData);
      
      const liabilityData = await Liability.filter({ user_id: userData.id });
      setLiabilities(liabilityData);
      
      const tipData = await FinancialTip.list();
      setTips(tipData);
      
      const completedTipData = await UserFinancialTipProgress.filter({ user_id: userData.id });
      setCompletedTips(completedTipData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    try {
      const data = {
        ...profileData,
        user_id: user.id,
        monthly_income: parseFloat(profileData.monthly_income) || 0,
        tax_rate: parseFloat(profileData.tax_rate) || 0,
        k401_contribution: parseFloat(profileData.k401_contribution) || 0,
        k401_employer_match: parseFloat(profileData.k401_employer_match) || 0,
        roth_ira_contribution: parseFloat(profileData.roth_ira_contribution) || 0,
        savings_goal_value: parseFloat(profileData.savings_goal_value) || 0
      };

      if (profile) {
        await FinanceProfile.update(profile.id, data);
      } else {
        await FinanceProfile.create(data);
      }
      
      setShowProfileDialog(false);
      loadData();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
      alert("Please fill in amount and description.");
      return;
    }

    try {
      await FinanceTransaction.create({
        ...newTransaction,
        user_id: user.id,
        amount: parseFloat(newTransaction.amount)
      });
      
      setNewTransaction({
        amount: '',
        type: 'expense',
        spending_category: 'Fixed Costs',
        custom_category: '',
        description: '',
        notes: ''
      });
      setShowTransactionDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) {
      alert("Please fill in title and target amount.");
      return;
    }

    try {
      await FinancialGoal.create({
        ...newGoal,
        user_id: user.id,
        target_amount: parseFloat(newGoal.target_amount)
      });
      
      setNewGoal({
        title: '',
        description: '',
        target_amount: '',
        target_date: ''
      });
      setShowGoalDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const addLiability = async () => {
    if (!newLiability.name || !newLiability.total_amount) {
      alert("Please fill in name and total amount.");
      return;
    }

    try {
      await Liability.create({
        ...newLiability,
        user_id: user.id,
        total_amount: parseFloat(newLiability.total_amount),
        monthly_payment: parseFloat(newLiability.monthly_payment) || 0,
        interest_rate: parseFloat(newLiability.interest_rate) || 0
      });
      
      setNewLiability({
        name: '',
        type: 'credit_card',
        total_amount: '',
        monthly_payment: '',
        interest_rate: ''
      });
      setShowLiabilityDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding liability:", error);
    }
  };

  const markTipCompleted = async (tipId) => {
    try {
      await UserFinancialTipProgress.create({
        user_id: user.id,
        tip_id: tipId
      });
      loadData();
    } catch (error) {
      console.error("Error marking tip as completed:", error);
    }
  };

  const isTipCompleted = (tipId) => {
    return completedTips.some(ct => ct.tip_id === tipId);
  };

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netWorth = totalIncome - totalExpenses;
  
  const totalDebt = liabilities.reduce((sum, l) => sum + l.total_amount, 0);
  const monthlyDebtPayments = liabilities.reduce((sum, l) => sum + l.monthly_payment, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Hub</h1>
          <p className="text-gray-600 mt-2">Manage your money and financial goals</p>
        </div>
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              {profile ? 'Edit Profile' : 'Setup Profile'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Financial Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Monthly Income ($)</Label>
                <Input
                  type="number"
                  value={profileData.monthly_income}
                  onChange={(e) => setProfileData({...profileData, monthly_income: e.target.value})}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={profileData.tax_rate}
                  onChange={(e) => setProfileData({...profileData, tax_rate: e.target.value})}
                  placeholder="25"
                />
              </div>
              <div>
                <Label>401k Contribution ($)</Label>
                <Input
                  type="number"
                  value={profileData.k401_contribution}
                  onChange={(e) => setProfileData({...profileData, k401_contribution: e.target.value})}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>401k Employer Match ($)</Label>
                <Input
                  type="number"
                  value={profileData.k401_employer_match}
                  onChange={(e) => setProfileData({...profileData, k401_employer_match: e.target.value})}
                  placeholder="250"
                />
              </div>
              <div>
                <Label>Roth IRA Contribution ($)</Label>
                <Input
                  type="number"
                  value={profileData.roth_ira_contribution}
                  onChange={(e) => setProfileData({...profileData, roth_ira_contribution: e.target.value})}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Savings Goal Type</Label>
                <Select value={profileData.savings_goal_type} onValueChange={(value) => setProfileData({...profileData, savings_goal_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Savings Goal Value</Label>
                <Input
                  type="number"
                  value={profileData.savings_goal_value}
                  onChange={(e) => setProfileData({...profileData, savings_goal_value: e.target.value})}
                  placeholder={profileData.savings_goal_type === 'percentage' ? '20' : '1000'}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProfile}>
                  Save Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">${totalIncome.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Income</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netWorth.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Net Worth</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">${totalDebt.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Debt</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={newTransaction.spending_category} onValueChange={(value) => setNewTransaction({...newTransaction, spending_category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed Costs">Fixed Costs</SelectItem>
                        <SelectItem value="Investments">Investments</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Guilt-Free Spending">Guilt-Free Spending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      placeholder="What was this for?"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addTransaction}>
                      Add Transaction
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-500">
                          {transaction.spending_category} • {transaction.date}
                        </p>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Goals</h3>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Target className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Financial Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="Emergency Fund"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      placeholder="Save for 6 months of expenses"
                    />
                  </div>
                  <div>
                    <Label>Target Amount ($)</Label>
                    <Input
                      type="number"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addGoal}>
                      Add Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{goal.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>${goal.current_amount?.toLocaleString() || 0} / ${goal.target_amount.toLocaleString()}</span>
                    </div>
                    <Progress value={(goal.current_amount || 0) / goal.target_amount * 100} />
                    {goal.target_date && (
                      <p className="text-xs text-gray-500">Target: {goal.target_date}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {goals.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="p-12 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No financial goals set yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Debts & Liabilities</h3>
            <Dialog open={showLiabilityDialog} onOpenChange={setShowLiabilityDialog}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Debt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Debt/Liability</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newLiability.name}
                      onChange={(e) => setNewLiability({...newLiability, name: e.target.value})}
                      placeholder="Credit Card, Student Loan, etc."
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newLiability.type} onValueChange={(value) => setNewLiability({...newLiability, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="student">Student Loan</SelectItem>
                        <SelectItem value="car">Car Loan</SelectItem>
                        <SelectItem value="home">Mortgage</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Total Amount ($)</Label>
                    <Input
                      type="number"
                      value={newLiability.total_amount}
                      onChange={(e) => setNewLiability({...newLiability, total_amount: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label>Monthly Payment ($)</Label>
                    <Input
                      type="number"
                      value={newLiability.monthly_payment}
                      onChange={(e) => setNewLiability({...newLiability, monthly_payment: e.target.value})}
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      value={newLiability.interest_rate}
                      onChange={(e) => setNewLiability({...newLiability, interest_rate: e.target.value})}
                      placeholder="18.5"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowLiabilityDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addLiability}>
                      Add Debt
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liabilities.map((liability) => (
              <Card key={liability.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{liability.name}</h4>
                    <Badge variant="outline">{liability.type.replace('_', ' ')}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">${liability.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">${liability.monthly_payment.toLocaleString()}</span>
                    </div>
                    {liability.interest_rate > 0 && (
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-medium">{liability.interest_rate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {liabilities.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="p-12 text-center">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No debts tracked yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <h3 className="text-lg font-semibold">Financial Tips & Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip) => {
              const isCompleted = isTipCompleted(tip.id);
              return (
                <Card key={tip.id} className={isCompleted ? 'bg-green-50 border-green-200' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-semibold">{tip.title}</h4>
                      </div>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markTipCompleted(tip.id)}
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{tip.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{tip.category}</span>
                      {tip.estimated_time && <span>{tip.estimated_time} min read</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}