import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { IoSendSharp } from "react-icons/io5";
const MessageInput = () => {
    return (
        <form>
            <InputGroup>
                <Input width={"full"} placeholder="Type a message" />
                <InputRightElement>
                    <IoSendSharp />
                </InputRightElement>
            </InputGroup>
        </form>
    );
};

export default MessageInput;
