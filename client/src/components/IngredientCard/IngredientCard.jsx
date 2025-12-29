import React from 'react';

function IngredientCard({children, quantity, unit, onClick, tag}) {
  return (
    <div>
      <div>
        {children}
      </div>
      <div>
        {quantity} {unit}
      </div>
      <button onClick={onClick}>{tag}</button>
    </div>
  );
}

export default IngredientCard;
