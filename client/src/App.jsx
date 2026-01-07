import {
   BrowserRouter,
   Routes,
   Route,
} from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Meals from "./pages/Meals";
import Plans from "./pages/Plans";
import NewPlan from "./pages/NewPlan";
import NewMeal from "./pages/NewMeal";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Search from "./pages/Search";
import UserPage from "./pages/UserPage"
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
               </Routes>
            </BrowserRouter>
         </UserProvider>
      </>
   );
}

export default App;
