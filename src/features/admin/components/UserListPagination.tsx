"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { userListPageSize as pageSize } from "../utils/userListUtils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Pagination for user list in admin page
 * @returns jsx
 */
const UserListPagination = ({
  total,
  currentPage,
}: {
  total: number;
  currentPage: number;
}) => {
  const [totalUsers] = useState(total);
  const [current, setCurrent] = useState(currentPage);
  const pathname = usePathname();
  const { replace } = useRouter();
  const maxPage = Math.ceil(totalUsers / pageSize);
  const isLastPage = current === maxPage;
  const isFirstPage = current === 1;
  const allPages = Array.from({ length: maxPage }, (v, i) => {
    return { label: i + 1, value: i + 1 };
  });

  const callReplace = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("usersPage", newPage.toString());
    return replace(`${pathname}?${params.toString()}`);
  };

  const handlePrevPageClick = () => {
    if (!isFirstPage) {
      const newCurrent = current - 1;
      callReplace(newCurrent);
      setCurrent(newCurrent);
    }
  };

  const handleNextPageClick = () => {
    if (!isLastPage) {
      const newCurrent = current + 1;
      callReplace(newCurrent);
      setCurrent(newCurrent);
    }
  };

  const handlePageClick = (num: number) => {
    callReplace(num);
    setCurrent(num);
  };

  const handleFirstPageClick = () => {
    callReplace(1);
    setCurrent(1);
  };

  const handleLastPageClick = () => {
    callReplace(maxPage);
    setCurrent(maxPage);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem
          className={`${isFirstPage && "disabled"}`}
          title={"Go to first page"}
        >
          <PaginationLink onClick={handleFirstPageClick}>
            <ChevronsLeft />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem className={`${isFirstPage && "disabled"}`}>
          <PaginationPrevious onClick={handlePrevPageClick} />
        </PaginationItem>
        {!isFirstPage && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageClick(current - 1)}>
              {current - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive>{current}</PaginationLink>
        </PaginationItem>
        {!isLastPage && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageClick(current + 1)}>
              {current + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <Select
            items={allPages}
            onValueChange={(newVal: number | null) => {
              if (newVal !== null) handlePageClick(newVal);
            }}
          >
            <SelectTrigger>
              <SelectValue>{current}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {allPages.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </PaginationItem>

        <PaginationItem className={`${isLastPage && "disabled"}`}>
          <PaginationNext onClick={handleNextPageClick} />
        </PaginationItem>
        <PaginationItem
          className={`${isLastPage && "disabled"}`}
          title={"Go to last page"}
        >
          <PaginationLink onClick={handleLastPageClick}>
            <ChevronsRight />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default UserListPagination;
