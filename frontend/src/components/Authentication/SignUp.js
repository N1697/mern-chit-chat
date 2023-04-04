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

const SignUp = () => {
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [email, setEmail] = useState();
  const [pic, setPic] = useState(); //Use Cloudinary to store picture
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  //Function used to Toggle show/hide password
  const handleClick = () => setShowPassword(!showPassword);

  //Function used to upload picture to Cloudinary
  const postDetails = (pics) => {
    setLoading(true);

    //Step 1: Check if pic is undefined, if so, pop up an error using ChakraUI's toast
    if (pics === undefined) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return; //We're not moving forward if the pics is undefined, prevent the rest of the code from executing.
    }

    //Step 2: If there's something selected, check if it's actually an image
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      //Create form to add to Cloudinary
      const data = new FormData(); //This FormData object will be sent as the request body to Cloudinary
      data.append("file", pics);
      data.append("upload_preset", "chit-chatting"); //chit-chatting: the name of the app on Cloudinary
      data.append("cloud_name", "dnrkukyca"); //dnrkukyca: the name of the cloud

      fetch(
        "https://api.cloudinary.com/v1_1/dnrkukyca/image/upload" /*API Base URL*/,
        {
          method: "post",
          body: data, //FormData object
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString()); //Both data.url and data.url.toString() are of type string, so there is no practical reason to call .toString() on data.url, calling .toString() on it has no effect
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.log(error);
        });
    } else {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
      return; //Prevent the rest of the code from executing
    }
  };

  //Function used to handle submition
  const handleSubmit = async () => {
    setLoading(true);

    //Step 1: Check if one of the fields is not filled up
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill up the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
      return;
    }

    //Step 2: If all of the fields are filled up, check if the password does not match the confirmPassword
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    //Step 3: If all of the conditions met, make API request to store the data to the database
    try {
      //Set the header for the request
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      //When sending data from frontend to backend, use Axios
      const { data } = await axios.post(
        "https://chit-chat-u1xp.onrender.com/api/user",
        //The user controller registerUser() will take the below object to register the new user,
        //then the backend returns the new created user with a JWT and store it in 'data'.
        {
          name,
          password,
          email,
          pic,
        },
        config
      );
      //Give a toast when the registration is successful
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      //Take the 'data' and store it in localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);

      //When the user has been successfully registered, log in and push the user to the ChatPage
      history.push("/chats");
      window.location.reload(); // Reload the page after signup to get the value for 'loggedUser' after the userEffect in MyChats ran
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
      {/* Name */}
      <FormControl id="name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter Your Name"
          onChange={(event) => setName(event.target.value)}
        />
      </FormControl>

      {/* Email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
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

      {/* Comfirm Password */}
      <FormControl id="password" isRequired>
        <FormLabel>Comfirm Password</FormLabel>

        <InputGroup>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Comfirm Your Password"
            onChange={(event) => setConfirmPassword(event.target.value)}
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

      {/* Picture */}
      <FormControl id="pic" isRequired>
        <FormLabel>Upload Your Profile Picture</FormLabel>
        <Input
          type="file"
          p="1.5"
          accep="image/*"
          onChange={(event) => postDetails(event.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        w="100%"
        style={{ marginTop: 15 }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
