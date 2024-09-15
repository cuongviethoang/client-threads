import { useEffect, useRef, useState } from "react";
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
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
    conversationsAtom,
    selectedConversationAtom,
} from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";

import { useSocket } from "../context/SocketContext";

import useShowToast from "../hooks/useShowToast";

import Message from "./Message";
import MessageInput from "./MessageInput";
import messageSound from "../assets/sounds/message.mp3";

const MessageContainer = () => {
    const { socket } = useSocket();
    const showToast = useShowToast();

    const messageEndRef = useRef(null);

    const currentUser = useRecoilValue(userAtom);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const setConversations = useSetRecoilState(conversationsAtom);

    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("newMessage", (message) => {
            // check xem message sẽ được nhận về ở khung chat nào, nếu không có check này
            // thì chỉ cân đang ở khung chat khác vẫn có thể nhận được tin nhắn không đúng người nhận
            // setMessages((prevMessages) => [...prevMessages, message]);

            if (selectedConversation?._id === message?.conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }

            if (!document.hasFocus()) {
                const sound = new Audio(messageSound);
                sound.play();
            }
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

        return () => socket.off("newMessage");
    }, [socket, selectedConversation, setConversations]);

    useEffect(() => {
        // đang ở trong 1 container message thì có nghĩa là mình đang chat với 1 ng nào đó
        // kiểm tra xem tin nhắn cuối cùng đc gửi có phải của ng khác gửi cho mình không
        // nếu đúng => đánh dấu là đã xem (markMessageSeen) => vì đang ở trong 1 selectedConversation mà
        const lastMessageIsFromOtherUser =
            messages.length &&
            messages[messages.length - 1].sender !== currentUser._id;

        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesSeen", {
                conversationId: selectedConversation._id, // id cuộc trò chuyện
                userId: selectedConversation.userId, // id người nhận
            });
        }

        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                setMessages((prev) => {
                    const updateMessages = prev.map((message) => {
                        if (message?.seen === false) {
                            return {
                                ...message,
                                seen: true,
                            };
                        }
                        return message;
                    });
                    return updateMessages;
                });
            }
        });
    }, [socket, currentUser?._id, messages, selectedConversation]);

    // xử lý cuộn đến phần tử có ref = messageEndRef
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);
            try {
                // nếu mock === true thì có nghĩa là conversation mới tạo, không có tin nhắn
                // vì không có tin nhắn nên sẽ không có conversation trong db chỉ có 1
                // mockConversation tự custom trên giao diện. Chình vì thế return để ko gọi api
                if (selectedConversation?.mock) return;
                const res = await fetch(
                    `/api/messages/${selectedConversation.userId}`
                );
                const data = await res.json();
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
    }, [showToast, selectedConversation.userId, selectedConversation.mock]);

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
