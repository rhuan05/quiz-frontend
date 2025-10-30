import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { AlertCircle, Zap, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../../../config.json';

interface DailyLimitInfo {
  questionsAnsweredToday: number;
  dailyLimit: number;
  canAnswerMore: boolean;
  planType: 'free' | 'premium';
}

interface DailyLimitBannerProps {
  onLimitReached?: () => void;
}

export function DailyLimitBanner({ onLimitReached }: DailyLimitBannerProps) {
  const { token, isAuthenticated } = useAuth();
  const [limitInfo, setLimitInfo] = useState<DailyLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDailyLimit();
    }
  }, [isAuthenticated, token]);

  const fetchDailyLimit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/daily-limit`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLimitInfo(data);
        
        // Call onLimitReached if user can't answer more questions
        if (!data.canAnswerMore && onLimitReached) {
          onLimitReached();
        }
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show banner if not authenticated or loading
  if (!isAuthenticated || isLoading || !limitInfo) {
    return null;
  }

  const progressPercentage = Math.min((limitInfo.questionsAnsweredToday / limitInfo.dailyLimit) * 100, 100);
  const questionsRemaining = Math.max(limitInfo.dailyLimit - limitInfo.questionsAnsweredToday, 0);

  // Don't show banner for premium users unless they've reached their limit
  if (limitInfo.planType === 'premium' && limitInfo.canAnswerMore) {
    return null;
  }

  return (
    <Card className={`mb-6 ${!limitInfo.canAnswerMore ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${!limitInfo.canAnswerMore ? 'bg-red-100' : 'bg-blue-100'}`}>
              {limitInfo.planType === 'premium' ? (
                <Crown className={`h-5 w-5 ${!limitInfo.canAnswerMore ? 'text-red-600' : 'text-blue-600'}`} />
              ) : !limitInfo.canAnswerMore ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Zap className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-semibold ${!limitInfo.canAnswerMore ? 'text-red-800' : 'text-blue-800'}`}>
                  {limitInfo.planType === 'free' ? 'Plano Gratuito' : 'Plano Premium'}
                </h3>
                {limitInfo.planType === 'free' && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    FREE
                  </span>
                )}
              </div>
              
              {!limitInfo.canAnswerMore ? (
                <div>
                  <p className="text-sm text-red-700 mb-2">
                    Você atingiu seu limite diário de {limitInfo.dailyLimit} perguntas.
                  </p>
                  <p className="text-xs text-red-600">
                    Volte amanhã ou considere fazer upgrade para o plano premium!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-blue-700 mb-2">
                    Você respondeu <strong>{limitInfo.questionsAnsweredToday}</strong> de <strong>{limitInfo.dailyLimit}</strong> perguntas hoje
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>Progresso diário</span>
                      <span>{questionsRemaining} restantes</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2"
                      style={{
                        background: 'rgb(219, 234, 254)' // blue-100
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {limitInfo.planType === 'free' && (
            <div className="ml-4 flex-shrink-0">
              <Button 
                size="sm" 
                variant={!limitInfo.canAnswerMore ? "default" : "outline"}
                className={!limitInfo.canAnswerMore ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
              >
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            </div>
          )}
        </div>

        {limitInfo.planType === 'free' && limitInfo.canAnswerMore && questionsRemaining <= 3 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              ⚠️ Poucas perguntas restantes hoje. Considere fazer upgrade para perguntas ilimitadas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to use daily limit info in other components
export function useDailyLimit() {
  const { token, isAuthenticated } = useAuth();
  const [limitInfo, setLimitInfo] = useState<DailyLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDailyLimit = async () => {
    if (!isAuthenticated || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/daily-limit`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLimitInfo(data);
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyLimit();
  }, [isAuthenticated, token]);

  return {
    limitInfo,
    isLoading,
    refetch: fetchDailyLimit
  };
}
