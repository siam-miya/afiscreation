import Topbar from "@/components/Main/Topbar";
import Navbar from "@/components/Main/Navbar";
import Footer from "@/components/Main/Footer";
import MenuBar from "./../../components/Main/MenuBar";
import MultiChatFAB from "@/components/Main/MultiChatFAB";
import UserAuthGuard from "@/components/Main/UserAuthGuard";

export default function UserLayout({ children }) {
  return (
    <UserAuthGuard>
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <Navbar />
        <MenuBar />
        <main className="flex-grow">{children}</main>
        <MultiChatFAB />
        <Footer />
      </div>
    </UserAuthGuard>
  );
}