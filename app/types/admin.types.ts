
export interface User {
  id: string;
  username: string;
  email: string;
  registeredAt: string;
  lastActive: string;
  lastLogin: string;
  lastLogout: string;
  usageCount: number;
  location: string;
  isActive: boolean;
}

export interface ResourceLimit {
  id: string;
  featureName: string;
  dailyLimit: number;
  monthlyLimit: number;
  description: string;
}

export interface UserResourceLimit extends ResourceLimit {
  userId: string;
  username: string;
}

export interface UsageLog {
  id: string;
  userId: string;
  username: string;
  featureId: string;
  featureName: string;
  location: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalUsersToday: number;
  totalUsageToday: number;
  topLocations: { location: string; count: number }[];
  recentActivities: UsageLog[];
  activeUsers: User[];
  weeklyUsage: { day: string; count: number }[];
}

export type AdminTab = 'dashboard' | 'resource' | 'users';