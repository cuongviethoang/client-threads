import { useEffect, useState } from "react";
import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";

import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postAtom";

import useShowToast from "../hooks/useShowToast";

import Actions from "./Actions";

const Post = ({ post, postedBy }) => {
    const navigation = useNavigate();
    const showToast = useShowToast();

    const currentUser = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/` + postedBy);
                const data = await res.json();

                if (data?.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setUser(data);
            } catch (e) {
                showToast("Error", e, "error");
                setUser(null);
            }
        };
        getUser();
    }, [postedBy, showToast]);

    if (!user) return null;

    const handleGoToUserPage = (e) => {
        e.preventDefault();
        navigation(`/${user?.username}`);
    };

    const handleDeletePost = async (e) => {
        try {
            e.preventDefault();
            if (!window.confirm("Are you sure you want to delete this post?"))
                return;

            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data?.error) {
                showToast("Error", data?.error, "error");
                return;
            }
            showToast("Success", data?.message, "success");
            setPosts(posts.filter((p) => p?._id !== post?._id));
        } catch (e) {
            showToast("Error", e, "error");
        }
    };
    return (
        <Link to={`/${user?.username}/post/${post?._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <Avatar
                        onClick={(e) => handleGoToUserPage(e)}
                        size={"md"}
                        name={user?.name}
                        src={
                            user?.profilePic
                                ? user?.profilePic
                                : "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                        }
                    />
                    <Box w={"1px"} h={"full"} bg="gray.light" my={2}></Box>
                    <Box position={"relative"} w={"full"}>
                        {post.replies.length === 0 && (
                            <Text textAlign={"center"}>🥱</Text>
                        )}
                        {post?.replies[0] && (
                            <Avatar
                                size="xs"
                                name="John doe"
                                src={
                                    post.replies[0]?.userProfilePic
                                        ? post.replies[0]?.userProfilePic
                                        : "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                                }
                                position={"absolute"}
                                top={"0px"}
                                left="15px"
                                padding={"2px"}
                            />
                        )}
                        {post?.replies[1] && (
                            <Avatar
                                size="xs"
                                name="John doe"
                                src={
                                    post.replies[1]?.userProfilePic
                                        ? post.replies[1]?.userProfilePic
                                        : "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                                }
                                position={"absolute"}
                                bottom={"0px"}
                                right="-5px"
                                padding={"2px"}
                            />
                        )}
                        {post?.replies[2] && (
                            <Avatar
                                size="xs"
                                name="John doe"
                                src={
                                    post.replies[2]?.userProfilePic
                                        ? post.replies[2]?.userProfilePic
                                        : "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                                }
                                position={"absolute"}
                                bottom={"0px"}
                                left="4px"
                                padding={"2px"}
                            />
                        )}
                    </Box>
                </Flex>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                    <Flex justifyContent={"space-between"} w={"full"}>
                        <Flex w={"full"} alignItems={"center"}>
                            <Text
                                fontSize={"sm"}
                                fontWeight={"bold"}
                                onClick={(e) => handleGoToUserPage(e)}
                            >
                                {user?.username}
                            </Text>
                            <Image
                                objectFit={"cover"}
                                src="/verified.png"
                                w={4}
                                h={4}
                                ml={1}
                            />
                        </Flex>
                        <Flex gap={4} alignItems={"center"}>
                            <Text
                                fontSize={"xs"}
                                width={36}
                                color={"gray.light"}
                                textAlign={"right"}
                            >
                                {formatDistanceToNow(new Date(post?.createdAt))}{" "}
                                ago
                            </Text>
                            {currentUser?._id === user?._id && (
                                <DeleteIcon
                                    size={20}
                                    onClick={(e) => handleDeletePost(e)}
                                />
                            )}
                        </Flex>
                    </Flex>

                    <Text fontSize={"sm"}>{post?.text}</Text>
                    {post?.img && (
                        <Box
                            borderRadius={6}
                            overflow={"hidden"}
                            border={"1px solid"}
                            borderColor={"gray.light"}
                        >
                            <Image
                                src={post?.img}
                                w={"full"}
                                objectFit={"cover"}
                            />
                        </Box>
                    )}

                    <Flex gap={3}>
                        <Actions post={post} />
                    </Flex>
                </Flex>
            </Flex>
        </Link>
    );
};

export default Post;
