import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';
import LoadingOverlay from '@/components/layout/loading-overlay';
import { useRanking } from '@/hooks/use-ranking';

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

  const getUserInitials = (username: string) => {
    if (!username) return '??';
    return username
      .slice(0, 2)
      .toUpperCase();
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Ranking dos Quizzes</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja os melhores jogadores e sua posição no ranking global
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total de Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Melhor Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.length > 0 ? Math.max(...users.map((u) => u.totalScore)) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum jogador no ranking ainda
                </h3>
                <p className="text-gray-500">
                  Seja o primeiro a completar um quiz e aparecer no ranking!
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card
                key={user.id}
                className={`transition-all duration-300 hover:shadow-md ${
                  user.position && user.position <= 3 ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getPositionIcon(user.position || 0)}
                      </div>

                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={getPositionBadgeColor(user.position || 0)}>
                          <span className="text-white font-bold">
                            {getUserInitials(user.username)}
                          </span>
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.username}
                          </h3>
                          <Badge className={`${getLevelBadgeColor(Math.floor(user.totalScore / 100) + 1)} text-white`}>
                            Nível {Math.floor(user.totalScore / 100) + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {user.totalScore}
                          </div>
                          <div className="text-gray-600">Pontos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <Button
            onClick={() => refetch()}
            className="bg-primary text-white hover:bg-blue-600 inline-flex items-center"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Atualizar Ranking
          </Button>
        </div>
      </div>
    </div>
  );
}