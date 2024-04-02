import {
    Avatar,
    Divider,
    Flex,
    Image,
    Skeleton,
    SkeletonCircle,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useEffect, useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
    conversationsAtom,
    selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const MessageContainer = () => {
    const { socket } = useSocket();
    const showToast = useShowToast();

    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);

    const currentUser = useRecoilValue(userAtom);
    const [selectedConversation, setSelectedConversation] = useRecoilState(
        selectedConversationAtom
    );
    const setConversations = useSetRecoilState(conversationsAtom);

    const messageEndRef = useRef(null);

    useEffect(() => {
        socket.on("newMessage", (message) => {
            // check xem message sẽ được nhận về ở khung chat nào, nếu không có check này
            // thì chỉ cân đang ở khung chat khác vẫn có thể nhận được tin nhắn không đúng người nhận
            // setMessages((prevMessages) => [...prevMessages, message]);

            if (selectedConversation?._id === message?.conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }

            // của người nhận message: đẩy conversation lên đầu tiên
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

        return () => socket.off("newMessage");
    }, [socket]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);
            try {
                if (selectedConversation?.mock) return;
                const res = await fetch(
                    `/api/messages/${selectedConversation.userId}`
                );
                const data = await res.json();
                console.log(data);
                if (data?.error) {
                    showToast("Error", data.error, "error");
                    return;
                }

                setMessages(data);
            } catch (e) {
                showToast("Error", e?.message, "error");
            } finally {
                setLoadingMessages(false);
            }
        };

        getMessages();
    }, [showToast, selectedConversation.userId]);

    return (
        <Flex
            flex="70"
            bg={useColorModeValue("gray.200", "gray.dark")}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            {/* Message Header */}
            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar
                    src={selectedConversation?.userProfilePic}
                    size={"sm"}
                />
                <Text display={"flex"} alignItems={"center"}>
                    {selectedConversation?.username}{" "}
                    <Image src="/verified.png" w={4} h={4} ml={1} />
                </Text>
            </Flex>

            <Divider />

            {/* Message */}
            <Flex
                flexDir={"column"}
                gap={4}
                my={4}
                height={"400px"}
                overflowY={"auto"}
                px={2}
            >
                {loadingMessages &&
                    [...Array(5)].map((_, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex flexDir={"column"} gap={2}>
                                <Skeleton h={"8px"} w={"250px"} />
                                <Skeleton h={"8px"} w={"250px"} />
                                <Skeleton h={"8px"} w={"250px"} />
                            </Flex>

                            {i % 2 !== 0 && <SkeletonCircle size={7} />}
                        </Flex>
                    ))}
                {!loadingMessages &&
                    messages &&
                    messages.length > 0 &&
                    messages.map((message, index) => (
                        <Flex
                            key={index}
                            direction={"column"}
                            ref={
                                messages.length - 1 ===
                                messages.indexOf(message)
                                    ? messageEndRef
                                    : null
                            }
                        >
                            <Message
                                message={message}
                                ownMessage={currentUser._id === message?.sender}
                            />
                        </Flex>
                    ))}
            </Flex>

            <MessageInput setMessages={setMessages} />
        </Flex>
    );
};

export default MessageContainer;
