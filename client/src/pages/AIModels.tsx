import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkoutTrainer from "@/components/WorkoutTrainer";

// --- Update your image filenames here ---
import bodyTypeImage from '../assets/body-classifier.jpg';
import dietRecommenderImage from '../assets/diet-recommender.jpg';
import workoutTrainerImage from '../assets/workout-trainer.jpg';

const AIModels = () => {
  const navigate = useNavigate();
  const [showWorkoutTrainer, setShowWorkoutTrainer] = useState(false);

  // --- UPDATED models array with your requested colors ---
  const models = [
    {
      id: "body-type",
      imageSrc: bodyTypeImage,
      title: "AI Body Type Analyzer",
      titleColor: "text-red-500",      // Red title
      iconColor: "text-red-500",       // Red icons
      description: "Advanced computer vision technology to classify your body type",
      features: [ "Instant photo analysis", "80% accuracy rate", "Ectomorph/Mesomorph/Endomorph classification", "Personalized workout recommendations", "Real-time results" ],
      buttonText: "Body Type Analysis",
      available: true,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "diet-plan",
      imageSrc: dietRecommenderImage,
      title: "AI Diet Planner",
      titleColor: "text-green-400",    // Green title
      iconColor: "text-green-400",     // Green icons
      description: "Intelligent nutrition planning based on your goals and preferences",
      features: [ "Custom meal planning", "BMI calculation & tracking", "Dietary preference matching", "Calorie optimization", "Progress monitoring" ],
      buttonText: "Generate Diet Plan",
      available: true,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "workout-trainer",
      imageSrc: workoutTrainerImage,
      title: "AI Workout Trainer",
      titleColor: "text-blue-500",     // Royal Blue title
      iconColor: "text-blue-500",      // Royal Blue icons
      description: "Personalized training programs with real-time form correction",
      features: [ "Real-time pose detection", "Form correction feedback", "Adaptive workout plans", "Progress tracking", "Voice coaching" ],
      buttonText: "Start Workout Session",
      available: true,
      gradient: "from-green-500 to-teal-500"
    }
  ];

  const handleModelSelect = (modelId: string) => {
    if (modelId === "body-type" || modelId === "diet-plan") {
      navigate(`/?model=${modelId}`);
    } else if (modelId === "workout-trainer") {
      setShowWorkoutTrainer(true);
    }
  };

  const handleBackToModels = () => {
    setShowWorkoutTrainer(false);
  };

  if (showWorkoutTrainer) {
    return <WorkoutTrainer onBackToHome={handleBackToModels} />;
  }

  const FeatureIcon = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${color} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            {/* --- THIS IS THE UPDATED LINE --- */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Choose Your AI Model
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Select the AI model that best fits your fitness goals and start your personalized journey today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {models.map((model) => (
              <div key={model.id} className="bg-[#12121c] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <div>
                  <img src={model.imageSrc} alt={model.title} className="rounded-lg mb-6 w-full h-52 object-cover" />
                  <h3 className={`text-2xl font-bold mb-3 ${model.titleColor}`}>
                    {model.title}
                  </h3>
                  <p className="text-gray-400 mb-6 min-h-[72px]">{model.description}</p>
                  <ul className="space-y-3 text-gray-300">
                    {model.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FeatureIcon color={model.iconColor} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => handleModelSelect(model.id)} className={`mt-8 w-full font-semibold py-3 px-6 rounded-lg text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${model.gradient} hover:shadow-lg`}>
                  {model.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIModels;
