"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { changeUserRole } from "../../utils/serverActions";
import { toast } from "@/components/ui/toast";

const allUserTypes = [
  { label: "admin", value: "admin" },
  { label: "user", value: "user" },
];

/**
 * See and change user role in users lists
 * @returns jsx
 */
const UserRolePicker = ({ id, role }: { id: string; role: string }) => {
  const [currentRole, setCurrentRole] = useState(role);
  const [isLoading, setIsLoading] = useState(false);

  const handleValueChange = async (newValue: "admin" | "user") => {
    setIsLoading(true);
    const oldRole = currentRole;
    setCurrentRole(newValue);
    const { error } = await changeUserRole(id, newValue);
    if (error) {
      setCurrentRole(oldRole);
      toast.add({ type: "error", description: error });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (role !== currentRole) {
      //eslint-disable-next-line
      setCurrentRole(role);
    }
    //eslint-disable-next-line
  }, [role]);

  return (
    <Select
      value={currentRole}
      disabled={isLoading}
      items={allUserTypes}
      onValueChange={(newVal: string | null) => {
        if (
          newVal !== null &&
          newVal !== currentRole &&
          (newVal === "admin" || newVal === "user")
        )
          handleValueChange(newVal);
      }}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allUserTypes.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default UserRolePicker;
