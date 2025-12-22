import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLocalUser, updateLocalUser, clearLocalUser, LocalUser } from '../services/localUser';

interface UserContextType {
    user: LocalUser | null;
    themeColor: string;
    loading: boolean;
    updateUser: (nickname: string, color: string) => Promise<LocalUser>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [loading, setLoading] = useState(true);

    const themeColor = user?.color || '#007AFF';

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            setLoading(true);
            const localUser = await getLocalUser();
            setUser(localUser);
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (nickname: string, color: string) => {
        // 先嘗試更新現有用戶
        const updated = await updateLocalUser(nickname, color);
        if (updated) {
            setUser(updated);
            return updated;
        }
        // 如果沒有現有用戶（新用戶），重新載入以獲取剛保存的用戶
        await loadUser();
        const newUser = await getLocalUser();
        if (newUser) {
            setUser(newUser);
            return newUser;
        }
        throw new Error('無法創建或更新用戶');
    };

    const logout = async () => {
        await clearLocalUser();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, themeColor, loading, updateUser: updateProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
}
