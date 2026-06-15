import { useCallback, useState } from "react";
import type { TUpdateUserDTO, TUser } from "../types/TUser";
import { getMyUser, updateMyUser } from "../services/users/userService";

export const useUser = () => {
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // console.log("User", user);

  const fetchMyUser = useCallback(async () => {
    setLoading(true);

    try {
      const userData = await getMyUser();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (payload: TUpdateUserDTO) => {
    setUpdating(true);

    try {
      const updatedUser = await updateMyUser(payload);
      setUser(updatedUser);

      return updatedUser;
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    user,
    loading,
    updating,
    fetchMyUser,
    updateUser,
  };
};