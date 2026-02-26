import { useState, useEffect, useRef } from 'react';
import { useGetRentalMessages, useSendRentalMessage } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { formatChatTimestamp } from '../../utils/rentals/rentalDateFormat';

interface RentalChatPanelProps {
  rentalId: bigint;
  variant?: 'default' | 'messaging';
}

export default function RentalChatPanel({ rentalId, variant = 'default' }: RentalChatPanelProps) {
  const { identity } = useInternetIdentity();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading, isError } = useGetRentalMessages(rentalId);
  const sendMessage = useSendRentalMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        rentalId,
        message: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (senderPrincipal: string) => {
    return identity?.getPrincipal().toString() === senderPrincipal;
  };

  const scrollHeight = variant === 'messaging' ? 'h-[450px]' : 'h-[400px]';

  return (
    <Card>
      {variant === 'default' && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={variant === 'default' ? 'space-y-4' : 'space-y-4 pt-6'}>
        <ScrollArea className={`${scrollHeight} pr-4`} ref={scrollRef}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-destructive">Failed to load messages. Please try again.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwn = isOwnMessage(msg.sender.toString());
                return (
                  <div
                    key={index}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.message}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatChatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[60px] resize-none"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessage.isPending}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
