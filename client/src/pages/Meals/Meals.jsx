import { useMeals } from "../../hooks/useMeals";
import MealCard from "../../components/MealCard";
import PIP from "../../components/PIP";
import { IoAddSharp } from "react-icons/io5";
import styles from "./Meals.module.css";

function Meals({ allMeals, friend = false, backButton }) {
   const {
      isLoading,
      mealsList,
      navigate,
      handleDeleteMeal,
   } = useMeals(allMeals);

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
                  {!friend ? (
                     <button
                        className={styles.newMealButton}
                        onClick={() =>
                           navigate("/newmeal")
                        }>
                        <IoAddSharp size={20} />
                     </button>
                  ) : (
                     <button
                        className={styles.newMealButton}
                        onClick={() =>
                           backButton(false)
                        }>
                        back
                     </button>
                  )}
               </div>
               <div className={styles.mealsList}>
                  {mealsList.map(
                     ({ name, id, ingredients }) => (
                        <MealCard
                           key={id}
                           name={name}
                           list={ingredients}
                           fnRemove={!friend ? () => handleDeleteMeal(id) : undefined}
                           fnAdd={friend ? () => {
                              navigate("/newmeal", {
                                 state: {
                                    meal: {
                                       mealName: name,
                                       list: ingredients || [],
                                    },
                                 },
                              });
                           } : undefined}
                        />
                     )
                  )}
               </div>
            </div>
         ) : friend ? (
            <PIP
               header=":o"
               footer="they don't have any meals yet">
               <button
                  onClick={() => backButton(false)}>
                  go back
               </button>
            </PIP>
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
