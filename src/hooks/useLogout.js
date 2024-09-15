import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

import userAtom from "../atoms/userAtom";

import useShowToast from "./useShowToast";

const useLogout = () => {
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();

    const showToast = useShowToast();
    const logout = async () => {
        try {
            const res = await fetch("/api/users/logout", {
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
            localStorage.removeItem("user-threads");
            showToast("Success", data.message, "success");
            setUser(null);
            navigate("/auth");
        } catch (e) {
            showToast("Error", e, "error");
        }
    };

    return logout;
};

export default useLogout;
