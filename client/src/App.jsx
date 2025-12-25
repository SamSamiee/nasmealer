import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Meals from "./pages/Meals";
import Plans from "./pages/Plans";
import NewPlan from "./pages/NewPlan";
import NewMeal from "./pages/NewMeal";
import Navbar from "./components/Navbar";
import MealCard from "./components/MealCard";
import React from "react";

function App() {
  const [input, setInput] = React.useState("");
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/cart"
            element={<Cart />}
          />
          <Route
            path="/newmeal"
            element={<NewMeal />}
          />
          <Route
            path="/newmeal/:mealId/edit"
            element={<NewMeal />}
          />
          <Route
            path="/meals"
            element={<Meals />}
          />
          <Route
            path="/plans"
            element={<Plans />}
          />
          <Route
            path="/newplan"
            element={<NewPlan />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
