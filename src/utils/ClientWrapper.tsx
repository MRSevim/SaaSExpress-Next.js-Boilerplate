"use client";
import { AppStore, makeStore } from "@/lib/redux/store";
import { Provider } from "react-redux";
import { useMemo } from "react";
import { User } from "@/features/auth/lib/auth";
import { setUser } from "@/features/auth/lib/redux/slices/userSlice";

const ClientWrapper = ({
  user,
  children,
}: {
  children: React.ReactNode;
  user?: User;
}) => {
  const store = useMemo<AppStore>(() => {
    const s = makeStore();
    s.dispatch(
      setUser(
        user
          ? {
              id: user.id,
              email: user.email,
              emailVerified: user.emailVerified,
              name: user.name,
              image: user.image,
            }
          : undefined,
      ),
    );
    return s;
  }, [user]);

  return <Provider store={store}>{children}</Provider>;
};

export default ClientWrapper;
