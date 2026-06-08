import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { CreditCard, ArrowUpRight, ArrowDownRight, Repeat, DollarSign, ChevronRight, Users, Gift } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWalletByUserId, getTransactionsForUser, getEntrepreneurOptions, getInvestorOptions, formatCurrency } from '../../data/payments';
import { findUserById } from '../../data/users';
import { PaymentAction, PaymentTransaction, WalletBalance } from '../../types';

const paymentActions: { key: PaymentAction; label: string; icon: React.ReactNode }[] = [
  { key: 'deposit', label: 'Deposit', icon: <ArrowDownRight size={18} /> },
  { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpRight size={18} /> },
  { key: 'transfer', label: 'Transfer', icon: <Repeat size={18} /> },
];

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<PaymentAction>('deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [recipientId, setRecipientId] = useState('');
  const [description, setDescription] = useState('');
  const [wallet, setWallet] = useState<WalletBalance | null>(user ? getWalletByUserId(user.id) : null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(user ? getTransactionsForUser(user.id) : []);

  const recipientOptions = useMemo(() => {
    if (!user) return [];
    return user.role === 'investor' ? getEntrepreneurOptions() : getInvestorOptions();
  }, [user]);

  const handleActionChange = (action: PaymentAction) => {
    setSelectedAction(action);
    setAmount('');
    setDescription('');
    setRecipientId('');
  };

  const updateWallet = (delta: number) => {
    setWallet(prev => prev ? { ...prev, balance: prev.balance + delta, available: prev.available + delta } : prev);
  };

  const addTransaction = (transaction: PaymentTransaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleSubmit = () => {
    if (!user) return;
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if ((selectedAction === 'transfer' || selectedAction === 'funding') && !recipientId) {
      toast.error('Select a recipient for this transfer');
      return;
    }

    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      type: selectedAction,
      amount: amountValue,
      currency: 'USD',
      senderId: selectedAction === 'deposit' ? null : user.id,
      receiverId: selectedAction === 'withdraw' ? null : recipientId || user.id,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: description || `${selectedAction} through ${paymentMethod}`,
    };

    if (selectedAction === 'deposit') {
      updateWallet(amountValue);
      toast.success('Deposit simulated successfully');
    } else {
      updateWallet(-amountValue);
      toast.success(selectedAction === 'withdraw' ? 'Withdrawal simulated successfully' : 'Transfer simulated successfully');
    }

    addTransaction(transaction);
    setAmount('');
    setDescription('');
    setRecipientId('');
  };

  if (!user) return null;

  const selectedRecipient = recipientId ? findUserById(recipientId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Deposit, withdraw, transfer funds, and manage mock deal funding flows.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 p-3 text-slate-700">
            <CreditCard size={20} />
          </span>
          <div className="text-right">
            <p className="text-sm text-gray-500">Connected account</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border-primary-100">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-primary-100 p-3 text-primary-700">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Wallet balance</p>
                <p className="text-2xl font-semibold text-primary-900">{wallet ? formatCurrency(wallet.balance) : '$0.00'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border-secondary-100">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-secondary-100 p-3 text-secondary-700">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Available balance</p>
                <p className="text-xl font-semibold text-secondary-900">{wallet ? formatCurrency(wallet.available) : '$0.00'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border-accent-100">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-accent-100 p-3 text-accent-700">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Funding deals</p>
                <p className="text-xl font-semibold text-accent-900">{transactions.filter(tx => tx.type === 'funding').length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border-success-100">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-success-100 p-3 text-success-700">
                <ChevronRight size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Recent actions</p>
                <p className="text-xl font-semibold text-success-900">{transactions.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <Card className="space-y-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Perform a transaction</h2>
                <p className="text-sm text-gray-500">Simulate deposits, withdrawals, and transfers in a secure mock environment.</p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {paymentActions.map(action => (
                <Button
                  key={action.key}
                  variant={selectedAction === action.key ? 'primary' : 'outline'}
                  onClick={() => handleActionChange(action.key)}
                  leftIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Amount</label>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                  />
                </div>

                {(selectedAction === 'transfer' || selectedAction === 'funding') && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Recipient</label>
                    <select
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-primary-500"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    >
                      <option value="">Select recipient</option>
                      {recipientOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label} — {option.description}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700">Payment method</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-primary-500"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Input
                    placeholder="Transaction note"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {selectedRecipient ? `Recipient selected: ${selectedRecipient.name}` : 'Select a recipient for transfers or funding deals.'}
                  </div>
                  <Button variant="primary" onClick={handleSubmit}>
                    Submit {selectedAction === 'funding' ? 'funding' : selectedAction}
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {user.role === 'investor' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Funding deal mock flow</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-500">Simulate an investor funding a deal with one of the entrepreneurs on the platform.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Entrepreneur</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-primary-500"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                  >
                    <option value="">Select entrepreneur</option>
                    {recipientOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label} — {option.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Funding amount</label>
                  <Input
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Proposal note</label>
                  <Input
                    placeholder="Funding for Q3 product expansion"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedAction('funding');
                    handleSubmit();
                  }}
                >
                  Send funding proposal
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transaction history</h2>
              <p className="text-sm text-slate-500">Review completed and pending payments across your wallet.</p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">From / To</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map(transaction => {
                  const sender = transaction.senderId ? findUserById(transaction.senderId) : null;
                  const receiver = transaction.receiverId ? findUserById(transaction.receiverId) : null;
                  return (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 text-slate-600">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 capitalize">{transaction.type}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(transaction.amount)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {sender ? `${sender.name} → ` : 'External → '}
                        {receiver ? receiver.name : 'External'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={transaction.status === 'completed' ? 'success' : transaction.status === 'pending' ? 'accent' : 'error'}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{transaction.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
