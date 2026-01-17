import React from "react";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";
import PIP from "../../components/PIP";
import ReqCard from "../../components/ReqCard";
import styles from "./Requests.module.css";

function Requests() {
   const [reqs, setReqs] = React.useState([]);

   // GET ALL PENDING REQUESTS
   React.useEffect(() => {
      async function getRequests() {
         try {
            const result = fetch(``, {
               method: "GET",
               credentials: "include",
               headers: getAuthHeaders,
            });

            if (!result.ok) {
               throw new Error("failed");
            }

            const json = (await result).json();
            const requests = json.requests;
            setReqs(requests);
         } catch (err) {
            console.error(err);
         }
      }
   }, []);

   return reqs.length === 0 ? (
      <PIP
         header=":P"
         footer="no requests yet."
      />
   ) : (
      <div className={styles.wrapper}>
         {reqs.map((i) => {
            <ReqCard />;
         })}
      </div>
   );
}

export default Requests;
