import React from 'react';

function IngredientCard({children, price, quantity, unit, onClick, tag}) {
  return (
    <div>
      <div>
        {children}
      </div>
      <div>
        {quantity} {unit}
      </div>
      <div>
        {quantity * price}
      </div>
      <button onClick={onClick}>{tag}</button>
    </div>
  );
}

export default IngredientCard;
