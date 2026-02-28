import Homepage from "./components/pages/Homepage.jsx";
import NotFound from "./components/pages/NotFound.jsx"; // import new page
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";



function App() {

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID



  return (
    <div>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Homepage />} />
      
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
