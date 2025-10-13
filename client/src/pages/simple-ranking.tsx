import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config.json';

interface User {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  averageScore: number;
  totalQuizzes: number;
  bestStreak: number;
  level: number;
}

export default function SimpleRankingPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadRanking = async () => {
      try {
        console.log('Carregando ranking...');

        const response = await fetch(`${API_BASE_URL}/api/ranking`);
        console.log('Status da resposta:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dados recebidos:', data);
          setUsers(data);
        } else {
          setError(`Erro: ${response.status}`);
        }
      } catch (err) {
        console.error('Erro na requisição:', err);
        setError('Erro de rede');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🏆 Ranking</h1>
      
      <div className="space-y-4">
        {users.length === 0 ? (
          <p>Nenhum usuário encontrado</p>
        ) : (
          users.map((user, index) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">#{index + 1} {user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{user.totalScore} pts</div>
                  <div className="text-sm text-gray-600">{user.totalQuizzes} quizzes</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Recarregar
      </button>
    </div>
  );
}