import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Target, Zap } from "lucide-react";

interface BodyTypeResultProps {
  bodyType: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  confidence: number;
  onGetPlan: () => void;
}

const BodyTypeResult = ({ bodyType, confidence, onGetPlan }: BodyTypeResultProps) => {
  const getBodyTypeInfo = (type: string) => {
    switch (type) {
      case 'Ectomorph':
        return {
          description: 'Naturally curvy with a slower metabolism',
          traits: ['Lean build', 'Fast metabolism', 'Difficulty gaining weight'],
          color: 'from-accent to-accent/70',
          icon: Zap
        };
      case 'Mesomorph':
        return {
          description: 'Naturally muscular with balanced metabolism',
          traits: ['Athletic build', 'Balanced metabolism', 'Gains muscle easily'],
          color: 'from-primary to-primary-glow',
          icon: Target
        };
      case 'Endomorph':
        return {
          description: 'Naturally skinny with fast metabolism',
          traits: ['Rounded build', 'Slower metabolism', 'Gains weight easily'],
          color: 'from-secondary to-secondary/70',
          icon: User
        };
      default:
        return {
          description: '',
          traits: [],
          color: 'from-primary to-primary-glow',
          icon: User
        };
    }
  };

  const info = getBodyTypeInfo(bodyType);
  const IconComponent = info.icon;

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">
          Your Body Type Result
        </h2>

        <div className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl hover:border-purple-500/50 transition-all duration-500">
          <div className="text-center space-y-6">
            {/* Icon and Body Type */}
            <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center shadow-medium`}>
              <IconComponent className="h-10 w-10 text-white" />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white mb-2">
                You are a {bodyType}
              </h3>
              <p className="text-lg text-gray-300">
                {info.description}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Confidence Score</span>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {confidence}% Match
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {/* Traits */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3">Key Characteristics</h4>
              <ul className="space-y-2">
                {info.traits.map((trait, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                    {trait}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <button 
              onClick={onGetPlan}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
            >
              Get My Personalized Workout Plan
              <Target className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodyTypeResult;