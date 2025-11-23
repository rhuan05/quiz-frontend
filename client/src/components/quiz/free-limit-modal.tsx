import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star } from "lucide-react";
import { useLocation } from "wouter";

interface FreeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRanking?: number;
  userPoints?: number;
}

export function FreeLimitModal({ isOpen, onClose, userRanking, userPoints }: FreeLimitModalProps) {
  const [, setLocation] = useLocation();

  const handleGoToPremium = () => {
    onClose();
    setLocation('/premium');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Parabéns! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Você respondeu as suas <span className="font-bold text-primary">3 perguntas teste</span>
            {userRanking && userRanking > 0 ? (
              <span className="block mt-2">
                e está em <span className="font-bold text-green-600">{userRanking}º lugar</span> no ranking
              </span>
            ) : null}
            {userPoints !== undefined && userPoints >= 0 ? (
              <span className="block mt-1">
                com <span className="font-bold text-orange-600">{userPoints} pontos</span>!
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <div className="mb-4 flex items-center justify-center space-x-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-sm text-gray-600">
            Solicite seu usuário premium para continuar aprendendo e pontuando!
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col space-y-2">
          <Button 
            onClick={handleGoToPremium}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            Solicitar Usuário Premium
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Voltar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
