import AuthNav from "./AuthNav";
import "./auth.css";

const authLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ height: "100%" }}>
      {/*<AuthNav />*/}
      {children}
    </div>
  );
};

export default authLayout;
