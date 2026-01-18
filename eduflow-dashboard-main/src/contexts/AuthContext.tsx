import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    username: string;
    role: 'ADMIN' | 'FORMATEUR' | 'ETUDIANT';
    token?: string;
    formateurEmail?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    registerStudent: (data: any) => Promise<boolean>;
    registerTrainer: (data: any) => Promise<boolean>;
    logout: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('eduflow_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Find primary role
                let role: User['role'] = 'ETUDIANT';
                if (data.roles.includes('ROLE_ADMIN')) role = 'ADMIN';
                else if (data.roles.includes('ROLE_FORMATEUR')) role = 'FORMATEUR';

                const loggedUser: User = {
                    username: data.username,
                    role: role,
                    token: data.token,
                    formateurEmail: data.formateurEmail
                };
                setUser(loggedUser);
                localStorage.setItem('eduflow_user', JSON.stringify(loggedUser));
                localStorage.setItem('eduflow_token', data.token);
                return true;
            }
        } catch (error) {
            console.error("Login error:", error);
        }
        return false;
    };

    const registerStudent = async (data: any): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/register/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const registerTrainer = async (data: any): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/register/trainer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('eduflow_user');
        localStorage.removeItem('eduflow_token');
    };

    const hasRole = (role: string): boolean => {
        return user?.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => user?.role === role);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                registerStudent,
                registerTrainer,
                logout,
                hasRole,
                hasAnyRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
