import { Button } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";

const LogoutButton = () => {
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
            console.log(data);
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.removeItem("user-threads");
            showToast("Success", data.message, "success");
            setUser(null);
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
            Logout
        </Button>
    );
};

export default LogoutButton;