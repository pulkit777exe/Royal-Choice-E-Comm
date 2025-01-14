import { BrowserRouter as Router, Routes, Route } from "react-router" 
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import Home from "./pages/Home"
import ErrorPage from "./pages/Error"
import AdminPage from "./pages/Admin"


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path={"/home"} element={<Home />} />
          <Route path={"/"} element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>      
    </>
  )
}

export default App
