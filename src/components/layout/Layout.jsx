import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ClickSpark from "../gsap/ClickSpark";
import SEO from "../ui/SEO";
import { seoConfig } from "../../config/seo";
// import CustomCursor from "../gsap/CustomCursor";
export default function Layout() {
  return (
    <div className="min-h-screen bg-brand-dark grid-bg">
      <SEO
        title={seoConfig.siteName}
        description="ZAZA Store - MLBB Accounts Marketplace"
      />
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
