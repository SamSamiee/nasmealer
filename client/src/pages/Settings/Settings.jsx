import React from "react";
import styles from "./Settings.module.css";
import RadioButton from "../../components/RadioButton";
import PIP from "../../components/PIP";

import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";

function Settings() {
   // idle | succes | changed | loading | error
   const [state, setState] = React.useState("idle");
   const [changed, setChanged] = React.useState(false);
   const [publicPlansState, setPublicPlansState] =
      React.useState("disabled");
   React.useEffect(() => {
      async function getSettings() {
         try {
            const result = await fetch(
               `${SERVER_URL}/user/settings`,
               {
                  method: "GET",
                  credentials: "include",
                  headers: getAuthHeaders(),
               }
            );
            const json = await result.json();
            const data = json.data;

            setPublicPlansState(data);
         } catch (err) {
            setPublicPlansState("error");
            console.error(err);
         }
      }
      getSettings();
   }, []);

   async function handleChange() {
      const previousState = publicPlansState;
      const newState = !publicPlansState;

      setPublicPlansState(newState);

      try {
         const result = await fetch(
            `${SERVER_URL}/user/settings`,
            {
               method: "PATCH",
               credentials: "include",
               body: JSON.stringify({
                  settings: { public_plans: newState },
               }),
               headers: {
                  ...getAuthHeaders(),
                  "Content-Type": "application/json",
               },
            }
         );

         if (!result.ok) {
            throw new Error("Operation failed");
         }
      } catch (err) {
         setPublicPlansState(previousState);
         console.error(err);
      }
      return;
   }

   if (publicPlansState === "error") {
      return (
         <PIP
            header=":|"
            footer="couldn't get your settings"
         />
      );
   }

   return (
      <div className={styles.wrapper}>
         <h1>Settings</h1>
         <div className={styles.settings}>
            <div>
               <div className={styles.settingItem}>
                  Public meals and plans
               </div>
               <RadioButton
                  onClick={handleChange}
                  value={
                     publicPlansState === "error"
                        ? "disabled"
                        : publicPlansState
                  }
               />
            </div>
         </div>
         {changed && <button>save</button>}
      </div>
   );
}

export default Settings;
