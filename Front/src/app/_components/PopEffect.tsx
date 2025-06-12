import { motion } from "framer-motion";
import { JSX } from "react";

const PopEffect = ({
  children,
  cb,
}: {
  children: JSX.Element | string | JSX.Element[];
  cb: () => void;
}) => {
  return (
    <div className="popcon-con">
      <div className="back" onClick={cb}></div>
      <motion.div
        className="con popcon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        {children}
        <p
          style={{
            position: "absolute",
            top: 7,
            right: 10,
            zIndex: 1,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={cb}
        >
          x
        </p>
      </motion.div>
    </div>
  );
};

export default PopEffect;
