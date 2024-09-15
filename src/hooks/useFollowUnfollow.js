import { useState } from "react";
import { useRecoilValue } from "recoil";

import userAtom from "../atoms/userAtom";

import useShowToast from "./useShowToast";

const useFollowUnfollow = (user) => {
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const [following, setFollowing] = useState(
        user.followers.includes(currentUser?._id)
    );
    const [updating, setUpdating] = useState(false);

    const handleFollowUnFollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login to follow", "error");
            return;
        }
        // nếu đang trong quá trình xử lý follow hoặc unfollow thì ko nhận gọi api trong quá trình đó
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            if (following) {
                showToast("Success", `Unfollowed ${user.name}`, "success");
                const index = user.followers.indexOf(currentUser?._id);
                user.followers.splice(index, 1);
            } else {
                showToast("Success", `Followed ${user.name}`, "success");
                user.followers.push(currentUser?._id);
            }
            setFollowing(!following);
        } catch (e) {
            showToast("Error", e, "error");
        } finally {
            setUpdating(false);
        }
    };
    return { handleFollowUnFollow, updating, following };
};

export default useFollowUnfollow;
