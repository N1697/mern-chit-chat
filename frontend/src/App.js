import { Route } from "react-router-dom";
import "./App.css";
import ChatPage from "./Pages/ChatPage";
import Homepage from "./Pages/Homepage";

function App() {
  return (
    <div className="App">
      <Route path="/" exact render={() => <Homepage />} />
      <Route path="/app" render={() => <ChatPage />} />
    </div>
  );
}

export default App;
