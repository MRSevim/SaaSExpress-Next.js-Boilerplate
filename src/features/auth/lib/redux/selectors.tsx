import { RootState } from "@/lib/redux/store";

export const selectUser = (state: RootState) => state.user.value;
