import React from "react";

function MealCard({ name, list, fnEdit, fnRemove }) {
  return (
    <div>
      <h4>{name}</h4>
      {fnEdit && (
        <button
          type="button"
          onClick={() => fnEdit()}
        >
          edit
        </button>
      )}
      {fnRemove && (
        <button
          type="button"
          onClick={() => fnRemove()}
        >
          remove
        </button>
      )}
      {list && (
        <p>
          {list.slice(0, 3).map((item) => (
            <span key={item.id}>{item.name}, </span>
          ))}
          {list.length > 3 && "..."}
        </p>
      )}
    </div>
  );
}

export default MealCard;
