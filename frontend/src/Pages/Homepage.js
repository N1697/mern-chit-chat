import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { Login, SignUp } from "../components/Authentication/index.js";
import { useHistory } from "react-router-dom";

const Homepage = () => {
  const history = useHistory();

  //When Login or SignUp, user info is stored in the localStorage, so we'll fetch the localStorage to get the user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    /*
    The data stored in the localStorage is always in the form of a string, and to store a JavaScript object,
    we need to convert it to a string using the JSON.stringify() method. Similarly, when we retrieve the data from the localStorage,
    we get it in string format, and we need to convert it back to a JavaScript object using the JSON.parse() method.
    */

    //Check if the user is logged-in, redirect the user to the ChatPage page
    if (user) {
      history.push("/app");
    }
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          color="black"
          fontSize="4xl"
          fontFamily="Work Sans"
          textAlign="center"
        >
          Chit-Chat
        </Text>
      </Box>
      <Box bg="white" w="100%" p="4" borderRadius="lg" borderWidth="1px">
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb="1em">
            <Tab w="50%">Login</Tab>
            <Tab w="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            {/* TabPanel for Login */}
            <TabPanel>
              <Login />
            </TabPanel>
            {/* TabPanel for Sign Up */}
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
