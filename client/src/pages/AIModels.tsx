import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkoutTrainer from "@/components/WorkoutTrainer";
import { Camera, Utensils, Dumbbell } from "lucide-react";

const AIModels = () => {
  const navigate = useNavigate();
  const [showWorkoutTrainer, setShowWorkoutTrainer] = useState(false);

  const models = [
    {
      id: "body-type",
      icon: <Camera className="w-16 h-16 text-purple-400" />,
      title: "AI Body Type Analyzer",
      description: "Advanced computer vision technology to classify your body type",
      features: [
        "Instant photo analysis",
        "80% accuracy rate", 
        "Ectomorph/Mesomorph/Endomorph classification",
        "Personalized workout recommendations",
        "Real-time results"
      ],
      buttonText: "Body Type Analysis",
      available: true,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "diet-plan",
      icon: <Utensils className="w-16 h-16 text-blue-400" />,
      title: "AI Diet Planner", 
      description: "Intelligent nutrition planning based on your goals and preferences",
      features: [
        "Custom meal planning",
        "BMI calculation & tracking",
        "Dietary preference matching",
        "Calorie optimization",
        "Progress monitoring"
      ],
      buttonText: "Generate Diet Plan",
      available: true,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "workout-trainer",
      icon: <Dumbbell className="w-16 h-16 text-green-400" />,
      title: "AI Workout Trainer",
      description: "Personalized training programs with real-time form correction",
      features: [
        "Real-time pose detection",
        "Form correction feedback",
        "Adaptive workout plans",
        "Progress tracking",
        "Voice coaching"
      ],
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AI Model
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select the AI model that best fits your fitness goals and start your personalized journey today.
            </p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {models.map((model) => (
              <div 
                key={model.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-full border border-gray-600">
                    {model.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  {model.title}
                </h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  {model.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {model.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={() => handleModelSelect(model.id)}
                  disabled={!model.available}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                    model.available 
                      ? `bg-gradient-to-r ${model.gradient} hover:shadow-lg` 
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
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