import React from "react";
import styles from "./Friends.module.css";
import PIP from "../../components/PIP";
import UserCard from "../../components/UserCard";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";
import { useNavigate } from "react-router-dom";

function Friends() {
   const [friends, setFriends] = React.useState([]);
   const [state, setState] = React.useState("idle");
   const navigate = useNavigate();
   React.useEffect(() => {
      async function searchUsers() {
         try {
            setState("loading");
            const result = await fetch(
               `${SERVER_URL}/friend`,
               {
                  method: "GET",
                  credentials: "include",
                  headers: getAuthHeaders(),
               }
            );

            const json = await result.json();
            const { friends } = json;
            setFriends(friends);
            setState("idle");
         } catch (err) {
            setState("error");
         }
      }
      searchUsers();
   }, []);

   if (state === "loading") {
      return (
         <PIP
            header="..."
            footer="loading"
         />
      );
   }

   if (state === "error") {
      return (
         <PIP
            header=":("
            footer="something went wrong"
         />
      );
   }

   if (friends?.length === 0) {
      return (
         <PIP
            header=":\"
            footer="you don't have any friends yet"
         />
      );
   }

   return (
      <div className={styles.wrapper}>
         {friends?.map((i) => (
            <UserCard
               key={i.id}
               name={i.name}
               username={i.username}
               onClick={() =>
                  navigate(
                     `/user/${i.id}/${i.username}/${i.name}`
                  )
               }
            />
         ))}
      </div>
   );
}

export default Friends;
