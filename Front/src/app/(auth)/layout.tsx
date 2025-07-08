import AuthNav from "./AuthNav";
import "./auth.css";

const authLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/*<AuthNav />*/}
      {children}
    </div>
  );
};

export default authLayout;
