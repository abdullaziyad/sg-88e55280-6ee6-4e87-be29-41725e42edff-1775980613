"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { User } from "@/types";

export type UserRole = "admin" | "cashier";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  isCashier: () => boolean;
  createUser: (userData: Omit<User, "id" | "createdAt" | "createdBy">) => User;
  updateUser: (userId: string, updates: Partial<User>) => boolean;
  deleteUser: (userId: string) => boolean;
  getAllUsers: () => User[];
  changePassword: (userId: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "pos_users";
const DEFAULT_ADMIN: User = {
  id: "1",
  username: "admin",
  password: "admin123",
  name: "Admin User",
  role: "admin",
  isActive: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_CASHIER: User = {
  id: "2",
  username: "cashier",
  password: "cashier123",
  name: "Cashier",
  role: "cashier",
  isActive: true,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with default users
      const defaultUsers = [DEFAULT_ADMIN, DEFAULT_CASHIER];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }

    const storedUser = localStorage.getItem("pos_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const foundUser = currentUsers.find(
      (u: User) => u.username === username && u.password === password && u.isActive
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        username: foundUser.username,
        password: foundUser.password,
        name: foundUser.name,
        role: foundUser.role,
        phone: foundUser.phone,
        email: foundUser.email,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt,
        createdBy: foundUser.createdBy,
      };
      setUser(userData);
      localStorage.setItem("pos_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pos_user");
  };

  const isAdmin = () => user?.role === "admin";
  const isCashier = () => user?.role === "cashier";

  const createUser = (userData: Omit<User, "id" | "createdAt" | "createdBy">): User => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };

    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>): boolean => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const userIndex = currentUsers.findIndex((u: User) => u.id === userId);

    if (userIndex === -1) return false;

    currentUsers[userIndex] = { ...currentUsers[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
    setUsers(currentUsers);

    // Update current user if it's the same user
    if (user?.id === userId) {
      const updatedUser = currentUsers[userIndex];
      setUser(updatedUser);
      localStorage.setItem("pos_user", JSON.stringify(updatedUser));
    }

    return true;
  };

  const deleteUser = (userId: string): boolean => {
    // Prevent deleting yourself
    if (user?.id === userId) return false;

    const currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const updatedUsers = currentUsers.filter((u: User) => u.id !== userId);
    
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    return true;
  };

  const getAllUsers = (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  };

  const changePassword = (userId: string, newPassword: string): boolean => {
    return updateUser(userId, { password: newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isCashier,
        createUser,
        updateUser,
        deleteUser,
        getAllUsers,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}