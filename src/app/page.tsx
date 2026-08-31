import { About } from "@/components/about";
import { Background } from "@/components/background";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="home-doc min-h-screen min-w-0 bg-surface1 text-text1 overflow-x-clip">
      <Header />
      <Hero />
      <About />
      <Experience />
      <Background />
      <Contact />
      <Footer />
    </div>
  );
}
