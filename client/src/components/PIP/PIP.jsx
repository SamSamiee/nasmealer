import React from "react";
import styles from "./PIP.module.css";

function PIP({ children, header, footer }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>{header}</div>
      <div className={styles.content}>
      <div className={styles.footer}>{footer}</div>
      {children}
      </div>
    </div>
  );
}

export default PIP;
