import { motion } from "framer-motion";
import { JSX } from "react";

type props = {
  children: JSX.Element | string | JSX.Element[];
  del?: number;
};

const InviewFade = (props: props) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 1.02 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: (props.del || 0) * 0.1 }}
      style={{ width: "100%", display: "grid", placeItems: "center" }}
    >
      {props.children}
    </motion.div>
  );
};

export default InviewFade;
