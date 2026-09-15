import { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);
const SESSION_KEY = "salesmakrs_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (role, token, profile) => {
    localStorage.setItem("salesmakrs_token", token);
    const next = { role, profile };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  };

  const distributorLogin = useCallback(async (email, password) => {
    const { data } = await client.post("/api/auth/login", { email, password });
    persistSession("distributor", data.access_token, data.distributor);
    return data.distributor;
  }, []);

  const distributorSignup = useCallback(async (companyName, email, password) => {
    const { data } = await client.post("/api/auth/signup", {
      company_name: companyName,
      email,
      password,
    });
    persistSession("distributor", data.access_token, data.distributor);
    return data.distributor;
  }, []);

  const salespersonLogin = useCallback(async (email, password) => {
    const { data } = await client.post("/api/auth/salesperson/login", { email, password });
    persistSession("salesperson", data.access_token, data.salesperson);
    return data.salesperson;
  }, []);

  const retailerLogin = useCallback(async (email, password) => {
    const { data } = await client.post("/api/auth/retailer/login", { email, password });
    persistSession("retailer", data.access_token, data.retailer);
    return data.retailer;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("salesmakrs_token");
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role: session?.role ?? null,
        profile: session?.profile ?? null,
        distributorLogin,
        distributorSignup,
        salespersonLogin,
        retailerLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
