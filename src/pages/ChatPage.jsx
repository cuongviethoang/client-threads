import { SearchIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    Input,
    Skeleton,
    SkeletonCircle,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import {
    conversationsAtom,
    selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchingUser, setSearchingUser] = useState(false);

    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [selectedConversation, setSelectedConversation] = useRecoilState(
        selectedConversationAtom
    );
    const currentUser = useRecoilValue(userAtom);

    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prev) => {
                const updatedConversations = [];
                prev.forEach((conversation) => {
                    if (conversation._id === conversationId) {
                        return updatedConversations.unshift({
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true,
                            },
                        });
                    }
                    return updatedConversations.push(conversation);
                });
                return updatedConversations;
            });
        });
        return () => socket?.off("messagesSeen");
    }, [socket, setConversations]);

    useEffect(() => {
        socket?.on("newMessage", (message) => {
            // người nhận message: đẩy conversation lên đầu tiên
            setConversations((prevConversations) => {
                const newConversations = [];
                prevConversations.forEach((conversation) => {
                    if (conversation?._id === message?.conversationId) {
                        return newConversations.unshift({
                            ...conversation,
                            lastMessage: {
                                text: message?.text,
                                sender: message?.sender,
                            },
                        });
                    }
                    return newConversations.push(conversation);
                });
                return newConversations;
            });
        });

        return () => socket?.off("newMessage");
    }, [socket, selectedConversation, setConversations]);

    useEffect(() => {
        const getConversation = async () => {
            setLoadingConversations(true);
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                if (data?.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log("conversation: ", data);
                setConversations(data);
            } catch (e) {
                showToast("Error", e?.message, "error");
            } finally {
                setLoadingConversations(false);
            }
        };

        getConversation();
    }, [showToast, setConversations]);

    const handleConversationSearch = async (e) => {
        e.preventDefault();
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);

            const searchedUser = await res.json();
            if (searchedUser?.error) {
                showToast("Error", searchedUser.error, "error");
                return;
            }

            // Không thể chat với chính mình
            const messagingYourself = searchedUser?._id === currentUser?._id;
            if (messagingYourself) {
                showToast("Error", "You cannot message yourself", "error");
                return;
            }

            // Kiểm tra xem người tìm kiếm đã có trong cuộc trò chuyện hay chưa
            const conversationAlreadyExists = conversations.find(
                (conversation) =>
                    conversation.participants[0]?._id === searchedUser?._id
            );
            if (conversationAlreadyExists) {
                setSelectedConversation({
                    _id: conversationAlreadyExists?._id,
                    userId: searchedUser?._id,
                    username: searchedUser?.username,
                    userProfilePic: searchedUser?.profilePic,
                });

                return;
            }

            // Nếu chưa có conversation của người nhận thì tạo 1 conversation mới.
            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: "",
                },
                _id: Date.now(),
                participants: [
                    {
                        _id: searchedUser?._id,
                        username: searchedUser?.username,
                        profilePic: searchedUser?.profilePic,
                    },
                ],
            };

            setConversations((prevConvs) => [...prevConvs, mockConversation]);
        } catch (e) {
            showToast("Error", e?.message, "error");
        } finally {
            setSearchingUser(false);
        }
    };

    return (
        <Box
            position={"absolute"}
            left={"50%"}
            w={{
                base: "100%",
                md: "80%",
                lg: "750px",
            }}
            p={4}
            transform={"translateX(-50%)"}
        >
            <Flex
                gap={4}
                flexDirection={{
                    base: "column",
                    md: "row",
                }}
                maxW={{
                    sm: "400px",
                    md: "full",
                }}
                mx={"auto"}
            >
                <Flex
                    flex={30}
                    gap={2}
                    flexDirection={"column"}
                    maxW={{
                        sm: "250ox",
                        md: "full",
                    }}
                    mx={"auto"}
                >
                    <Text
                        fontWeight={700}
                        color={useColorModeValue("gray.600", "gray.400")}
                    >
                        Your conversations
                    </Text>
                    <form onSubmit={handleConversationSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input
                                placeholder="Search for a user"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button
                                size={"sm"}
                                onClick={handleConversationSearch}
                                isLoading={searchingUser}
                            >
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {loadingConversations &&
                        [0, 1, 2].map((_, i) => (
                            <Flex
                                key={i}
                                gap={4}
                                alignItems={"center"}
                                p={1}
                                borderRadius={"md"}
                            >
                                <Box>
                                    <SkeletonCircle size={10} />
                                </Box>
                                <Flex
                                    w={"full"}
                                    flexDirection={"column"}
                                    gap={3}
                                >
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>
                        ))}
                    {!loadingConversations &&
                        conversations &&
                        conversations.length > 0 &&
                        conversations.map((conversation) => (
                            <Conversation
                                key={conversation._id}
                                isOnline={onlineUsers.includes(
                                    conversation?.participants[0]?._id
                                )}
                                conversation={conversation}
                            />
                        ))}
                </Flex>

                {!selectedConversation._id && (
                    <Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDirection={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text fontSize={20}>
                            Select a conversation to start messaging
                        </Text>
                    </Flex>
                )}
                {selectedConversation._id && <MessageContainer />}
            </Flex>
        </Box>
    );
};

export default ChatPage;
