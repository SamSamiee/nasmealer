import React from "react";
import WeekTable from "../../components/WeekTable";
import PIP from "../../components/PIP";
import { SERVER_URL } from "../../config/api.js";
import { useNavigate } from "react-router-dom";

function NewPlan() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  // GET ALL PLANS
  async function getAllMeals() {
    setLoading(true);
    try {
      const result = await fetch(`${SERVER_URL}/meals`, {
        method: "GET",
        credentials: "include",
      });

      if (!result.ok) {
        throw new Error("failed fetching data");
      }

      const json = await result.json();
      const raw = json.data;
      console.log(raw);
      setData(raw);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getAllMeals();
  }, []);

  if (!data?.length > 0) {
    return (
      <PIP
        header=":P"
        footer="no meals yet"
      >
        <p>
          to make your plan start by{" "}
          <span>
            <button onClick={() => navigate("/newmeal")}>making a meal</button>
          </span>{" "}
          first
        </p>
      </PIP>
    );
  }

  return (
    <div>
      <WeekTable />
    </div>
  );
}

export default NewPlan;
