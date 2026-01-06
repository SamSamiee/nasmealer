const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const pool = require("./db.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv/config");
const {
   errorHandler,
} = require("./middlewares/error.middleware.js");

// ROUTERS
const userRouter = require("./routes/user.routes.js");
const mealRouter = require("./routes/meals.routes.js");
const ingredientRouter = require("./routes/ingredients.routes.js");
const planRouter = require("./routes/plans.routes.js");
const cartRouter = require("./routes/cart.routes.js");
const adminRouter = require("./routes/admin.routes.js");
const homeRouter = require("./routes/home.routes.js");

//MIDDLEWARES
app.use(
   cors({
      origin: (origin, callback) => {
         // Allow requests with no origin (like mobile apps or curl requests)
         if (!origin) return callback(null, true);

         // Allow CLIENT_ORIGIN if set
         if (
            process.env.CLIENT_ORIGIN &&
            origin === process.env.CLIENT_ORIGIN
         ) {
            return callback(null, true);
         }

         // Allow all Vercel URLs (*.vercel.app)
         if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
         }

         // Allow your custom domain
         if (origin === "https://nasmealer.callstack.cc") {
            return callback(null, true);
         }

         // Allow localhost for local development
         if (
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")
         ) {
            return callback(null, true);
         }

         // Reject other origins
         callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
   })
);

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
   if (req) {
      console.log("server hit with", req.method);
      next();
   }
});

//ROUTES
app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/meals", mealRouter);
app.use("/ingredients", ingredientRouter);
app.use("/plans", planRouter);
app.use("/cart", cartRouter);
app.use("/admin", adminRouter);

//ERROR HANDLER
app.use(errorHandler);

app.listen(port, () =>
   console.log(`server is running on port ${port}`)
);
