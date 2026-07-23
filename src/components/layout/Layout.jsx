import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ClickSpark from "../gsap/ClickSpark";
// import CustomCursor from "../gsap/CustomCursor";
export default function Layout() {
  return (
    <div className="min-h-screen bg-brand-dark grid-bg">
      {/* <CustomCursor /> */}
      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <Navbar />
        <main className="pt-20">
          <Outlet />
        </main>
        <Footer />
      </ClickSpark>
    </div>
  );
}
