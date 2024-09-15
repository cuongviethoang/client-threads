import { Link } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Flex,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

import useFollowUnfollow from "../hooks/useFollowUnfollow";

const SuggestedUser = ({ user }) => {
    const { handleFollowUnFollow, updating, following } =
        useFollowUnfollow(user);

    return (
        <>
            <Flex
                gap={2}
                justifyContent={"space-between"}
                alignItems={"center"}
                _hover={{
                    cursor: "pointer",
                    bg: useColorModeValue("gray.400", "gray.dark"),
                    color: "white",
                }}
                p={1}
                borderRadius={4}
            >
                {/* left side */}
                <Flex gap={2} as={Link} to={`${user.username}`}>
                    <Avatar src={user.profilePic} />
                    <Box>
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                            {user.username}
                        </Text>
                        <Text color={"gray.light"} fontSize={"sm"}>
                            {user.name}
                        </Text>
                    </Box>
                </Flex>
                {/* right side */}
                <Button
                    size={"sm"}
                    color={following ? "black" : "white"}
                    bg={following ? "white" : "blue.400"}
                    onClick={handleFollowUnFollow}
                    isLoading={updating}
                    _hover={{
                        color: following ? "black" : "white",
                        opacity: ".8",
                    }}
                >
                    {following ? "Unfollow" : "Follow"}
                </Button>
            </Flex>
        </>
    );
};

export default SuggestedUser;
