import React from "react";
import styles from "./Settings.module.css";
import RadioButton from "../../components/RadioButton";
import PIP from "../../components/PIP";

import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";

function Settings() {
   // idle | changed | loading | error
   const [state, setState] = React.useState("idle");
   const [publicPlansState, setPublicPlansState] =
      React.useState("disabled");

   // GET SETTINGS FROM SERVER
   React.useEffect(() => {
      setState("loading");
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

            if (!result.ok) {
               throw new Error("no setting found");
            }

            const json = await result.json();
            const data = json.data;
            console.log("data received:", String(data));

            setPublicPlansState(String(data));
            setState("idle");
         } catch (err) {
            setState("error");
            console.error(err);
         }
      }

      // call the function
      getSettings();
   }, []);

   // SUBMIT CHANGES --> this should fire after clicking save
   async function handleChange() {
      setState("loading");

      try {
         const result = await fetch(
            `${SERVER_URL}/user/settings`,
            {
               method: "PATCH",
               credentials: "include",
               body: JSON.stringify({
                  settings: {
                     public_plans: publicPlansState,
                  },
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
         console.error(err);
      } finally {
         setState("idle");
      }
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
                  <RadioButton
                     onClick={() => {
                        setPublicPlansState((e) => {
                           if (e === "true") {
                              return "false";
                           } else if (e === "false") {
                              return "true";
                           } else {
                              return e;
                           }
                        });
                        setState("changed");
                     }}
                     value={
                        publicPlansState === "error"
                           ? "disabled"
                           : publicPlansState
                     }
                  />
               </div>
            </div>
         </div>
         {state === "changed" && (
            <button
               disabled={state === "loading"}
               onClick={() => {
                  setState("loading");
                  handleChange();
               }}>
               {state === "changed" ? "save" : "updating"}
            </button>
         )}
      </div>
   );
}

export default Settings;
