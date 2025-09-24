import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEmergencyAlertSchema } from '@shared/schema';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function EmergencyButton() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof insertEmergencyAlertSchema>>({
    resolver: zodResolver(insertEmergencyAlertSchema),
    defaultValues: {
      message: "",
      location: "",
    },
  });

  const handleEmergencyAlert = async (data: z.infer<typeof insertEmergencyAlertSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para ativar um alerta de emergência.",
        variant: "destructive",
      });
      return;
    }

    if (!hasPermission(['funcionario', 'direcao'])) {
      toast({
        title: "Acesso Negado",
        description: "Apenas funcionários e direção podem ativar alertas de emergência.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const alertData = {
        message: data.message,
        location: data.location || null,
        triggeredBy: user.firebaseUser.uid,
        triggeredByName: user.name || user.email || 'Usuário',
        isResolved: false,
        resolvedBy: null,
        resolvedByName: null,
        resolvedAt: null,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'emergencyAlerts'), alertData);

      toast({
        title: "🚨 ALERTA DE EMERGÊNCIA ATIVADO!",
        description: "O alerta foi transmitido para toda a escola. Authorities foram notificadas.",
        variant: "destructive",
      });

      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao ativar alerta de emergência.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Só mostra o botão para funcionarios e direção
  if (!hasPermission(['funcionario', 'direcao'])) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg"
          className="fixed top-4 right-4 z-50 animate-pulse shadow-lg hover:animate-none"
          data-testid="button-global-emergency"
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          🚨 EMERGÊNCIA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            🚨 ATIVAÇÃO DE EMERGÊNCIA
          </DialogTitle>
          <DialogDescription>
            Este alerta será enviado IMEDIATAMENTE para toda a escola.
            <br />
            <strong className="text-red-600">Use APENAS para situações reais de emergência.</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmergencyAlert)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-red-700 font-semibold">Descreva a Emergência *</FormLabel>
                  <FormControl>
                    <Textarea 
                      data-testid="input-global-emergency-message"
                      placeholder="Ex: Incêndio no laboratório, Pessoa ferida no pátio, Invasor na escola..."
                      className="border-red-200 focus:border-red-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-red-600">
                    Seja claro e específico sobre a natureza da emergência.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input 
                      data-testid="input-global-emergency-location"
                      placeholder="Ex: Bloco A - Sala 205, Pátio principal, Laboratório..."
                      className="border-red-200 focus:border-red-400"
                      {...field}
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormDescription>
                    Especifique onde está ocorrendo a emergência.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 font-semibold">
                ⚠️ CONFIRME: Esta é uma situação REAL de emergência?
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant="destructive"
                size="lg"
                className="flex-1"
                data-testid="button-confirm-global-emergency"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ativando..." : "🚨 ATIVAR ALERTA"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}