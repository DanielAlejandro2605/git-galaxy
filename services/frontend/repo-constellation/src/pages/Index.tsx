import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GalaxyVisualization from "@/components/GalaxyVisualization";
import RepositoryForm from "@/components/RepositoryForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GalaxyVisualization />
        <RepositoryForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
