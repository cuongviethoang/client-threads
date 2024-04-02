import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
    conversationsAtom,
    selectedConversationAtom,
} from "../atoms/messagesAtom";
const MessageInput = ({ setMessages }) => {
    const [messageText, setMessageText] = useState("");
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const setConversations = useSetRecoilState(conversationsAtom);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        try {
            const res = await fetch(`api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipientId: selectedConversation.userId,
                    message: messageText.trim(),
                }),
            });

            const data = await res.json();

            if (data?.error) {
                showToast("Error", data.error, "error");
                return;
            }

            setMessages((messages) => [...messages, data]);

            // của người gửi message: Đẩy conversation lên đầu tiên
            setConversations((prevConvs) => {
                const updateConversations = [];
                prevConvs.forEach((conversation) => {
                    if (conversation?._id === selectedConversation?._id) {
                        return updateConversations.unshift({
                            ...conversation,
                            mock: false,
                            lastMessage: {
                                text: messageText,
                                sender: data?.sender,
                            },
                        });
                    }
                    return updateConversations.push(conversation);
                });
                return updateConversations;
            });

            setMessageText("");
        } catch (e) {
            showToast("Error", e.message, "error");
        }
    };
    return (
        <form onSubmit={handleSendMessage}>
            <InputGroup>
                <Input
                    width={"full"}
                    placeholder="Type a message"
                    onChange={(e) => setMessageText(e.target.value)}
                    value={messageText}
                />
                <InputRightElement
                    onClick={handleSendMessage}
                    cursor={"pointer"}
                >
                    <IoSendSharp />
                </InputRightElement>
            </InputGroup>
        </form>
    );
};

export default MessageInput;
