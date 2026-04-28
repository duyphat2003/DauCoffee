import type { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";


type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-fill container py-4">
        {children}
      </main>

      <Footer />
    </div>
  );
}