"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { storeService } from "@/services/storeService";
import { syncEngine } from "@/lib/syncEngine";
import { auditService } from "@/services/auditService";

export type UserRole = "owner" | "admin" | "cashier";

interface StoreUser {
  id: string;
  email: string;
  name: string;
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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<Array<{ id: string; name: string; role: UserRole }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserStores(session.user);
        }
      } catch (error) {
        console.error("Init auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserStores(session.user);
      } else {
        setUser(null);
        setCurrentStoreId(null);
        setAvailableStores([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserStores = async (authUser: User): Promise<{ storeId: string; storeUser: StoreUser } | null> => {
    try {
      console.log("Loading stores for user:", authUser.id);
      const stores = await storeService.getUserStores();
      console.log("Found stores:", stores.length);
      
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

        const selectedStore = stores.find(s => s.id === storeToSelect);
        
        console.log("Setting current store:", storeToSelect);
        const newStoreId = storeToSelect;
        const newUser: StoreUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.email?.split('@')[0] || "User",
          role: selectedStore?.store_users[0]?.role as UserRole || "owner",
          storeName: selectedStore?.name || "",
        };

        setCurrentStoreId(newStoreId);
        setUser(newUser);

        console.log("User state set:", newUser);
        console.log("Store ID set:", newStoreId);

        // Log login (don't block on failure)
        auditService.logAction({
          storeId: newStoreId,
          action: "login",
          entityType: "user",
          entityId: authUser.id,
        }).catch(err => console.warn("Failed to log login:", err));

        return { storeId: newStoreId, storeUser: newUser };
      } else {
        console.error("No stores found for user - this shouldn't happen after signup");
        // User exists but has no stores - they should create one
        throw new Error("No store found for your account. Please contact support or try signing up again.");
      }
    } catch (error: any) {
      console.error("Error loading stores:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Login attempt for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Check if it's an email confirmation issue
        if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          throw new Error("Please confirm your email address before logging in. Check your inbox for the confirmation link.");
        }
        
        throw error;
      }
      
      if (data.user && data.session) {
        console.log("Login successful, session established");
        
        // Load stores and wait for state to be set
        const result = await loadUserStores(data.user);
        
        if (!result) {
          throw new Error("Failed to load store information");
        }
        
        console.log("Login complete - User and store loaded");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const signup = async (email: string, password: string, storeName: string): Promise<boolean> => {
    try {
      console.log("Starting signup process...");
      
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("No user returned from signup");
      }

      console.log("User created:", authData.user.id);

      // Check if email confirmation is required
      if (!authData.session) {
        console.log("Email confirmation required");
        throw new Error("Account created! Please check your email and click the confirmation link before logging in.");
      }

      console.log("Session established, creating store...");

      // Verify we actually have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        throw new Error("Account created! Please check your email and confirm your account before logging in.");
      }

      console.log("Creating store:", storeName);

      // Create store for the new user
      try {
        const store = await storeService.createStore({
          name: storeName,
          settings: {
            shop: {
              businessName: storeName,
              businessAddress: "",
              businessPhone: "",
              businessEmail: email,
            },
            system: { 
              currency: "MVR",
              currencySymbol: "ރ.",
              dateFormat: "DD/MM/YYYY" as const,
              timeFormat: "12h" as const,
              lowStockThreshold: 10
            }
          } as any,
        });

        console.log("Store created successfully:", store.id);

        setCurrentStoreId(store.id);
        setAvailableStores([{ id: store.id, name: store.name, role: "owner" }]);
        setUser({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.email?.split('@')[0] || "User",
          role: "owner",
          storeName: store.name,
        });

        // Log store creation (async, don't block on failure)
        auditService.logAction({
          storeId: store.id,
          action: "create",
          entityType: "store",
          entityId: store.id,
          newData: { name: storeName, owner: email },
        }).catch(err => console.warn("Failed to log store creation:", err));

        console.log("Signup completed successfully");
        return true;
      } catch (storeError: any) {
        console.error("Store creation error:", storeError);
        throw new Error(`Failed to create store: ${storeError.message || "Unknown error"}. Please try again or contact support.`);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Signup failed");
    }
  };

  const logout = async () => {
    try {
      // Log logout before clearing state (don't block on failure)
      if (currentStoreId && user) {
        auditService.logAction({
          storeId: currentStoreId,
          action: "logout",
          entityType: "user",
          entityId: user.id,
        }).catch(err => console.warn("Failed to log logout:", err));
      }

      await supabase.auth.signOut();
      setUser(null);
      setCurrentStoreId(null);
      setAvailableStores([]);
      syncEngine.stopAutoSync();
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        isLoading,
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