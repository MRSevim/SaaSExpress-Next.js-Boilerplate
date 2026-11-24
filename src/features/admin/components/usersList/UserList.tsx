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
import { Skeleton } from "@/components/ui/skeleton";

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
                <UserRolePicker id={user.id} role={user.role || "user"} />
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

/**
 * Loading skeleton for the user list in admin page
 * @returns jsx
 */
export const UserListSkeleton = () => {
  return (
    <div>
      {/* Search input */}
      <Skeleton className="mb-3 h-9 max-w-sm" />

      <Table className="mb-3">
        <TableCaption>
          <Skeleton className="mx-auto h-4 w-16" />
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-25">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: userListPageSize }, (_v, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                {/* Role picker */}
                <Skeleton className="h-9 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="size-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="size-9" />
        <Skeleton className="size-9" />
        <Skeleton className="size-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="size-9" />
      </div>
    </div>
  );
};
