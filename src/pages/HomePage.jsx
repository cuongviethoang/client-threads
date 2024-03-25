import { Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";

const HomePage = () => {
    const showToast = useShowToast();

    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFeedPost = async () => {
            setLoading(true);
            setPosts([]);
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if (data?.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setPosts(data);
            } catch (e) {
                showToast("error", e, "error");
            } finally {
                setLoading(false);
            }
        };

        getFeedPost();
    }, [showToast, setPosts]);
    return (
        <>
            {!loading && posts && posts.length === 0 && (
                <h1>Follow some users to see the feed</h1>
            )}
            {loading && (
                <Flex justify={"center"}>
                    <Spinner size={"xl"} />
                </Flex>
            )}

            {posts &&
                posts.length > 0 &&
                posts.map((post) => (
                    <Post
                        key={post?._id}
                        post={post}
                        postedBy={post?.postedBy}
                    />
                ))}
        </>
    );
};

export default HomePage;
