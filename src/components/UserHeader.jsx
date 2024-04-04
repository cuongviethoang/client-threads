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
import useShowToast from "../hooks/useShowToast";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
    const showToast = useShowToast();

    const currentUser = useRecoilValue(userAtom); // this is my profile

    const { handleFollowUnFollow, updating, following } =
        useFollowUnfollow(user);

    const copyUrl = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Account created.", "Copy link success", "success");
        });
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
