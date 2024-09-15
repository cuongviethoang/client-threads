import { Button, Flex, Image, useColorMode } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

import userAtom from "../atoms/userAtom";
import authScreenAtom from "../atoms/authAtom";

import useLogout from "../hooks/useLogout";

import { FiLogOut } from "react-icons/fi";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const user = useRecoilValue(userAtom);
    const setAuthScreen = useSetRecoilState(authScreenAtom);
    const logout = useLogout();

    return (
        <Flex justifyContent={"space-between"} mt={6} mb="12">
            {user && (
                <RouterLink to="/">
                    <AiFillHome size={24} />
                </RouterLink>
            )}
            {!user && (
                <RouterLink
                    onClick={() => {
                        setAuthScreen("login");
                    }}
                    to={"/auth"}
                >
                    Login
                </RouterLink>
            )}
            <Image
                cursor={"pointer"}
                alt="logo"
                w={6}
                src={
                    colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"
                }
                objectFit={"cover"}
                onClick={toggleColorMode}
            />

            {user && (
                <Flex alignItems={"center"} gap={4}>
                    <RouterLink to={`/${user.username}`}>
                        <RxAvatar size={24} />
                    </RouterLink>
                    <RouterLink to={`/chat`}>
                        <BsFillChatQuoteFill size={24} />
                    </RouterLink>
                    <RouterLink to={`/settings`}>
                        <MdOutlineSettings size={24} />
                    </RouterLink>
                    <Button size={"xs"} onClick={logout}>
                        <FiLogOut size={20} />
                    </Button>
                </Flex>
            )}

            {!user && (
                <RouterLink
                    onClick={() => {
                        setAuthScreen("signup");
                    }}
                    to={"/auth"}
                >
                    Sign up
                </RouterLink>
            )}
        </Flex>
    );
};

export default Header;
