import { AnimatePresence, motion } from "framer-motion";
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
      </motion.div>
    </div>
  );
};

export default PopEffect;
