import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import { FiLogOut } from "react-icons/fi";

import userAtom from "../atoms/userAtom";

import useShowToast from "../hooks/useShowToast";

const LogoutButton = () => {
    const navigate = useNavigate();

    const setUser = useSetRecoilState(userAtom);

    const showToast = useShowToast();

    const handleLogout = async () => {
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
    return (
        <Button
            onClick={handleLogout}
            position={"fixed"}
            top={"30px"}
            right={"30px"}
            size={"sm"}
        >
            <FiLogOut size={20} />
        </Button>
    );
};

export default LogoutButton;
