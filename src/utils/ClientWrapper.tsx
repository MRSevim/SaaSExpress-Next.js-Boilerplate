"use client";
import { AppStore, makeStore } from "@/lib/redux/store";
import { Provider } from "react-redux";
import { use, useRef } from "react";
import { User } from "@/features/auth/lib/auth";
import { setUser } from "@/features/auth/lib/redux/slices/userSlice";

const ClientWrapper = ({
  userPromise,
  children,
}: {
  children: React.ReactNode;
  userPromise: Promise<User | undefined>;
}) => {
  const storeRef = useRef<AppStore | null>(null);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    const user = use(userPromise);
    const store = makeStore();
    store.dispatch(
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
    storeRef.current = store;
  }

  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ClientWrapper;
