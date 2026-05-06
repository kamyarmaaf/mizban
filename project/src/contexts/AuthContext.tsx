import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id?: number;
  username: string;
  name: string;
  phone: string;
  email?: string;
  user_type: 'visitor' | 'mizban' | 'admin';
  province?: string;
  city?: string;
  hosting_type?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

// ----------------------------- helpers --------------------------------
const API_BASE = 'http://127.0.0.1:8000';

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const getAccessToken = () => localStorage.getItem('access_token');

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
};

// ----------------------------- AuthProvider ----------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // بارگذاری اطلاعات ذخیره شده در localStorage هنگام mount
  useEffect(() => {
    const storedToken = getAccessToken();
    const storedProfile = localStorage.getItem('user_profile');
    if (storedToken && storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setUser(parsedProfile);
        setProfile(parsedProfile);
      } catch (e) {
        console.error('Failed to parse stored profile', e);
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  // تابع ورود (اتصال به بک‌اند)
  const signIn = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // پیام خطا از بک‌اند می‌تواند در data.error یا data.detail باشد
        const errorMsg = data.error || data.detail || 'نام کاربری یا رمز عبور اشتباه است';
        return { error: { message: errorMsg } };
      }

      // داده‌های برگشتی باید شامل access, refresh و فیلدهای کاربر باشد
      const { access, refresh, ...userData } = data;

      if (!access || !refresh) {
        return { error: { message: 'پاسخ سرور معتبر نیست (توکن موجود نیست)' } };
      }

      // ساخت پروفایل کاربر از اطلاعات دریافتی
      // توجه: بک‌اند شما ممکن است فیلد name را fullName یا name برگرداند
      const profileData: UserProfile = {
        id: userData.id,
        username: userData.username,
        name: userData.name || userData.full_name || '',
        phone: userData.phone || '',
        email: userData.email || '',
        user_type: userData.user_type || (
          userData.visitoruser ? 'visitor' : (userData.mizbanuser ? 'mizban' : 'admin')
        ),
        province: userData.province,
        city: userData.city,
        hosting_type: userData.hosting_type,
      };

      setTokens(access, refresh);
      localStorage.setItem('user_profile', JSON.stringify(profileData));

      setUser(profileData);
      setProfile(profileData);

      return { error: null };
    } catch (error) {
      console.error('Login network error:', error);
      return { error: { message: 'مشکل در ارتباط با سرور. لطفاً دوباره تلاش کنید.' } };
    }
  };

  const signOut = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = getAccessToken();

    // تلاش برای blacklist کردن توکن رفرش در بک‌اند (اختیاری)
    if (refreshToken && accessToken) {
      try {
        await fetch(`${API_BASE}/api/accounts/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (e) {
        console.warn('Logout API call failed', e);
      }
    }

    clearTokens();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------------- useAuth hook ----------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}




















// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { supabase, UserProfile } from '../lib/supabase';
//
// interface User {
//   id: string;
//   email?: string;
// }
//
// interface AuthContextType {
//   user: User | null;
//   profile: UserProfile | null;
//   loading: boolean;
//   signIn: (username: string, password: string) => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   const loadUserProfile = async (userId: string) => {
//     try {
//       const storedProfiles = localStorage.getItem('userProfiles');
//       const profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
//       const userProfile = profiles.find((p: UserProfile) => p.id === userId);
//
//       if (userProfile) {
//         setProfile(userProfile);
//       }
//     } catch (error) {
//       console.error('Error loading profile:', error);
//     }
//   };
//
//   useEffect(() => {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       const userData = JSON.parse(storedUser);
//       setUser(userData);
//       loadUserProfile(userData.id);
//     }
//     setLoading(false);
//   }, []);
//
//   const signIn = async (username: string, password: string) => {
//     try {
//       const mockUsers = [
//         {
//           id: 'tourist-1',
//           username: 'tourist',
//           password: 'tourist123',
//           profile: {
//             id: 'tourist-1',
//             full_name: 'کاربر گردشگر',
//             phone: '09123456789',
//             email: 'tourist@meezban.com',
//             role: 'tourist' as const,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           }
//         },
//         {
//           id: 'provider-1',
//           username: 'provider',
//           password: 'provider123',
//           profile: {
//             id: 'provider-1',
//             full_name: 'میزبان نمونه',
//             phone: '09123456788',
//             email: 'provider@meezban.com',
//             role: 'provider' as const,
//             province: 'تهران',
//             city: 'تهران',
//             hosting_type: 'تجربه‌های فرهنگی',
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           }
//         },
//         {
//           id: 'admin-1',
//           username: 'admin',
//           password: 'admin123',
//           profile: {
//             id: 'admin-1',
//             full_name: 'مدیر سیستم',
//             phone: '09123456787',
//             email: 'admin@meezban.com',
//             role: 'admin' as const,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           }
//         }
//       ];
//
//       const foundUser = mockUsers.find(
//         u => u.username === username && u.password === password
//       );
//
//       if (!foundUser) {
//         return { error: { message: 'نام کاربری یا رمز عبور اشتباه است' } };
//       }
//
//       const userData = {
//         id: foundUser.id,
//         email: foundUser.profile.email
//       };
//
//       setUser(userData);
//       setProfile(foundUser.profile);
//
//       localStorage.setItem('currentUser', JSON.stringify(userData));
//
//       const storedProfiles = localStorage.getItem('userProfiles');
//       const profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
//       const existingIndex = profiles.findIndex((p: UserProfile) => p.id === foundUser.id);
//
//       if (existingIndex >= 0) {
//         profiles[existingIndex] = foundUser.profile;
//       } else {
//         profiles.push(foundUser.profile);
//       }
//
//       localStorage.setItem('userProfiles', JSON.stringify(profiles));
//
//       return { error: null };
//     } catch (error) {
//       console.error('Login error:', error);
//       return { error: { message: 'خطا در ورود. لطفا دوباره تلاش کنید' } };
//     }
//   };
//
//   const signOut = async () => {
//     setUser(null);
//     setProfile(null);
//     localStorage.removeItem('currentUser');
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
//
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
