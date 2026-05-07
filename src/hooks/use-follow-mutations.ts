import { useMutation } from "@tanstack/react-query";
import { followersApi } from "../services/api-services";
import { toast } from "sonner";
import { getApiError } from "../lib/get-api-error";

export const useFollowMutation = ({
  profileId,
  isFollowing,
  onSuccess,
}: {
  profileId: string;
  isFollowing: boolean;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () =>
      isFollowing
        ? followersApi.unfollow(profileId)
        : followersApi.follow(profileId),
    onSuccess: () => onSuccess?.(),
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};
