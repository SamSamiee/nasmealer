import React from "react";
import LiveSearch from "../../components/LiveSearch";
import PIP from "../../components/PIP";
import {
   SERVER_URL,
   getAuthHeaders,
} from "../../config/api.js";

function Search() {
   const [input, setInput] = React.useState("");
   const [list, setList] = React.useState([]);
   const [state, setState] = React.useState("idle");

   React.useEffect(() => {
      async function searchUsers() {
         try {
            setState("loading");
            if (!input) return;
            const result = await fetch(
               `${SERVER_URL}/friend/search?username=${input}`,
               {
                  method: "GET",
                  credentials: "include",
                  headers: getAuthHeaders(),
               }
            );

            const json = await result.json();
            const { users } = json;
            setList(users);
            setState("idle");
         } catch (err) {
            setState("error");
         }
      }
      searchUsers();
   }, [input]);

   if (state === "error") {
      return (
         <PIP
            header=":("
            footer="something went wrong"
         />
      );
   }

   return (
      <div>
         <LiveSearch
            input={input}
            setInput={setInput}
            list={list}
            state={state}
         />
      </div>
   );
}

export default Search;
