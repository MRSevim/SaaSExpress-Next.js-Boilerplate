"use client";
import { User } from "@/features/auth/utils/types";
import { createContext, use } from "react";

type UserPromise = Promise<User | undefined> | null;

const UserPromiseContext = createContext<UserPromise>(null);

/**
 * Gets user promise context to pass into react's use func
 */
export const useUser = () => {
  const userPromise = use(UserPromiseContext);
  if (!userPromise) {
    throw new Error("useUser must be used within a UserPromiseProvider");
  }
  return use(userPromise);
};

/**
 * Wraps and provides userPromiseContext
 */
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
