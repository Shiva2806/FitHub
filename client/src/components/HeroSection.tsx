import { ArrowDown, HeartPulse, Cpu } from "lucide-react";
import heroImage from '@/assets/hero-fitness.jpg'; // Make sure this path is correct

interface HeroSectionProps {
  onStartWorkout: () => void;
  onExploreModels: () => void;
}

const HeroSection = ({ onStartWorkout, onExploreModels }: HeroSectionProps) => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Semi-transparent Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-purple-900/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
          Transform Your
          <span className="block text-red-500">
            Fitness Journey
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
          Experience the future of fitness with AI-powered workout guidance, real-time pose 
          correction, and personalized training recommendations that adapt to your unique body and goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={onStartWorkout}
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30"
          >
            Start AI Workout
            <HeartPulse className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
          </button>
          <button
            onClick={onExploreModels}
            className="group flex items-center justify-center gap-3 bg-black/60 border-2 border-gray-400 text-white hover:bg-white hover:text-black font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
          >
            Explore AI Models
            <Cpu className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
        onClick={scrollToFeatures}
      >
        <ArrowDown className="h-6 w-6 text-white/70" />
      </div>
    </section>
  );
};

export default HeroSection;