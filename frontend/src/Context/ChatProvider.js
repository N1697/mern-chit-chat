import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext(); //This context object is used to share the states across the components of the app.

//Create a ChatProvider that will wrap the whole app
//Whatever state we create in this Context API, it's gonna be accessible to the whole app
//This way, the Context API becomes the SSOT of the whole app

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const history = useHistory();

  //When Login or SignUp, user info is stored in the localStorage, so we'll fetch the localStorage to get the user info
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    /*
    The data stored in the localStorage is always in the form of a string, and to store a JavaScript object,
    we need to convert it to a string using the JSON.stringify() method. Similarly, when we retrieve the data from the localStorage,
    we get it in string format, and we need to convert it back to a JavaScript object using the JSON.parse() method.
    */

    setUser(userInfo);

    //Check if the user is not logged-in, redirect the user to the Login page
    if (!userInfo) {
      //If the userInfo is not available, it means the user is not logged in,
      //and the user is redirected to the login page using the history.push() method.
      history.push("/");
    }
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  //To make the states accessible to other parts of the app, we need to use the 'useContext()' hook
  //React Hook "useContext" cannot be called at the top level.
  //React Hooks must be called in a React function component or a custom React Hook function
  return useContext(ChatContext);
  //The useContext hook takes the context object as an argument and returns its current value.
  //It returns the values of the states using the useContext() hook.
};

export default ChatProvider;
