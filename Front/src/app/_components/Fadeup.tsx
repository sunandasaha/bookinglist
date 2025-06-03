import { motion, useInView } from "framer-motion";
import { JSX, useRef } from "react";

type props = {
  children: JSX.Element | string | JSX.Element[];
  del?: number;
};

const Fadeup = (props: props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-250px 0px" });

  return (
    <div className="fu" ref={ref}>
      {isInView && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 1.01 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 + (props.del || 0) * 0.2 }}
        >
          {props.children}
        </motion.div>
      )}
    </div>
  );
};

export default Fadeup;
