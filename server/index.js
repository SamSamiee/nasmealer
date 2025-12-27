const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const pool = require("./db.js");
const cookieParser = require("cookie-parser");
require("dotenv/config");
const { errorHandler } = require("./middlewares/error.middleware.js");

// ROUTERS
const userRouter = require("./routes/user.routes.js");
const mealRouter = require("./routes/meals.routes.js");
const ingredientRouter = require("./routes/ingredients.routes.js");
const planRouter = require("./routes/plans.routes.js");
const cartRouter = require("./routes/cart.routes.js");

//MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (req) {
    console.log("server hit with", req.method);
    next();
  }
});

//ROUTES
app.use("/user", userRouter);
app.use("/meals", mealRouter);
app.use("/ingredients", ingredientRouter);
app.use("/plans", planRouter);
app.use("/cart", cartRouter);

//ERROR HANDLER
app.use(errorHandler);

app.listen(port, () => console.log(`server is running on port ${port}`));
