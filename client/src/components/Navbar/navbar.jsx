import React from "react";
import HamMenu from "../HamMenu";
import { UserContext } from "../../context/UserProvider";
function Navbar({}) {
  const { isAuthenticated } = React.useContext(UserContext);
  return isAuthenticated && (
    <div>
      <nav>
        <div>logo</div>
        <HamMenu>==</HamMenu>
      </nav>
    </div>
  );
}

export default Navbar;
