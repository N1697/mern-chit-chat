import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  const handleClick = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    setLoading(true);
    //Step 1: Check if one of the fields is not filled up
    if (!email || !password) {
      toast({
        title: "Please fill up the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
      return; //Prevent the rest of the code from executing
    }

    //Step 2: If all of the fields are filled up,  make API request to authenticate the user
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/login",
        //The user controller authUser() will take the below object to authenticate the user, then the backend returns the user with a JWT and store it in 'data'.
        {
          email,
          password,
        },
        config
      );
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      //Take the 'data' and store it in localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats"); //When the user has been successfully logged in, push the user to the ChatPage
      window.location.reload(); // Reload the page after login to get the value for 'loggedUser' after the userEffect in MyChats ran
    } catch (error) {
      toast({
        title: "Error Occurs",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px" color="black">
      {/* Email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormControl>

      {/* Password */}
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>

        <InputGroup>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <InputRightElement w="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              fontSize="30"
              bg="transparent"
              _hover={{ bg: "transparent" }}
              onClick={handleClick}
            >
              {showPassword ? "😯" : "🫣"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Log In Button */}
      <Button
        colorScheme="blue"
        w="100%"
        style={{ marginTop: 15 }}
        onClick={handleLogin}
        isLoading={loading}
      >
        Log In
      </Button>

      {/*  Button */}

      <Button
        variant="solid"
        color="white"
        bg="#bf729c"
        _hover={{ bg: "#af9ec3" }}
        w="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
