import { Suspense } from "react";
import { UserList } from "./usersList/UserList";
import { SearchParams } from "@/app/dashboard/page";

/**
 * Dashboard component
 */
const Dashboard = async ({ searchParams }: { searchParams: SearchParams }) => {
  return (
    <div>
      <Suspense fallback={"Loading..."}>
        <UserList searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
