"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { storeService } from "@/services/storeService";

export type UserRole = "owner" | "admin" | "cashier";

interface StoreUser {
  id: string;
  email: string;
  role: UserRole;
  storeName: string;
}

interface AuthContextType {
  user: StoreUser | null;
  currentStoreId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isCashier: () => boolean;
  signup: (email: string, password: string, storeName: string) => Promise<boolean>;
  selectStore: (storeId: string) => void;
  availableStores: Array<{ id: string; name: string; role: UserRole }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<Array<{ id: string; name: string; role: UserRole }>>([]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserStores(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserStores(session.user);
      } else {
        setUser(null);
        setCurrentStoreId(null);
        setAvailableStores([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserStores = async (authUser: User) => {
    try {
      const stores = await storeService.getUserStores();
      
      if (stores.length > 0) {
        setAvailableStores(
          stores.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.store_users[0]?.role as UserRole,
          }))
        );

        // Auto-select first store or previously selected
        const savedStoreId = localStorage.getItem("selected_store_id");
        const storeToSelect = savedStoreId && stores.find(s => s.id === savedStoreId) 
          ? savedStoreId 
          : stores[0].id;

        setCurrentStoreId(storeToSelect);
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: stores.find(s => s.id === storeToSelect)?.store_users[0]?.role as UserRole,
          storeName: stores.find(s => s.id === storeToSelect)?.name || "",
        });
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        await loadUserStores(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (email: string, password: string, storeName: string): Promise<boolean> => {
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) return false;

      // Create store for the new user
      const store = await storeService.createStore({
        name: storeName,
        currency: "MVR",
        tax_rate: 0,
      });

      setCurrentStoreId(store.id);
      setUser({
        id: authData.user.id,
        email: authData.user.email!,
        role: "owner",
        storeName: store.name,
      });

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentStoreId(null);
    setAvailableStores([]);
    localStorage.removeItem("selected_store_id");
  };

  const selectStore = (storeId: string) => {
    const store = availableStores.find(s => s.id === storeId);
    if (store) {
      setCurrentStoreId(storeId);
      setUser(prev => prev ? { ...prev, role: store.role, storeName: store.name } : null);
      localStorage.setItem("selected_store_id", storeId);
    }
  };

  const isOwner = () => user?.role === "owner";
  const isAdmin = () => user?.role === "admin" || user?.role === "owner";
  const isCashier = () => user?.role === "cashier";

  return (
    <AuthContext.Provider
      value={{
        user,
        currentStoreId,
        login,
        logout,
        isOwner,
        isAdmin,
        isCashier,
        signup,
        selectStore,
        availableStores,
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