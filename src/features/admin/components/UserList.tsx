import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import UserListPagination from "./UserListPagination";
import { userListPageSize } from "../utils/userListUtils";

/**
 * List of users for admin page
 * @returns jsx
 */
export const UserList = async ({ currentPage }: { currentPage: string }) => {
  const { users, total } = await auth.api.listUsers({
    query: {
      limit: userListPageSize,
      offset: ((+currentPage || 1) - 1) * userListPageSize,
    },
    headers: await headers(),
  });
  return (
    <div>
      <Table className="mb-3">
        <TableCaption>List of All Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UserListPagination total={total} currentPage={+currentPage || 1} />
    </div>
  );
};
