import Container from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";
import Profile from "@/features/auth/components/ProfileComponent";
import { getUser } from "@/features/auth/utils/serverHelpers";
import { routes } from "@/utils/routes";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const PageInner = async () => {
  const user = await getUser();
  if (!user) redirect(routes.signIn);
  return (
    <Container>
      <Profile user={user} />
    </Container>
  );
};

const ProfileSkeleton = () => {
  return (
    <Container>
      <div className="flex flex-col gap-3 items-center">
        {/* Avatar */}
        <Skeleton className="size-10 rounded-full" />
        {/* DeleteButton */}
        <Skeleton className="h-8 w-30" />
        {/* ResetButton */}
        <Skeleton className="h-8 w-38" />
      </div>
    </Container>
  );
};

const page = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PageInner />
    </Suspense>
  );
};

export default page;
