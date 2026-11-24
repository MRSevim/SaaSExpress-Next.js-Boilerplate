import { Suspense } from "react";
import { UserList, UserListSkeleton } from "./usersList/UserList";
import { SearchParams } from "@/app/dashboard/page";

/**
 * Dashboard component for admin page
 */
const Dashboard = async ({ searchParams }: { searchParams: SearchParams }) => {
  return (
    <div>
      <Suspense fallback={<UserListSkeleton />}>
        <UserList searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
