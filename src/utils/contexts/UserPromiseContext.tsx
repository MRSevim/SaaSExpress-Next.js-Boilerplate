"use client";
import { User } from "@/features/auth/utils/types";
import { createContext, useContext } from "react";

type UserPromise = Promise<User | undefined> | null;

const UserPromiseContext = createContext<UserPromise>(null);

export const useUserPromiseContext = () => {
  const userPromise = useContext(UserPromiseContext);
  if (!userPromise) {
    throw new Error(
      "useUserPromiseContext must be used within a UserPromiseProvider",
    );
  }
  return userPromise;
};

export const UserPromiseProvider = ({
  userPromise,
  children,
}: {
  children: React.ReactNode;
  userPromise: Promise<User | undefined>;
}) => {
  return (
    <UserPromiseContext value={userPromise}>{children}</UserPromiseContext>
  );
};
