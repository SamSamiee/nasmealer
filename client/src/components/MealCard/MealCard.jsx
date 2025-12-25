import React from "react";

function MealCard({ title, price, list, fnEdit, fnRemove }) {

  return (
    <div>
      <h4>{title}</h4>
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
      <p>{price}</p>
      {list && (
        <p>
          {list.map((item) => (
            <span key={item}>{item}, </span>
          ))}
        </p>
      )}
    </div>
  );
}

export default MealCard;
