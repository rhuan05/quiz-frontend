import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config.json';

export interface RankingUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  totalScore: number;
  streak: number;
  totalSessions: number;
  bestScore: number;
  role: string;
  position: number;
}

export function useRanking() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/ranking`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }
      
      // Processar dados do backend e adicionar posição
      const usersWithPosition = data.map((user: any, index: number) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName,
        totalScore: user.totalScore || 0,
        streak: user.streak || 0,
        totalSessions: user.totalSessions || 0,
        bestScore: user.bestScore || 0,
        role: user.role,
        position: index + 1
      }));

      setUsers(usersWithPosition);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchRanking
  };
}