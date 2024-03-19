import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

export default function LoginCard() {
    const [showPassword, setShowPassword] = useState(false);

    // setAuthScreen để chuyển hướng trang giữa login và logout
    const setAuthScreen = useSetRecoilState(authScreenAtom);

    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });

    // setUser để khi đăng nhập sẽ lưu được thông tin user trong userAtom
    const setUser = useSetRecoilState(userAtom);

    // custom hook toast
    const showToast = useShowToast();

    const handleLogin = async () => {
        // console.log(inputs);
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", data.message, "success");
            setUser(data);
            localStorage.setItem("user-threads", JSON.stringify(data));
        } catch (e) {
            showToast("Error", e, "error");
        }
    };

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Login
                    </Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.dark")}
                    boxShadow={"lg"}
                    p={8}
                    w={{
                        base: "full",
                        sm: "400px",
                    }}
                >
                    <Stack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>User Name</FormLabel>
                            <Input
                                type="text"
                                value={inputs.username}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        username: e.target.value,
                                    })
                                }
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={inputs.password}
                                    onChange={(e) =>
                                        setInputs({
                                            ...inputs,
                                            password: e.target.value,
                                        })
                                    }
                                />
                                <InputRightElement h={"full"}>
                                    <Button
                                        variant={"ghost"}
                                        onClick={() =>
                                            setShowPassword(
                                                (showPassword) => !showPassword
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <ViewIcon />
                                        ) : (
                                            <ViewOffIcon />
                                        )}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Submitting"
                                size="lg"
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue(
                                        "gray.700",
                                        "gray.800"
                                    ),
                                }}
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={"center"}>
                                Don&apos;t have an account?{" "}
                                <Link
                                    color={"blue.400"}
                                    onClick={() => setAuthScreen("signup")}
                                >
                                    Sign up
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
