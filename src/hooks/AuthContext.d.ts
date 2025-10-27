import type { ReactNode } from 'react';
export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}
export interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}
export interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthContext: import("react").Context<AuthContextType | undefined>;
