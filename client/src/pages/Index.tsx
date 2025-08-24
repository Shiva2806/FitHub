import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FinalCTA from "@/components/FinalCTA";
import ImageUpload from "@/components/ImageUpload";
import BodyTypeResult from "@/components/BodyTypeResult";
import WorkoutRecommendations from "@/components/WorkoutRecommendations";
import DietForm from "@/components/DietForm";
import DietPlan from "@/components/DietPlan";
import Footer from "@/components/Footer";
import { DietPlanResponse } from "@/types/diet";
import WorkoutTrainer from "@/components/WorkoutTrainer"; // Make sure WorkoutTrainer is imported

type AIModel = 'body-type' | 'diet-plan' | 'workout-trainer';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
    confidence: number;
  } | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlanResponse | null>(null);
  const [dietLoading, setDietLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const modelParam = searchParams.get('model') as AIModel;
    if (modelParam === 'body-type' || modelParam === 'diet-plan') {
      setSelectedModel(modelParam);
    }
  }, [searchParams]);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    const bodyTypes: Array<'Ectomorph' | 'Mesomorph' | 'Endomorph'> = ['Ectomorph', 'Mesomorph', 'Endomorph'];
    const randomBodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
    const randomConfidence = Math.floor(Math.random() * 20) + 80;
    setResult({ bodyType: randomBodyType, confidence: randomConfidence });
    setIsProcessing(false);
    toast({
      title: "Analysis Complete!",
      description: `Your body type has been identified as ${randomBodyType} with ${randomConfidence}% confidence.`,
    });
  };

  const handleGetPlan = () => {
    toast({
      title: "Coming Soon!",
      description: "Detailed workout plans will be available in the next update.",
    });
  };

  const handleDietPlanGenerated = (plan: DietPlanResponse) => {
    setDietPlan(plan);
  };

  const handleNewDietPlan = () => {
    setDietPlan(null);
  };

  const handleStartWorkout = () => {
    setSelectedModel('workout-trainer');
  };

  const handleExploreModels = () => {
    navigate('/ai-models');
  };

  const handleBeginTraining = () => {
    navigate('/ai-models');
  };
  
  const handleBackToHome = () => {
    setSelectedModel(null);
  };

  // --- THIS IS THE NEW PART FOR THE WORKOUT TRAINER VIEW ---
  if (selectedModel === 'workout-trainer') {
    return <WorkoutTrainer onBackToHome={handleBackToHome} />;
  }
  
  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <HeroSection 
          onStartWorkout={handleStartWorkout}
          onExploreModels={handleExploreModels}
        />
        <FeaturesSection />
        <FinalCTA onBeginTraining={handleBeginTraining} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              {selectedModel === 'body-type' ? 'Body Type Analysis' : 'Diet Plan Generator'}
            </h2>
            <button
              onClick={() => setSelectedModel(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>

          {selectedModel === 'body-type' && (
            <>
              <ImageUpload 
                onImageUpload={handleImageUpload} 
                isProcessing={isProcessing}
              />
              {result && (
                <BodyTypeResult 
                  bodyType={result.bodyType}
                  confidence={result.confidence}
                  onGetPlan={handleGetPlan}
                />
              )}
              <WorkoutRecommendations selectedBodyType={result?.bodyType} />
            </>
          )}

          {selectedModel === 'diet-plan' && !dietPlan && (
            <DietForm 
              onPlanGenerated={handleDietPlanGenerated}
              loading={dietLoading}
              setLoading={setDietLoading}
            />
          )}

          {selectedModel === 'diet-plan' && dietPlan && (
            <DietPlan 
              plan={dietPlan}
              onNewPlan={handleNewDietPlan}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;