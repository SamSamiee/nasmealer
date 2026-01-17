import React from "react";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";

function Requests() {
   // GET ALL PENDING REQUESTS
   React.useEffect(() => {
      async function getRequests() {
         try {
            const result = fetch(``, {
               method: "GET",
               credentials: "include",
               headers: getAuthHeaders,
            });

            if(!result.ok){
              throw new Error("failed")
            }

            const json = (await result).json()
            const requests = json.requests

         } catch (err) {
            console.error(err);
         }
      }
   }, []);

   return <div></div>;
}

export default Requests;
