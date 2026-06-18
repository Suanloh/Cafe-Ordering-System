import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "../types";

export type { UserRole };

// ─── Demo seed accounts ───────────────────────────────────────────────────────
const DEMO_USERS: User[] = [
  {
    id: "demo-customer", name: "Demo Customer", email: "customer@usm.my",
    phone: "012-3456789", password: "password", role: "customer", studentId: "USM2024001",
  },
  {
    id: "demo-admin", name: "Admin Staff", email: "admin@usm.my",
    phone: "012-3456780", password: "admin123", role: "admin",
    staffId: "STF001", department: "Cafe Operations",
  },
  {
    id: "demo-driver", name: "Ali Driver", email: "driver@usm.my",
    phone: "012-3456781", password: "driver123", role: "driver",
    vehicleNumber: "PEN 1234", vehicleType: "Motorcycle",
  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────
const USERS_KEY = "usm_cafe_users";
const SESSION_KEY = "usm_cafe_session";

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const stored: User[] = JSON.parse(raw);
      // merge in any missing demo users
      const ids = new Set(stored.map(u => u.id));
      const merged = [...stored, ...DEMO_USERS.filter(d => !ids.has(d.id))];
      return merged;
    }
  } catch {}
  localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  return [...DEMO_USERS];
}

function persistUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

// ─── Context types ────────────────────────────────────────────────────────────
interface AuthResult { ok: boolean; error?: string }

interface UserContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => AuthResult;
  logout: () => void;
  register: (data: Omit<User, "id">) => AuthResult;
  updateProfile: (data: Partial<Omit<User, "id" | "role">> & { newPassword?: string; currentPassword?: string }) => AuthResult;
}

// ─── Context & provider ───────────────────────────────────────────────────────
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [sessionId, setSessionId] = useState<string | null>(loadSession);

  const currentUser = users.find(u => u.id === sessionId) ?? null;

  function persist(updated: User[]) {
    persistUsers(updated);
    setUsers(updated);
  }

  function login(email: string, password: string, role: UserRole): AuthResult {
    const match = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) return { ok: false, error: "Incorrect email or password." };
    if (match.role !== role) {
      return { ok: false, error: `This account is registered as a ${match.role}, not ${role}.` };
    }
    setSessionId(match.id);
    sessionStorage.setItem(SESSION_KEY, match.id);
    return { ok: true };
  }

  function logout() {
    setSessionId(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  function register(data: Omit<User, "id">): AuthResult {
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser: User = { ...data, id: `user-${Date.now()}` };
    const updated = [...users, newUser];
    persist(updated);
    setSessionId(newUser.id);
    sessionStorage.setItem(SESSION_KEY, newUser.id);
    return { ok: true };
  }

  function updateProfile(
    data: Partial<Omit<User, "id" | "role">> & { newPassword?: string; currentPassword?: string }
  ): AuthResult {
    if (!currentUser) return { ok: false, error: "Not authenticated." };
    if (data.newPassword) {
      if (!data.currentPassword) return { ok: false, error: "Current password is required." };
      if (data.currentPassword !== currentUser.password) return { ok: false, error: "Current password is incorrect." };
    }
    const { newPassword, currentPassword, ...rest } = data;
    const merged: User = {
      ...currentUser,
      ...rest,
      ...(newPassword ? { password: newPassword } : {}),
    };
    persist(users.map(u => (u.id === currentUser.id ? merged : u)));
    return { ok: true };
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        role: currentUser?.role ?? null,
        isAuthenticated: !!currentUser,
        login,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
