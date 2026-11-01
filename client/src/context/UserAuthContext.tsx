
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getUserProfile,
  hasUserToken,
  logoutUser,
  type SriVoraUser,
} from "../services/userAuthService";

interface UserAuthContextType {
  user: SriVoraUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserAuthContext = createContext<
  UserAuthContextType | undefined
>(undefined);

export function UserAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<SriVoraUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    if (!hasUserToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch {
      // Clear invalid or expired session
      logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshUser();
  }, []);

  function logout() {
    logoutUser();
    setUser(null);
  }

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);

  if (!context) {
    throw new Error(
      "useUserAuth must be used inside UserAuthProvider"
    );
  }

  return context;
}
