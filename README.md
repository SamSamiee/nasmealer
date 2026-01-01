# Nasmealer
#### Video Demo:  https://youtu.be/qZK8Le2eigo
#### Description:

Nasmealer is a web-based meal planning application that helps users organize their weekly meals and automatically generate shopping lists. The application allows users to create meals with specific ingredients, build weekly meal plans, and convert those plans into shopping carts with all necessary ingredients automatically calculated.

## Project Overview

The core functionality revolves around three main features: meal creation, weekly planning, and shopping cart generation. Users start by creating meals and adding ingredients with quantities and units (grams, kilograms, pieces, milliliters, or liters). Once meals are created, users can build weekly plans by assigning meals to specific days and meal types (breakfast, lunch, or dinner). The most useful feature is the ability to convert an entire weekly plan into a shopping cart, where all ingredients from all selected meals are automatically aggregated. Users can then manage their shopping cart by marking items as completed, adding extra products manually, and clearing finished items.

Building this project really pushed my React knowledge to the limit. I had some familiarity with React before, but definitely not at the level needed for this project. I had to learn advanced concepts like custom hooks for state management, optimistic rendering for better user experience, and proper handling of protected routes with authentication. For the backend, I decided to go with Node.js and Express, which I hadn't really used before, along with PostgreSQL for the database. So it's a PERN stack application (PostgreSQL, Express, React.js, Node.js) - which felt like a natural choice for a full-stack web app.

## Technical Implementation

The project is split into two main directories: `client` for the React frontend and `server` for the Node.js/Express backend.

### Backend Structure (`server/`)

The server uses Express.js with a modular route structure. The `index.js` file sets up the Express application with CORS configuration, cookie parsing for authentication, and error handling middleware. Database connections are handled through `db.js` using the `pg` library for PostgreSQL.

The routes are organized by feature:
- `user.routes.js` handles user registration, login, logout, and session management with bcrypt for password hashing
- `meals.routes.js` manages CRUD operations for meals and their associated ingredients
- `plans.routes.js` handles weekly meal plan creation and retrieval
- `cart.routes.js` manages shopping cart operations, including adding meals' ingredients to the cart and handling cart items
- `ingredients.routes.js` manages ingredient creation and retrieval
- `admin.routes.js` handles admin-specific functionality
- `home.routes.js` provides summary data for the home page

Authentication is implemented using cookie-based sessions stored in a `user_sessions` table, with middleware in `middlewares/auth.middleware.js` that validates sessions on protected routes. Error handling is centralized in `middlewares/error.middleware.js`.

The database schema (`database.sql`) uses PostgreSQL with custom ENUM types for roles, units, meal types, and day types. The design emphasizes data integrity with foreign key constraints and unique indexes to prevent duplicate cart items. One interesting design decision was using a single `cart_items` table that can reference either `ingredients` or `products` (for extra items added manually), using a CHECK constraint to ensure only one reference is set.

### Frontend Structure (`client/`)

The React application is built with Vite and uses React Router for navigation. The main entry point is `App.jsx`, which sets up routing and wraps the application in a `UserProvider` context for global user state management.

The pages are organized as follows:
- `Home.jsx` displays a dashboard with counts of meals, plans, and pending cart items, with quick access to creating new meals or plans
- `Login.jsx` and `SignUp.jsx` handle user authentication
- `Meals.jsx` displays all user meals with the ability to view, edit, or delete them
- `NewMeal.jsx` provides a form to create or edit meals with ingredient management
- `Plans.jsx` shows all saved weekly plans
- `NewPlan.jsx` renders the `WeekTable` component for creating new plans
- `Cart.jsx` displays and manages shopping cart items, separated into ingredients (from meals), products (manually added), and completed items

The component architecture follows a modular approach:
- `WeekTable` is a complex component that displays a weekly grid where users can select meals for each day and meal type
- `Day` and `Meal` components are used within `WeekTable` to represent individual days and meal selections
- `CartItem` displays individual cart items with status toggling
- `MealCard` and `IngredientCard` provide reusable card components
- `ProtectedRoute` wraps routes that require authentication, redirecting to login if needed
- `Navbar` and `HamMenu` provide navigation

Custom hooks encapsulate complex logic:
- `useCart.js` manages cart state and implements optimistic rendering for status updates and item additions
- `useWeekTable.js` handles the weekly plan state and meal selection logic
- `useNewMeal.js` manages meal creation form state
- `useHamMenu.js` handles mobile navigation state

One of the more challenging parts was implementing optimistic rendering throughout the app. When users delete meals, toggle cart item status, or add items, the UI updates immediately before the API call even finishes. If something goes wrong, it rolls back to the previous state. This makes the app feel way more responsive. I used Cursor mostly for the more complicated frontend tasks like optimistic rendering, since I was pretty new to this concept. I monitored all the edits to my functions and learned a lot during the process - it's really interesting how you handle rollbacks and edge cases. The backend was mostly my own work, though I did use ChatGPT for debugging here and there when I got stuck on SQL queries or Express middleware issues.

Styling is done entirely with CSS Modules, keeping styles scoped to individual components. The application uses a consistent design system with custom fonts and a clean, modern interface.

## Design Decisions

I made a few design decisions that shaped how the app turned out. I went with CSS Modules instead of CSS-in-JS to keep dependencies minimal and make styles easier to work with. The custom hook pattern helped keep my components clean and the complex state management logic reusable. For authentication, I chose cookie-based sessions over JWT tokens in localStorage mostly because it seemed easier to handle for people with less experience on the backend.

For the database, I used UUIDs as primary keys instead of auto-incrementing integers - better for scalability and you're not exposing sequential IDs. One thing I'm happy about is the cart system design - it handles both ingredients (from meals) and products (manually added) in the same table, which keeps the UI simple while still maintaining data integrity through database constraints.

Overall, this project was a great learning experience that really pushed me to understand full-stack development better - from database design all the way to frontend state management patterns. The end result is something I actually use regularly for planning my meals and generating shopping lists, which makes it feel more meaningful than just a school project.

