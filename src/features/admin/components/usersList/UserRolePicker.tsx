"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
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
const UserRolePicker = ({ id, role }: { id: string; role?: string }) => {
  const [currentRole, setCurrentRole] = useState(role || "user");
  const [isLoading, setIsLoading] = useState(false);
  const handleValueChange = async (newValue: "admin" | "user") => {
    setIsLoading(true);
    setCurrentRole(newValue);
    const { error } = await changeUserRole(id, newValue);
    if (error) {
      toast.add({ type: "error", description: error });
    }
    setIsLoading(false);
  };

  return (
    <Select
      disabled={isLoading}
      items={allUserTypes}
      onValueChange={(newVal: "admin" | "user" | null) => {
        if (newVal !== null) handleValueChange(newVal);
      }}
    >
      <SelectTrigger>
        <SelectValue>{currentRole}</SelectValue>
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
