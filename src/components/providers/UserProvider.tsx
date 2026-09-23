"use client";

import { createContext, useContext } from "react";

interface UserContextValue {
  userName: string;
  userEmail?: string;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextValue>({ userName: "Estudiante", isAdmin: false });

export function UserProvider({
  children,
  userName,
  userEmail,
  isAdmin,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail?: string;
  isAdmin?: boolean;
}) {
  return (
    <UserContext.Provider value={{ userName, userEmail, isAdmin: isAdmin ?? false }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
