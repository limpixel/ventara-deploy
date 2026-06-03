// app/admin/utils/adminHelpers.ts
import { ResourceLimit, UserResourceLimit, User } from '../types/admin.types';

export const DEFAULT_RESOURCE_LIMITS: ResourceLimit[] = [
  { 
    id: 'forecast', 
    featureName: 'Forecasting / Prediksi', 
    dailyLimit: 10, 
    monthlyLimit: 100, 
    description: 'Prediksi kecepatan angin 1 jam ke depan' 
  },
  { 
    id: 'analitik', 
    featureName: 'Report Analytics', 
    dailyLimit: 20, 
    monthlyLimit: 200, 
    description: 'Analisis report dan prakiraan 7 hari' 
  },
  { 
    id: 'trends', 
    featureName: 'Trends Reports', 
    dailyLimit: 15, 
    monthlyLimit: 150, 
    description: 'Grafik tren suhu, kelembapan, dan angin' 
  },
  { 
    id: 'export', 
    featureName: 'Export Data', 
    dailyLimit: 5, 
    monthlyLimit: 50, 
    description: 'Ekspor data ke CSV/Excel' 
  },
];

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const syncUsersFromAuth = (): User[] => {
  const authUser = localStorage.getItem('ventara-user');
  const currentUsers = localStorage.getItem('ventara-users');
  let usersList: User[] = currentUsers ? JSON.parse(currentUsers) : [];
  
  if (authUser) {
    const parsedAuthUser = JSON.parse(authUser);
    const exists = usersList.some((u: User) => u.email === parsedAuthUser.email);
    
    if (!exists) {
      const newUser: User = {
        id: Date.now().toString(),
        username: parsedAuthUser.username,
        email: parsedAuthUser.email,
        registeredAt: parsedAuthUser.registeredAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        lastLogin: '',
        lastLogout: '',
        usageCount: 0,
        location: 'Unknown',
        isActive: true,
      };
      usersList.push(newUser);
      localStorage.setItem('ventara-users', JSON.stringify(usersList));
    }
  }
  
  return usersList;
};

export const getSampleUsers = (): User[] => [
  { 
    id: '1', 
    username: 'Administrator', 
    email: 'admin@ventara.id', 
    registeredAt: new Date().toISOString(), 
    lastActive: new Date().toISOString(), 
    lastLogin: new Date().toISOString(),
    lastLogout: '',
    usageCount: 45, 
    location: 'Jakarta', 
    isActive: true 
  },
  { 
    id: '2', 
    username: 'kakang_kukung', 
    email: 'kakang@example.com', 
    registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastLogout: '',
    usageCount: 23, 
    location: 'Bawean', 
    isActive: true 
  },
  { 
    id: '3', 
    username: 'joko_wind', 
    email: 'joko@example.com', 
    registeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), 
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogout: '',
    usageCount: 12, 
    location: 'Surabaya', 
    isActive: true 
  },
];