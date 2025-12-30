import React from "react";
import { SERVER_URL } from "../../config/api.js";
import WeekTable from "../../components/WeekTable";
import PIP from "../../components/PIP";
import { useNavigate } from "react-router-dom";

function Plans() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState([]);
  const navigate = useNavigate();

  // GET ALL PLANS
  async function getAllPlans() {
    setLoading(true);
    try {
      const result = await fetch(`${SERVER_URL}/plans`, {
        method: "GET",
        credentials: "include",
      });

      if (!result.ok) {
        throw new Error("failed fetching data");
      }

      const json = await result.json();
      const raw = json.data;
      setData(raw);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getAllPlans();
  }, []);

  // DELETE PLAN WITH OPTIMISTIC RENDERING
  async function handleDeletePlan(planId) {
    // Backup current data for rollback
    const previousData = [...data];

    // Optimistic update: remove plan from list immediately
    setData((prev) => prev.filter((plan) => plan.plan_id !== planId));

    // Make API call
    try {
      const result = await fetch(`${SERVER_URL}/plans`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!result.ok) {
        throw new Error("Failed to delete plan");
      }
    } catch (err) {
      console.error(err);
      // Rollback: restore the previous data
      setData(previousData);
      window.alert("Failed to delete plan. Please try again.");
    }
  }

  return loading ? (
    <PIP
      header="..."
      footer="loading..."
    />
  ) : (
    <div>
      {data.length > 0 ? (
        <div>
          <button onClick={() => navigate("/newplan")}>new plan</button>
          {data.map(({ plan_name, plan_id, week_table }) => {
            return (
              <WeekTable
                tableName={plan_name}
                key={plan_id}
                planId={plan_id}
                mainPlan={week_table}
                edit={false}
                onDelete={handleDeletePlan}
              />
            );
          })}
        </div>
      ) : (
        <PIP
          header=":("
          footer="you don't have any plans"
        >
          <button
            onClick={() => {
              navigate("/newplan");
            }}
          >
            make a new one
          </button>
        </PIP>
      )}
    </div>
  );
}

export default Plans;
