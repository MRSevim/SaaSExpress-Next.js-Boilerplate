import { Suspense } from "react";
import { UserList } from "./UserList";

/**
 * Dashboard component
 */
const Dashboard = async ({
  searchParams,
}: {
  searchParams: Promise<{ usersPage: string }>;
}) => {
  const currentPage = (await searchParams).usersPage;
  return (
    <div>
      <Suspense fallback={"Loading..."}>
        <UserList currentPage={currentPage} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
