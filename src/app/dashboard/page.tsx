import Container from "@/components/Container";
import { Spinner } from "@/components/ui/spinner";
import Dashboard from "@/features/admin/components/Dashboard";
import { checkAdmin } from "@/features/admin/utils/helpers";
import { getUser } from "@/features/auth/utils/serverHelpers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export type SearchParams = { usersPage?: string; usersQuery?: string };

const PageInner = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const user = await getUser();
  if (!user) return notFound();

  const isAdmin = checkAdmin(user);
  if (!isAdmin) return notFound();
  const searchParameters = await searchParams;

  return (
    <Container>
      <Dashboard searchParams={searchParameters} />
    </Container>
  );
};

const ProfileSkeleton = () => {
  return (
    <Container>
      <Spinner className="size-10" />
    </Container>
  );
};

const page = ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PageInner searchParams={searchParams} />
    </Suspense>
  );
};

export default page;
