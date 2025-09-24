import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmergencyAlertSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { AlertTriangle, Shield, CheckCircle, AlertCircle, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EmergencyAlert {
  id: string;
  message: string;
  location: string | null;
  triggeredBy: string;
  triggeredByName?: string;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedByName?: string;
  resolvedAt: Timestamp | null;
  timestamp: Timestamp;
}

// Hook para alertas ativos
function useActiveEmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const alertsQuery = query(
      collection(db, 'emergencyAlerts'),
      where('isResolved', '==', false),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyAlert[];
      
      setAlerts(alertsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Erro ao buscar alertas de emergência:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data: alerts, isLoading };
}

// Hook para criar alerta de emergência
function useCreateEmergencyAlert() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof insertEmergencyAlertSchema>) => {
      if (!user) throw new Error('Usuário não autenticado');

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
    },
    onSuccess: () => {
      toast({
        title: "🚨 Alerta de emergência enviado!",
        description: "O alerta foi transmitido para toda a escola. Authorities were notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar alerta de emergência.",
        variant: "destructive",
      });
    },
  });
}

// Hook para resolver alerta
function useResolveEmergencyAlert() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const alertRef = doc(db, 'emergencyAlerts', alertId);
      await updateDoc(alertRef, {
        isResolved: true,
        resolvedBy: user.firebaseUser.uid,
        resolvedByName: user.name || user.email || 'Usuário',
        resolvedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Alerta resolvido",
        description: "O alerta de emergência foi marcado como resolvido.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao resolver alerta.",
        variant: "destructive",
      });
    },
  });
}

export default function EmergencyPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof insertEmergencyAlertSchema>>({
    resolver: zodResolver(insertEmergencyAlertSchema),
    defaultValues: {
      message: "",
      location: "",
    },
  });

  const { data: activeAlerts = [], isLoading } = useActiveEmergencyAlerts();
  const createAlertMutation = useCreateEmergencyAlert();
  const resolveAlertMutation = useResolveEmergencyAlert();

  const onSubmit = (data: z.infer<typeof insertEmergencyAlertSchema>) => {
    createAlertMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🚨 Sistema de Emergência</h1>
        <p className="text-muted-foreground">
          Sistema de alertas e gerenciamento de emergências escolares.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={activeAlerts.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${activeAlerts.length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${activeAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.length > 0 ? 'Situações em andamento' : 'Nenhuma emergência ativa'}
            </p>
          </CardContent>
        </Card>

        <Card className={activeAlerts.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Shield className={`h-4 w-4 ${activeAlerts.length === 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${activeAlerts.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {activeAlerts.length === 0 ? "NORMAL" : "EMERGÊNCIA"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.length === 0 ? 'Sistema operando normalmente' : 'Emergência ativa - ação necessária'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos de Emergência</CardTitle>
            <Phone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Polícia:</span>
                <span className="font-mono font-bold">190</span>
              </div>
              <div className="flex justify-between">
                <span>SAMU:</span>
                <span className="font-mono font-bold">192</span>
              </div>
              <div className="flex justify-between">
                <span>Bombeiros:</span>
                <span className="font-mono font-bold">193</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
          <AlertTitle className="text-red-800">⚠️ ALERTAS DE EMERGÊNCIA ATIVOS</AlertTitle>
          <AlertDescription className="text-red-700">
            Existem {activeAlerts.length} alerta(s) de emergência ativo(s) que requerem atenção imediata.
            Siga os protocolos de segurança estabelecidos.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Alertas de Emergência</h2>
        {hasPermission(["funcionario", "direcao"]) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="lg"
                className="animate-pulse"
                data-testid="button-create-emergency"
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                🚨 BOTÃO DE EMERGÊNCIA
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  🚨 ATIVAR EMERGÊNCIA
                </DialogTitle>
                <DialogDescription>
                  Este alerta será enviado IMEDIATAMENTE para toda a escola. 
                  Use APENAS para situações reais de emergência.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-700 font-semibold">Descreva a Emergência *</FormLabel>
                        <FormControl>
                          <Textarea 
                            data-testid="input-emergency-message"
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
                            data-testid="input-emergency-location"
                            placeholder="Ex: Bloco A - Sala 205, Pátio principal, Laboratório de química..."
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
                      data-testid="button-submit-emergency"
                      disabled={createAlertMutation.isPending}
                    >
                      {createAlertMutation.isPending ? "Enviando..." : "🚨 ATIVAR ALERTA"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ✅ Nenhuma Emergência Ativa
              </h3>
              <p className="text-muted-foreground text-center">
                O sistema está funcionando normalmente. Não há alertas de emergência ativos no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          activeAlerts.map((alert: EmergencyAlert) => (
            <Card key={alert.id} className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                      <CardTitle className="text-red-700">🚨 ALERTA DE EMERGÊNCIA</CardTitle>
                      <Badge variant="destructive" className="animate-pulse" data-testid={`status-alert-${alert.id}`}>
                        ATIVO
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">
                      Ativado por <strong>{alert.triggeredByName}</strong> em{' '}
                      {format(alert.timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm")}
                      {alert.location && (
                        <>
                          <br />
                          📍 Local: <strong>{alert.location}</strong>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  {hasPermission(["funcionario", "direcao"]) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      data-testid={`button-resolve-${alert.id}`}
                      onClick={() => resolveAlertMutation.mutate(alert.id)}
                      disabled={resolveAlertMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      ✅ Resolver
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-3 rounded-md border border-red-200">
                  <p className="text-gray-800 font-medium text-lg">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Instruções de Emergência
          </CardTitle>
          <CardDescription>
            Procedimentos padronizados em caso de emergência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold mb-2 flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                🔥 Incêndio
              </h4>
              <ul className="text-sm space-y-1 bg-red-50 p-3 rounded-md">
                <li>• Ativar o alarme de incêndio imediatamente</li>
                <li>• Evacuar o prédio pela rota de fuga mais próxima</li>
                <li>• Dirigir-se ao ponto de encontro designado</li>
                <li>• Aguardar instruções do corpo de bombeiros</li>
                <li>• Não usar elevadores</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold mb-2 flex items-center text-blue-600">
                <Shield className="mr-2 h-4 w-4" />
                🔒 Invasão/Segurança
              </h4>
              <ul className="text-sm space-y-1 bg-blue-50 p-3 rounded-md">
                <li>• Trancar portas e janelas</li>
                <li>• Manter silêncio absoluto</li>
                <li>• Esconder-se longe de portas e janelas</li>
                <li>• Aguardar instruções da equipe de segurança</li>
                <li>• Não sair até receber autorização oficial</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-semibold text-yellow-800 mb-2">
              📞 Em caso de emergência, ligue:
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-2 rounded border">
                <div className="font-bold text-lg">190</div>
                <div className="text-sm text-gray-600">Polícia Militar</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-bold text-lg">192</div>
                <div className="text-sm text-gray-600">SAMU</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="font-bold text-lg">193</div>
                <div className="text-sm text-gray-600">Bombeiros</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}