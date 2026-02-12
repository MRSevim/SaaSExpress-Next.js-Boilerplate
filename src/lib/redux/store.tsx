import userSlice from "@/features/auth/lib/redux/slices/userSlice";
import { User } from "@/features/auth/utils/types";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = (preloadedState?: Partial<{ user?: User }>) => {
  return configureStore({
    reducer: {
      user: userSlice,
    },
    preloadedState: { user: { value: preloadedState?.user } },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
