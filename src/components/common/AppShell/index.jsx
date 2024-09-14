import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "@components/common/Navbar";
import Footer from "@components/common/Footer";

const AppShell = ({ children }) => {
  return (
    <Router>
      <div className="font-poppins">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </Router>
  );
};

export default AppShell;
