import { useMeals } from "../../hooks/useMeals";
import MealCard from "../../components/MealCard";
import PIP from "../../components/PIP";
import { IoAddSharp } from "react-icons/io5";
import styles from "./Meals.module.css";

function Meals() {
   const {
      isLoading,
      mealsList,
      navigate,
      handleDeleteMeal,
   } = useMeals();

   return isLoading ? (
      <PIP
         header="..."
         footer="loading..."
      />
   ) : (
      <div className={styles.container}>
         {mealsList.length > 0 ? (
            <div>
               <div className={styles.header}>
                  <button
                     className={styles.newMealButton}
                     onClick={() => navigate("/newmeal")}>
                     <IoAddSharp size={20} />
                  </button>
               </div>
               <div className={styles.mealsList}>
                  {mealsList.map(
                     ({ name, id, ingredients }) => (
                        <MealCard
                           key={id}
                           name={name}
                           list={ingredients}
                           fnRemove={() =>
                              handleDeleteMeal(id)
                           }
                        />
                     )
                  )}
               </div>
            </div>
         ) : (
            <PIP
               header=":("
               footer="you don't have any meals">
               <button onClick={() => navigate("/newmeal")}>
                  make a new meal
               </button>
            </PIP>
         )}
      </div>
   );
}

export default Meals;
