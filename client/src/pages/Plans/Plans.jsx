import React from "react";
import { SERVER_URL } from "../../config/api.js";
import WeekTable from "../../components/WeekTable";

function Plans() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState([]);

  //get all plans
  React.useEffect(() => {
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

    getAllPlans();
  }, []);

  return loading ? (
    <p>loading</p>
  ) : (
    <div>
      {data.map(({ plan_name, plan_id, week_table }) => {
        return (
          <WeekTable
            tableName={plan_name}
            key={plan_id}
            mainPlan={week_table}
            edit={false}
          />
        );
      })}
    </div>
  );
}

export default Plans;
