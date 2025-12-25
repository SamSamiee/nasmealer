import React from "react";

function HamMenu({ children }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div>
      <button onClick={() => setVisible((current) => !current)}>
        {children}
      </button>
      {visible && (
        <>
          <ul>
            <li>
              <a href="/">home</a>
            </li>
            <li>
              <a href="/plans">plans</a>
            </li>
            <li>
              <a href="/cart">cart</a>
            </li>
            <li>
              <a href="/meals">meals</a>
            </li>
          </ul>
          <button>sign out</button>
        </>
      )}
    </div>
  );
}

export default HamMenu;
