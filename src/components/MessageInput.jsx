import { useRef, useState } from "react";
import {
    Flex,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    useDisclosure,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import { IoSendSharp } from "react-icons/io5";

import useShowToast from "../hooks/useShowToast";
import usePreviewImg from "../hooks/usePreviewImg";

import {
    conversationsAtom,
    selectedConversationAtom,
} from "../atoms/messagesAtom";

const MessageInput = ({ setMessages }) => {
    const showToast = useShowToast();
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

    const { onClose } = useDisclosure();

    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const setConversations = useSetRecoilState(conversationsAtom);

    const imageRef = useRef(null);

    const [messageText, setMessageText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() && !imgUrl) return;
        if (isSending) return;
        setIsSending(true);

        try {
            const res = await fetch(`api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipientId: selectedConversation.userId,
                    message: messageText.trim(),
                    img: imgUrl,
                }),
            });

            const data = await res.json();

            if (data?.error) {
                showToast("Error", data.error, "error");
                return;
            }

            // đẩy data message vào messageContainer của người gửi tin nhắn
            setMessages((messages) => [...messages, data]);

            // người gửi message: Đẩy conversation lên đầu tiên
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
            setImgUrl("");
        } catch (e) {
            showToast("Error", e.message, "error");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Flex gap={2} alignItems={"center"}>
            <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
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
            <Flex flex={5} cursor={"pointer"}>
                <BsFillImageFill
                    size={20}
                    onClick={() => imageRef.current.click()}
                />
                <Input
                    type={"file"}
                    hidden
                    ref={imageRef}
                    onChange={(e) => handleImageChange(e)}
                />
            </Flex>
            <Modal
                isOpen={imgUrl}
                onClose={() => {
                    onClose();
                    setImgUrl("");
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={"full"}>
                            <Image src={imgUrl} />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            {!isSending ? (
                                <IoSendSharp
                                    size={24}
                                    cursor={"pointer"}
                                    onClick={handleSendMessage}
                                />
                            ) : (
                                <Spinner size={"md"} />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default MessageInput;
