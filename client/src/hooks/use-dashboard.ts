import { useDashboardContext } from "@/contexts/dashboard-context";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export function useDashboard() {
    const { state, dispatch } = useDashboardContext();
    
    const startDashboardMutation = useMutation({
        mutationFn: async () => {
            const questionsCompleted = await apiRequest("GET", "/api/quiz/dashboard");
            
            if (!questionsCompleted.ok) {
                const errorData = await questionsCompleted.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(JSON.stringify({ 
                    status: questionsCompleted.status, 
                    message: errorData.message || 'Erro no servidor' 
                }));
            }
            
            const questionsData = await questionsCompleted.json();
            return questionsData;
        },
        onSuccess: (data) => {
            dispatch({
                type: 'START_DASHBOARD',
                payload: data
            });
        },
        onError: (error: Error) => {
            try {
                const errorInfo = JSON.parse(error.message);
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        status: errorInfo.status,
                        message: errorInfo.message
                    }
                });
            } catch {
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        status: 500,
                        message: error.message || 'Erro desconhecido'
                    }
                });
            }
        }
    });

    const startDashboard = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const result = await startDashboardMutation.mutateAsync();

        return result;
    }

    const resetDashboard = () => {
        dispatch({ type: 'RESET_DASHBOARD' });
    };

    return {
        ...state,
        resetDashboard,
        startDashboard,
        isLoading: state.isLoading
    }
}