"use client";
import { AppStore, makeStore } from "@/lib/redux/store";
import { Provider } from "react-redux";
import { useRef } from "react";
import { User } from "@/features/auth/lib/auth";

const ClientWrapper = ({
  user,
  children,
}: {
  children: React.ReactNode;
  user?: User;
}) => {
  const storeRef = useRef<AppStore | null>(null);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    storeRef.current = makeStore({
      user: user
        ? {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name,
            image: user.image,
          }
        : undefined,
    });
  }

  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ClientWrapper;
