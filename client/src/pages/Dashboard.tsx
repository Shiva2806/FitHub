import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import ImageUpload from "@/components/ImageUpload";
import BodyTypeResult from "@/components/BodyTypeResult";
import WorkoutRecommendations from "@/components/WorkoutRecommendations";
import { User, Activity, Target, Calendar } from "lucide-react";

const Dashboard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
    confidence: number;
  } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // --- THIS FUNCTION IS NOW CORRECTED ---
  const getInitials = (user: any): string => {
    if (!user) return "U";
    // First, try to get initials from the full name if it exists
    if (user?.fullName) {
      const nameParts = user.fullName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.fullName.slice(0, 2).toUpperCase();
    }
    // Fallback to email
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // --- THIS FUNCTION IS NOW CORRECTED ---
  const getDisplayName = (user: any): string => {
    // This now looks for user.fullName, which matches your backend
    if (user?.fullName) {
      return user.fullName;
    }
    // This is the fallback if the name isn't found
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    const bodyTypes: Array<'Ectomorph' | 'Mesomorph' | 'Endomorph'> = ['Ectomorph', 'Mesomorph', 'Endomorph'];
    const randomBodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
    const randomConfidence = Math.floor(Math.random() * 20) + 80;
    setResult({
      bodyType: randomBodyType,
      confidence: randomConfidence
    });
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <AvatarFallback className="text-lg font-semibold bg-transparent">
                    {/* --- UPDATED THIS LINE --- */}
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Welcome back, {getDisplayName(user)}!
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Ready to discover your body type and optimize your workouts?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Analyses</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1</div>
              <p className="text-xs text-gray-400">Body type scans completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Workout Plans</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-gray-400">Personalized plans generated</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Days Active</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1</div>
              <p className="text-xs text-gray-400">Since joining FitnessAI</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Body Type Analysis
              </CardTitle>
              <CardDescription className="text-gray-400">
                Upload a photo to get your personalized body type classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload 
                onImageUpload={handleImageUpload} 
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {result && (
            <BodyTypeResult 
              bodyType={result.bodyType}
              confidence={result.confidence}
              onGetPlan={handleGetPlan}
            />
          )}

          <WorkoutRecommendations selectedBodyType={result?.bodyType} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
