import React from "react";
import { IoPersonSharp } from "react-icons/io5";
import styles from "./Picture.module.css"
function Picture({ size = "2em" }) {
   return (
      <div className={styles.wrapper}>
         <IoPersonSharp size={size} />
      </div>
   );
}

export default Picture;
