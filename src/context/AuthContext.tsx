import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Type definitions
type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: true,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

// Demo user for simulation
const DEMO_USER: User = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatarUrl: "https://i.pravatar.cc/150?u=john",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for saved auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("codeprep_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      setIsLoading(false);
    };

    // Simulate network delay
    setTimeout(checkAuth, 500);
  }, []);

  // Login function - simulate API call
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo, accept any non-empty credentials
    if (email && password) {
      // Store user data
      setUser(DEMO_USER);

      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem("codeprep_user", JSON.stringify(DEMO_USER));
      }

      setIsLoading(false);
      navigate("/dsa");
      return;
    }

    setIsLoading(false);
    throw new Error("Invalid credentials");
  };

  // Signup function - simulate API call
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo, accept any non-empty values
    if (name && email && password) {
      // Create custom user
      const newUser = {
        ...DEMO_USER,
        name,
        email,
      };

      // Store user data
      setUser(newUser);
      localStorage.setItem("codeprep_user", JSON.stringify(newUser));

      setIsLoading(false);
      navigate("/dsa");
      return;
    }

    setIsLoading(false);
    throw new Error("Please fill in all fields");
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("codeprep_user");
    navigate("/");
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
