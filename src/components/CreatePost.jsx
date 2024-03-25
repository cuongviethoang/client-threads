import { AddIcon } from "@chakra-ui/icons";
import {
    Button,
    CloseButton,
    Flex,
    FormControl,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
    const currentUser = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom);

    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const username = useParams();

    const [postText, setPostText] = useState("");
    const [loading, setLoading] = useState(false);
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);

    const imageRef = useRef(null);

    const showToast = useShowToast();

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    };

    const handleCreatePost = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postedBy: currentUser._id,
                    text: postText,
                    img: imgUrl,
                }),
            });

            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Create post success", "success");
            if (username === currentUser?.username) {
                setPosts([data, ...posts]);
            }

            onClose();
        } catch (e) {
            showToast("Error", e, "error");
        } finally {
            setPostText("");
            setImgUrl("");
            setLoading(false);
        }
    };

    const handleCloseModelPost = () => {
        setImgUrl("");
        onClose();
    };
    return (
        <>
            <Button
                position={"fixed"}
                bottom={10}
                right={5}
                bg={useColorModeValue("gray.300", "gray.dark")}
                onClick={onOpen}
                size={{
                    base: "sm",
                    md: "md",
                }}
            >
                <AddIcon />
            </Button>

            <Modal isOpen={isOpen} onClose={handleCloseModelPost}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Textarea
                                value={postText}
                                onChange={(e) => handleTextChange(e)}
                                placeholder="Post content go here..."
                            />
                            <Text
                                fontSize={"xs"}
                                fontWeight={"bold"}
                                textAlign={"right"}
                                m={1}
                                color={"gray.800"}
                            >
                                {remainingChar}/{MAX_CHAR}
                            </Text>
                            <Input
                                type="file"
                                multiple
                                hidden
                                ref={imageRef}
                                onChange={(e) => handleImageChange(e)}
                            />

                            <BsFillImageFill
                                style={{
                                    marginLeft: "5px",
                                    cursor: "pointer",
                                }}
                                size={16}
                                onClick={() => imageRef.current.click()}
                            />
                        </FormControl>

                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                <Image
                                    src={imgUrl}
                                    alt="Selected img"
                                    objectFit={"cover"}
                                />
                                <CloseButton
                                    onClick={() => {
                                        setImgUrl("");
                                    }}
                                    bg={"gray.800"}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={handleCreatePost}
                            isLoading={loading}
                        >
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreatePost;
