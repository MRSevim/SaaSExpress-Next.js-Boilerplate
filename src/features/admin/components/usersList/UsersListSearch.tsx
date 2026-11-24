"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Search for users in admin page
 * @returns jsx
 */
const UsersListSearch = ({ searchValue }: { searchValue?: string }) => {
  const [query, setQuery] = useState(searchValue || "");
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    if (searchValue !== query) {
      //eslint-disable-next-line
      setQuery(searchValue || "");
    }
    //eslint-disable-next-line
  }, [searchValue]);

  const callReplace = (newQuery: string) => {
    setQuery(newQuery);
    const params = new URLSearchParams();
    params.set("usersQuery", newQuery);
    return replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Input
      placeholder="Filter by name..."
      value={query}
      onChange={(event) => callReplace(event.target.value)}
      className="mb-3 max-w-sm"
    />
  );
};

export default UsersListSearch;
