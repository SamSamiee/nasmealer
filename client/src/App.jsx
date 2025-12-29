import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Meals from "./pages/Meals";
import Plans from "./pages/Plans";
import NewPlan from "./pages/NewPlan";
import NewMeal from "./pages/NewMeal";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import MealCard from "./components/MealCard";
import ProtectedRoute from "./components/ProtectedRoute"
import React from "react";
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
              path="/"
              element={<ProtectedRoute><Home /></ProtectedRoute>}
            />
            <Route
              path="/cart"
              element={<ProtectedRoute><Cart /></ProtectedRoute>}
            />
            <Route
              path="/newmeal"
              element={<ProtectedRoute><NewMeal /></ProtectedRoute>}
            />
            <Route
              path="/newmeal/:mealId/edit"
              element={<ProtectedRoute><NewMeal /></ProtectedRoute>}
            />
            <Route
              path="/meals"
              element={<ProtectedRoute><Meals /></ProtectedRoute>}
            />
            <Route
              path="/plans"
              element={<ProtectedRoute><Plans /></ProtectedRoute>}
            />
            <Route
              path="/newplan"
              element={<ProtectedRoute><NewPlan /></ProtectedRoute>}
            />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </>
  );
}

export default App;
