import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, TrendingUp, Users, Star, User } from 'lucide-react';
import LoadingOverlay from '@/components/layout/loading-overlay';
import { useRanking } from '@/hooks/use-ranking';
import { useState } from 'react';

export default function RankingPage() {
  const { users, isLoading, error, refetch } = useRanking();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getPositionBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const UserAvatar = ({ user, position }: { user: any, position: number }) => {
    const [imageError, setImageError] = useState(false);
    
    if (!user.avatar || imageError) {
      return (
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${getPositionBadgeColor(position)} flex items-center justify-center`}>
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      );
    }
    
    return (
      <img
        src={user.avatar}
        alt={user.displayName || user.username || 'Usuário'}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
        onError={() => setImageError(true)}
      />
    );
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return 'bg-purple-500';
    if (level >= 7) return 'bg-red-500';
    if (level >= 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar ranking</h2>
            <p className="text-gray-600 mb-4">{error || 'Erro desconhecido'}</p>
            <Button
              onClick={() => refetch()}
              className="bg-primary text-white hover:bg-blue-600"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">🏆 Ranking dos Quizzes</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Veja os melhores jogadores e sua posição no ranking global
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="rounded-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Total de Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Melhor Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {users.length > 0 ? Math.max(...users.map((u) => u.totalScore)) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {users.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="text-center py-8 sm:py-12">
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                  Nenhum jogador no ranking ainda
                </h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  Seja o primeiro a completar um quiz e aparecer no ranking!
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card
                key={user.id}
                className={`transition-all duration-300 hover:shadow-lg rounded-xl ${
                  user.position && user.position <= 3 ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Layout mobile: stack vertical */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        {getPositionIcon(user.position || 0)}
                      </div>

                      <div className="flex-shrink-0">
                        <UserAvatar user={user} position={user.position || 0} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {user.displayName || user.username}
                          </h3>
                          <Badge className={`${getLevelBadgeColor(Math.floor(user.totalScore / 100) + 1)} text-white text-xs sm:text-sm flex-shrink-0 w-fit rounded-full px-2 py-1`}>
                            Nível {Math.floor(user.totalScore / 100) + 1}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Posição #{user.position}
                        </div>
                      </div>
                    </div>

                    <div className="text-center sm:text-right flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {user.totalScore}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Pontos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div className="text-center mt-6 sm:mt-8">
          <Button
            onClick={() => refetch()}
            className="bg-primary text-white hover:bg-blue-600 inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Atualizar Ranking
          </Button>
        </div>
      </div>
    </div>
  );
}