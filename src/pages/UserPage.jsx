import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import { useRecoilState } from "recoil";

import postsAtom from "../atoms/postAtom";

import useShowToast from "../hooks/useShowToast";
import useGetUserProfile from "../hooks/useGetUserProfile";

import Post from "../components/Post";
import UserHeader from "../components/UserHeader";

const UserPage = () => {
    const showToast = useShowToast();

    const { username } = useParams();

    const { user, loading } = useGetUserProfile();

    const [posts, setPosts] = useRecoilState(postsAtom);

    const [fetchingPosts, setFetchingPosts] = useState(true);

    useEffect(() => {
        const getPosts = async () => {
            if (!user) return;
            setFetchingPosts(true);
            try {
                const res = await fetch(`/api/posts/user/${username}`);
                const data = await res.json();
                if (data?.error) {
                    showToast("Error", data?.error, "error");
                    return;
                }
                setPosts(data);
            } catch (e) {
                showToast("Error", e, "error");
                setPosts([]);
            } finally {
                setFetchingPosts(false);
            }
        };
        getPosts();
    }, [username, showToast, setPosts, user]);

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"} alignItems={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        );
    }

    if (!user && !loading)
        return (
            <Flex justifyContent={"center"} my={3}>
                <h1>User not found</h1>
            </Flex>
        );

    return (
        <>
            <UserHeader user={user} />
            {!fetchingPosts && posts.length === 0 && (
                <h1> User has no post.</h1>
            )}
            {fetchingPosts && (
                <Flex justifyContent={"center"} my={12}>
                    <Spinner size={"xl"} />
                </Flex>
            )}
            {posts &&
                posts.length > 0 &&
                posts.map((post) => (
                    <Post
                        key={`${post._id}`}
                        post={post}
                        postedBy={post?.postedBy}
                    />
                ))}
        </>
    );
};

export default UserPage;
