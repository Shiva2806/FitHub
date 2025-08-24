import aiTrainingImage from '@/assets/AiTraining.png'; // 1. Import your image

interface FinalCTAProps {
  onBeginTraining: () => void;
}

const FinalCTA = ({ onBeginTraining }: FinalCTAProps) => {
  return (
    // 2. Add relative positioning, background styles, and the image
    <section 
      className="relative py-32 bg-cover bg-center"
      style={{ backgroundImage: `url(${aiTrainingImage})` }}
    >
      {/* 3. Add a dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70" />

      {/* 4. Add relative positioning to the content to lift it above the overlay */}
      <div className="relative container mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-lg">
          Ready to Experience
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Fitness?
          </span>
        </h2>
        
        <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto drop-shadow-md">
          Join thousands of users who have transformed their fitness journey with our AI-powered platform.
        </p>

        <button
          onClick={onBeginTraining}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold py-6 px-12 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          Begin AI Training
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
