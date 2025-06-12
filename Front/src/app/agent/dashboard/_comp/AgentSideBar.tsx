import { motion } from "framer-motion";
import { useContext } from "react";
import { Context } from "../../../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

const AgentSideBar = ({ cb, ypr }: { cb: () => void; ypr: () => void }) => {
  const { setAgent, setUser } = useContext(Context);
  const navigate = useRouter();

  const openProfile = () => {
    cb();
    ypr();
  };

  return (
    <div className="popcon-con">
      <div className="back" onClick={cb}></div>
      <motion.div
        className="con w-10/12 h-full absolute top-0"
        initial={{ x: -250 }}
        animate={{ x: -50 }}
        exit={{ x: -250 }}
        style={{ maxWidth: 250, backgroundColor: "#fff" }}
      >
        <div>
          <button
            onClick={openProfile}
            className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg text-left text-black cursor-pointer"
          >
            <User size={18} className="text-blue-600" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => {
              setUser(null);
              setAgent(null);
              localStorage.removeItem("tok");
              navigate.push("/login");
            }}
            className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-red-600 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentSideBar;
