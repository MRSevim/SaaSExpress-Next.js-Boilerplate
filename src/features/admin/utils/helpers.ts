import { User } from "@/features/auth/utils/types";

/**
 * check if user is admin
 * @param user - user to be checked
 * @returns boolean isAdmin
 */
export const checkAdmin = (user: User) => user.role?.includes("admin");
