import {
    Avatar,
    Box,
    Button,
    Flex,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    Text,
    VStack,
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";

const UserHeader = ({ user }) => {
    const showToast = useShowToast();

    // lấy ra user từ atom
    const currentUser = useRecoilValue(userAtom); // this is my profile

    // kiểm tra xem mình có đang follow họ hay không
    const [following, setFollowing] = useState(
        user?.followers.includes(currentUser?._id)
    );

    const [updating, setUpdating] = useState(false);

    const copyUrl = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Account created.", "Copy link success", "success");
        });
    };

    const handleFollowUnFollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login to follow", "error");
            return;
        }
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
    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"21"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>
                        <Text
                            fontSize={{
                                base: "xs",
                            }}
                            bg={"gray.dark"}
                            color={"gray.light"}
                            p={1}
                            borderRadius={"full"}
                        >
                            threads.net
                        </Text>
                    </Flex>
                </Box>
                <Box>
                    {user?.profilePic && (
                        <Avatar
                            name={user?.name}
                            src={user?.profilePic}
                            size={{
                                base: "md",
                                md: "xl",
                            }}
                        />
                    )}
                    {!user?.profilePic && (
                        <Avatar
                            name={user.name}
                            src="https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                            size={{
                                base: "md",
                                md: "xl",
                            }}
                        />
                    )}
                </Box>
            </Flex>
            <Text>{user?.bio}</Text>

            {currentUser?._id === user?._id && (
                <RouterLink to="/update">
                    <Button size={"sm"}>Update Profile</Button>
                </RouterLink>
            )}
            {currentUser?._id !== user?._id && (
                <Button
                    size={"sm"}
                    onClick={handleFollowUnFollow}
                    isLoading={updating}
                >
                    {following ? "UnFollow" : "Follow"}
                </Button>
            )}
            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>
                        {user?.followers.length} followers
                    </Text>
                    <Box
                        w={1}
                        h={1}
                        bg={"gray.light"}
                        borderRadius={"full"}
                    ></Box>
                    <Link color={"gray.light"}>instagram.com</Link>
                </Flex>
                <Flex>
                    <Box className="icon-container">
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box>
                    <Box className="icon-container">
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem
                                        bg={"gray.dark"}
                                        onClick={copyUrl}
                                    >
                                        Copy link
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex>
            </Flex>

            <Flex w={"full"}>
                <Flex
                    flex={1}
                    borderBottom={"1.5px solid white"}
                    justifyContent={"center"}
                    pb={"3"}
                    cursor={"pointer"}
                >
                    <Text fontWeight={"bold"}>Threads</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={"1px solid gray"}
                    color={"gray.light"}
                    justifyContent={"center"}
                    pb={"3"}
                    cursor={"pointer"}
                >
                    <Text fontWeight={"bold"}>Replies</Text>
                </Flex>
            </Flex>
        </VStack>
    );
};

export default UserHeader;
