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
import { userListPageSize } from "../../utils/userListUtils";

import { SearchParams } from "@/app/dashboard/page";
import UsersListSearch from "./UsersListSearch";
import UserRolePicker from "./UserRolePicker";

/**
 * List of users for admin page
 * @returns jsx
 */
export const UserList = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const currentPage = searchParams.usersPage || "1";
  const searchValue = searchParams.usersQuery;
  const { users, total } = await auth.api.listUsers({
    query: {
      searchValue,
      searchField: "name",
      limit: userListPageSize,
      offset: ((+currentPage || 1) - 1) * userListPageSize,
    },
    headers: await headers(),
  });
  return (
    <div>
      <UsersListSearch searchValue={searchValue} />
      <Table className="mb-3">
        <TableCaption>{total} total</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-25">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell className="font-medium">
                <UserRolePicker id={user.id} role={user.role} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <UserListPagination
        usersQuery={searchValue}
        total={total}
        currentPage={+currentPage || 1}
      />
    </div>
  );
};
