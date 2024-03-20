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
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { formatDistanceToNow } from "date-fns";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import Comment from "../components/Comment";

// chi tiết 1 post
const PostPage = () => {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { user, loading } = useGetUserProfile();
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const getPost = async () => {
            try {
                const res = await fetch(`/api/posts/${pid}`);
                const data = await res.json();

                if (data?.error) {
                    showToast("Error", data?.error, "error");
                    return;
                }
                setPost(data);
            } catch (e) {
                showToast("Error", e, "error");
            }
        };

        getPost();
    }, [pid, showToast]);

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        );
    }

    if (!post) return null;

    // delete post;
    const handleDeletePost = async () => {
        try {
            if (!window.confirm("Are you sure you want to delete this post?"))
                return;

            const res = await fetch(`/api/posts/${pid}`, {
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
                        {formatDistanceToNow(new Date(post?.createdAt))} ago
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
            <Text my={3}>{post?.text}</Text>
            {post?.img && (
                <Box
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.light"}
                >
                    <Image objectFit={"cover"} src={post?.img} w={"full"} />
                </Box>
            )}
            <Flex gap={3} my={3}>
                <Actions post={post} />
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
            {post &&
                post?.replies.length > 0 &&
                post?.replies.map((reply, index) => (
                    <Comment
                        key={index}
                        reply={reply}
                        lastReply={
                            reply?._id ===
                            post?.replies[post?.replies.length - 1]?._id
                        }
                    />
                ))}
        </>
    );
};

export default PostPage;
