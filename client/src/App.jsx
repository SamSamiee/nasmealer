import {
   BrowserRouter,
   Routes,
   Route,
} from "react-router-dom";

import Cart from "./pages/Cart";
import Friends from "./pages/Friends"
import Home from "./pages/Home";
import Meals from "./pages/Meals";
import Login from "./pages/Login";
import NewMeal from "./pages/NewMeal";
import NewPlan from "./pages/NewPlan";
import Plans from "./pages/Plans";
import Requests from "./pages/Requests";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import UserPage from "./pages/UserPage";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import UserProvider from "./context/UserProvider";

function App() {
   return (
      <>
         <UserProvider>
            <BrowserRouter>
               <Navbar />
               <Routes>
                  <Route
                     path="/login"
                     element={<Login />}
                  />
                  <Route
                     path="/signUp"
                     element={<SignUp />}
                  />
                  <Route
                     path="/"
                     element={
                        <ProtectedRoute>
                           <Home />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/cart"
                     element={
                        <ProtectedRoute>
                           <Cart />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/friends"
                     element={
                        <ProtectedRoute>
                           <Friends />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/newmeal"
                     element={
                        <ProtectedRoute>
                           <NewMeal />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/newmeal/:mealId"
                     element={
                        <ProtectedRoute>
                           <NewMeal />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/meals"
                     element={
                        <ProtectedRoute>
                           <Meals />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/plans"
                     element={
                        <ProtectedRoute>
                           <Plans />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/search"
                     element={
                        <ProtectedRoute>
                           <Search />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/newplan"
                     element={
                        <ProtectedRoute>
                           <NewPlan />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/user/:userId/:username/:name"
                     element={
                        <ProtectedRoute>
                           <UserPage />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/settings"
                     element={
                        <ProtectedRoute>
                           <Settings />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/requests"
                     element={
                        <ProtectedRoute>
                           <Requests />
                        </ProtectedRoute>
                     }
                  />
               </Routes>
            </BrowserRouter>
         </UserProvider>
      </>
   );
}

export default App;
