import { Button } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();

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
            console.log(data);
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
