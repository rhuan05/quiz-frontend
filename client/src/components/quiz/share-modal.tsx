
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Share, Twitter, Linkedin, Copy, X } from "lucide-react";

interface ShareModalProps {
  score: number;
  performanceLevel: string;
  onClose: () => void;
}

export default function ShareModal({ score, performanceLevel, onClose }: ShareModalProps) {
  const { toast } = useToast();


  const shareText = `🎯 Consegui ${score}% no Quiz de JavaScript! Nível ${performanceLevel}. Teste seus conhecimentos também:`;
  const shareUrl = window.location.origin;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Compartilhar Resultado</h3>
          <p className="text-gray-600 mb-8">Mostre seu desempenho para seus amigos!</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-900">🎯 Consegui {score}% no Quiz de JavaScript!</p>
            <p className="text-sm text-gray-600 mt-1">Nível {performanceLevel} • Teste seus conhecimentos também!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              onClick={handleTwitterShare}
              className="flex items-center justify-center space-x-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Twitter className="h-4 w-4" />
              <span>Twitter</span>
            </Button>
            
            <Button 
              onClick={handleLinkedInShare}
              className="flex items-center justify-center space-x-2 bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleCopyLink}
            variant="outline"
            className="w-full mb-4"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
