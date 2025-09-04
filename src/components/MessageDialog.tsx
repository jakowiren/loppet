import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { messagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: string;
  adTitle: string;
  sellerName: string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  onOpenChange,
  adId,
  adTitle,
  sellerName
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Meddelandet får inte vara tomt');
      return;
    }

    setIsLoading(true);
    try {
      await messagesApi.sendMessage(adId, message.trim());
      toast.success('Meddelandet har skickats!');
      setMessage('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.error || 'Kunde inte skicka meddelandet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Kontakta säljare
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Annons:</p>
            <p className="font-medium text-gray-900">{adTitle}</p>
            <p className="text-sm text-gray-600 mt-1">Säljare: {sellerName}</p>
          </div>

          <div>
            <Label htmlFor="message" className="text-gray-700">
              Meddelande
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv ditt meddelande här..."
              rows={4}
              className="mt-1 bg-white border-gray-300"
              maxLength={1000}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/1000 tecken
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Skicka
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;