export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type MeetingStatus = 'requested' | 'confirmed' | 'declined';

export interface Meeting {
  id: string;
  title: string;
  organizerId: string;
  participantId: string;
  start: string;
  end: string;
  status: MeetingStatus;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  date: string;
  start: string;
  end: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export type PaymentAction = 'deposit' | 'withdraw' | 'transfer' | 'funding';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface PaymentTransaction {
  id: string;
  type: PaymentAction;
  amount: number;
  currency: string;
  senderId: string | null;
  receiverId: string | null;
  status: PaymentStatus;
  createdAt: string;
  description: string;
}

export interface WalletBalance {
  userId: string;
  balance: number;
  available: number;
  pending: number;
  currency: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}