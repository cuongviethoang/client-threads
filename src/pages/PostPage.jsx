import {
    Avatar,
    Flex,
    Image,
    Text,
    Box,
    Divider,
    Button,
    Spinner,
} from "@chakra-ui/react";
import Actions from "../components/Actions";
import { useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import Comment from "../components/Comment";
import postsAtom from "../atoms/postAtom";

// chi tiết 1 post
const PostPage = () => {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { user, loading } = useGetUserProfile();
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const [posts, setPosts] = useRecoilState(postsAtom);

    const currentPost = posts[0];

    useEffect(() => {
        const getPost = async () => {
            try {
                const res = await fetch(`/api/posts/${pid}`);
                const data = await res.json();

                if (data?.error) {
                    showToast("Error", data?.error, "error");
                    return;
                }
                setPosts([data]);
            } catch (e) {
                showToast("Error", e, "error");
            }
        };

        getPost();
    }, [pid, showToast, setPosts]);

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        );
    }

    if (!currentPost) return null;

    // delete post;
    const handleDeletePost = async () => {
        try {
            if (!window.confirm("Are you sure you want to delete this post?"))
                return;

            const res = await fetch(`/api/posts/${currentPost?._id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data?.error) {
                showToast("Error", data?.error, "error");
                return;
            }

            showToast("Success", data?.message, "success");
            navigate(`/${user?.username}`);
        } catch (e) {
            showToast("Error", e, "error");
        }
    };

    return (
        <>
            <Flex>
                <Flex w={"full"} alignItems={"center"} gap={3}>
                    <Avatar
                        src={
                            user?.profilePic
                                ? user?.profilePic
                                : "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"
                        }
                        size={"md"}
                        name={user?.name}
                    />
                    <Flex>
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                            {user?.username}
                            Cuong
                        </Text>
                        <Image
                            objectFit={"cover"}
                            src="/verified.png"
                            w={4}
                            h={4}
                            ml={4}
                        />
                    </Flex>
                </Flex>
                <Flex gap={4} alignItems={"center"}>
                    <Text
                        fontSize={"xs"}
                        width={36}
                        color={"gray.light"}
                        textAlign={"right"}
                    >
                        {formatDistanceToNow(new Date(currentPost?.createdAt))}{" "}
                        ago
                    </Text>
                    {currentUser?._id === user?._id && (
                        <DeleteIcon
                            cursor={"pointer"}
                            size={20}
                            onClick={handleDeletePost}
                        />
                    )}
                </Flex>
            </Flex>
            <Text my={3}>{currentPost?.text}</Text>
            {currentPost?.img && (
                <Box
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.light"}
                >
                    <Image
                        objectFit={"cover"}
                        src={currentPost?.img}
                        w={"full"}
                    />
                </Box>
            )}
            <Flex gap={3} my={3}>
                <Actions post={currentPost} />
            </Flex>

            <Divider my={4} />

            <Flex justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text fontSize={"21"}>👋</Text>
                    <Text color={"gray.light"}>
                        Get the app to like, reply and post
                    </Text>
                </Flex>
                <Button>Get</Button>
            </Flex>
            <Divider my={4} />
            {currentPost &&
                currentPost?.replies.length > 0 &&
                currentPost?.replies.map((reply, index) => (
                    <Comment
                        key={index}
                        reply={reply}
                        lastReply={
                            reply?._id ===
                            currentPost?.replies[
                                currentPost?.replies.length - 1
                            ]?._id
                        }
                    />
                ))}
        </>
    );
};

export default PostPage;
