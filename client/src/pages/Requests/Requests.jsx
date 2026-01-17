import React from "react";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";
import PIP from "../../components/PIP";
import ReqCard from "../../components/ReqCard";
import UserCard from "../../components/UserCard";
import styles from "./Requests.module.css";
import { useNavigate } from "react-router-dom";

function Requests() {
   const [reqs, setReqs] = React.useState([]);
   const [state, setState] = React.useState("idle");
   const navigate = useNavigate();

   // GET ALL PENDING REQUESTS
   React.useEffect(() => {
      async function getRequests() {
         try {
            const result = await fetch(
               `${SERVER_URL}/friend/pending`,
               {
                  method: "GET",
                  credentials: "include",
                  headers: getAuthHeaders(),
               }
            );

            if (!result.ok) {
               throw new Error("failed");
            }

            const json = await result.json();
            const requests = json.data;
            setReqs(requests || []);
         } catch (err) {
            console.error(err);
         }
      }

      getRequests();
   }, []);

   async function respond(id, command) {
      try {
         setState("loading");
         const result = await fetch(
            `${SERVER_URL}/friend/request`,
            {
               method: "PATCH",
               credentials: "include",
               headers: getAuthHeaders(),
               body: JSON.stringify({
                  target_user_id: id,
                  command,
               }),
            }
         );

         if (!result.ok){
            throw new Error ("operation canceled.")
         }

         setReqs((prevReqs) => prevReqs.filter((req) => req.requester_id !== id));

      } catch (err) {
         console.error(err);
      } finally {
         setState("idle");
      }
   }

   return reqs.length === 0 ? (
      <PIP
         header=":P"
         footer="no requests yet."
      />
   ) : (
      <div className={styles.wrapper}>
         {reqs.map(
            ({
               requester_username: username,
               requester_name: name,
               requester_id: id,
            }) => {
               return (
                  <UserCard
                  key={id}
                     username={username}
                     name={name}
                     accFn={() => respond(id, "accepted")}
                     ignFn={() => respond(id, "rejected")}
                     onClick={() =>
                        navigate(
                           `/user/${id}/${username}/${name}`
                        )
                     }
                  />
               );
            }
         )}
      </div>
   );
}

export default Requests;
