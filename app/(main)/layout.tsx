import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      
      <Header />

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200">
          <Sidebar />
        </aside>

        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}