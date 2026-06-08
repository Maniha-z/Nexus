import { entrepreneurs, investors, findUserById, users } from './users';
import { PaymentTransaction, WalletBalance, PaymentAction, PaymentStatus } from '../types';

export const walletBalances: WalletBalance[] = [
  { userId: 'e1', balance: 24800.75, available: 18200.75, pending: 6600, currency: 'USD' },
  { userId: 'e2', balance: 13920.5, available: 11200.5, pending: 2920, currency: 'USD' },
  { userId: 'e3', balance: 17840.0, available: 16240.0, pending: 1600, currency: 'USD' },
  { userId: 'e4', balance: 21450.25, available: 19850.25, pending: 1600, currency: 'USD' },
  { userId: 'i1', balance: 120400.0, available: 109300.0, pending: 11100, currency: 'USD' },
  { userId: 'i2', balance: 98050.0, available: 93500.0, pending: 4550, currency: 'USD' },
  { userId: 'i3', balance: 74000.0, available: 70000.0, pending: 4000, currency: 'USD' },
];

const now = new Date();

const formatDate = (offsetDays: number) => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date.toISOString();
};

export const transactions: PaymentTransaction[] = [
  {
    id: 'tx-1001',
    type: 'deposit',
    amount: 7500,
    currency: 'USD',
    senderId: null,
    receiverId: 'e1',
    status: 'completed',
    createdAt: formatDate(1),
    description: 'Stripe deposit to wallet',
  },
  {
    id: 'tx-1002',
    type: 'withdraw',
    amount: 1200,
    currency: 'USD',
    senderId: 'e1',
    receiverId: null,
    status: 'completed',
    createdAt: formatDate(2),
    description: 'Paypal withdrawal request',
  },
  {
    id: 'tx-1003',
    type: 'transfer',
    amount: 5500,
    currency: 'USD',
    senderId: 'i1',
    receiverId: 'e2',
    status: 'completed',
    createdAt: formatDate(3),
    description: 'Deal funding transfer',
  },
  {
    id: 'tx-1004',
    type: 'funding',
    amount: 18000,
    currency: 'USD',
    senderId: 'i2',
    receiverId: 'e3',
    status: 'pending',
    createdAt: formatDate(5),
    description: 'Funding deal proposal',
  },
  {
    id: 'tx-1005',
    type: 'deposit',
    amount: 3200,
    currency: 'USD',
    senderId: null,
    receiverId: 'i3',
    status: 'completed',
    createdAt: formatDate(4),
    description: 'Paypal deposit to wallet',
  },
];

export const getWalletByUserId = (userId: string) => {
  return walletBalances.find(wallet => wallet.userId === userId) || null;
};

export const getTransactionsForUser = (userId: string) => {
  return transactions
    .filter(tx => tx.senderId === userId || tx.receiverId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getEntrepreneurOptions = () => {
  return entrepreneurs.map(entrepreneur => ({
    id: entrepreneur.id,
    label: entrepreneur.startupName,
    description: entrepreneur.name,
  }));
};

export const getInvestorOptions = () => {
  return investors.map(investor => ({
    id: investor.id,
    label: investor.name,
    description: investor.email,
  }));
};

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
