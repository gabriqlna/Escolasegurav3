import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isAfter, isBefore, differenceInDays } from "date-fns";
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  Clock, 
  Eye, 
  EyeOff, 
  Filter,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  Megaphone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: string[];
  isActive: boolean;
  expiresAt?: Date;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt?: Date;
  readBy: string[];
}

const noticeSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  targetAudience: z.array(z.string()).min(1, "Selecione pelo menos um público-alvo"),
  expiresAt: z.string().optional(),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "low": return "Baixa";
    case "medium": return "Média";
    case "high": return "Alta";
    case "urgent": return "URGENTE";
    default: return "Desconhecida";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "low": return Info;
    case "medium": return Bell;
    case "high": return AlertCircle;
    case "urgent": return AlertTriangle;
    default: return Bell;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case USER_ROLES.ALUNO: return "Alunos";
    case USER_ROLES.FUNCIONARIO: return "Funcionários";
    case USER_ROLES.DIRECAO: return "Direção";
    default: return role;
  }
};

export default function NoticesPage() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");

  // Permissions
  const canCreateNotices = hasPermission([USER_ROLES.FUNCIONARIO, USER_ROLES.DIRECAO]);
  const canManageNotices = hasPermission([USER_ROLES.DIRECAO]);

  // Form setup
  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "medium",
      targetAudience: [],
      expiresAt: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    },
  });

  // Real-time notices with automatic updates
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Notice[];
      
      setNotices(noticesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error in notices real-time listener:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const refetch = () => {
    // Trigger manual refetch if needed
    setIsLoading(true);
  };

  // Real-time listener for new urgent notices
  useEffect(() => {
    if (!user) return;

    const urgentQuery = query(
      collection(db, "notices"),
      where("priority", "==", "urgent"),
      where("isActive", "==", true),
      where("targetAudience", "array-contains", user.role)
    );

    const unsubscribe = onSnapshot(urgentQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notice = { id: change.doc.id, ...change.doc.data() } as Notice;
          if (!notice.readBy.includes(user.id)) {
            toast({
              title: "🚨 AVISO URGENTE",
              description: notice.title,
              variant: "destructive",
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  // Create notice mutation
  const createNoticeMutation = useMutation({
    mutationFn: async (data: NoticeFormData) => {
      if (!user) throw new Error("User not authenticated");
      
      const noticeData = {
        ...data,
        targetAudience: data.targetAudience,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: true,
        createdBy: user.id,
        createdByName: user.name,
        readBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      return await addDoc(collection(db, "notices"), noticeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Aviso criado",
        description: "O aviso foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar aviso.",
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (noticeId: string) => {
      if (!user) return;
      const notice = notices.find(n => n.id === noticeId);
      if (notice && !notice.readBy.includes(user.id)) {
        const updatedReadBy = [...notice.readBy, user.id];
        await updateDoc(doc(db, "notices", noticeId), {
          readBy: updatedReadBy,
          updatedAt: serverTimestamp(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });

  // Update notice mutation
  const updateNoticeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NoticeFormData }) => {
      const updateData = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        updatedAt: serverTimestamp(),
      };
      return await updateDoc(doc(db, "notices", id), updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setEditingNotice(null);
      form.reset();
      toast({
        title: "Aviso atualizado",
        description: "O aviso foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar aviso.",
        variant: "destructive",
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDoc(doc(db, "notices", id), {
        isActive,
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast({
        title: "Aviso atualizado",
        description: "O status do aviso foi alterado.",
      });
    },
  });

  // Delete notice mutation
  const deleteNoticeMutation = useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, "notices", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast({
        title: "Aviso excluído",
        description: "O aviso foi excluído com sucesso.",
      });
    },
  });

  // Filter notices with expiration check
  const filteredNotices = notices.filter(notice => {
    // User role filtering
    if (!notice.targetAudience.includes(user?.role || "")) {
      return false;
    }

    // Check if notice is expired
    const isExpired = notice.expiresAt && isAfter(new Date(), notice.expiresAt);

    // Search filter
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Priority filter
    const matchesPriority = selectedPriority === "all" || notice.priority === selectedPriority;
    
    // Tab filter
    if (selectedTab === "urgent") {
      return notice.priority === "urgent" && notice.isActive && !isExpired && matchesSearch && matchesPriority;
    } else if (selectedTab === "unread") {
      return !notice.readBy.includes(user?.id || "") && notice.isActive && !isExpired && matchesSearch && matchesPriority;
    } else if (selectedTab === "active") {
      return notice.isActive && !isExpired && matchesSearch && matchesPriority;
    }
    
    return matchesSearch && matchesPriority;
  });

  // Count unread notices (excluding expired)
  const unreadCount = notices.filter(notice => {
    const isExpired = notice.expiresAt && isAfter(new Date(), notice.expiresAt);
    return notice.targetAudience.includes(user?.role || "") &&
           !notice.readBy.includes(user?.id || "") &&
           notice.isActive &&
           !isExpired;
  }).length;

  // Count urgent notices (excluding expired)
  const urgentCount = notices.filter(notice => {
    const isExpired = notice.expiresAt && isAfter(new Date(), notice.expiresAt);
    return notice.priority === "urgent" && 
           notice.isActive &&
           !isExpired &&
           notice.targetAudience.includes(user?.role || "");
  }).length;

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    markAsReadMutation.mutate(notice.id);
  };

  const onSubmit = (data: NoticeFormData) => {
    if (editingNotice) {
      updateNoticeMutation.mutate({ id: editingNotice.id, data });
    } else {
      createNoticeMutation.mutate(data);
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    form.reset({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      expiresAt: notice.expiresAt ? format(notice.expiresAt, "yyyy-MM-dd") : "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingNotice(null);
    form.reset({
      title: "",
      content: "",
      priority: "medium",
      targetAudience: [],
      expiresAt: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-notices-title">
            📢 Avisos Urgentes
          </h1>
          <p className="text-muted-foreground">
            Comunicados importantes e informativos da administração escolar
          </p>
        </div>

        {canCreateNotices && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-notice">
                <Plus className="h-4 w-4 mr-2" />
                Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingNotice ? "Editar Aviso" : "Criar Novo Aviso"}
                </DialogTitle>
                <DialogDescription>
                  {editingNotice 
                    ? "Edite as informações do aviso existente."
                    : "Crie um aviso importante para comunicar com a comunidade escolar."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Aviso</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Simulado de Evacuação Agendado" 
                            {...field}
                            data-testid="input-notice-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva os detalhes do aviso..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-notice-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-notice-priority">
                                <SelectValue placeholder="Selecione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">URGENTE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Expiração</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              data-testid="input-notice-expiry"
                            />
                          </FormControl>
                          <FormDescription>
                            Deixe vazio para não expirar
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={() => (
                      <FormItem>
                        <FormLabel>Público-Alvo</FormLabel>
                        <div className="space-y-2">
                          {[
                            { id: USER_ROLES.ALUNO, label: "Alunos" },
                            { id: USER_ROLES.FUNCIONARIO, label: "Funcionários" },
                            { id: USER_ROLES.DIRECAO, label: "Direção" },
                          ].map((role) => (
                            <FormField
                              key={role.id}
                              control={form.control}
                              name="targetAudience"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(role.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, role.id])
                                            : field.onChange(field.value?.filter((value) => value !== role.id))
                                        }}
                                        data-testid={`checkbox-audience-${role.id}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {role.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        if (editingNotice) {
                          handleCancelEdit();
                        }
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createNoticeMutation.isPending || updateNoticeMutation.isPending}
                      data-testid="button-submit-notice"
                    >
                      {editingNotice 
                        ? (updateNoticeMutation.isPending ? "Atualizando..." : "Atualizar Aviso")
                        : (createNoticeMutation.isPending ? "Criando..." : "Criar Aviso")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidos</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Requer sua atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">
              Prioridade máxima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notices.filter(n => {
                const isExpired = n.expiresAt && isAfter(new Date(), n.expiresAt);
                return n.isActive && !isExpired && n.targetAudience.includes(user?.role || "");
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em exibição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Megaphone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notices.filter(n => n.targetAudience.includes(user?.role || "")).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os avisos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar avisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-notices"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger data-testid="select-priority-filter">
                  <SelectValue placeholder="Filtrar por prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all-notices">
            Todos ({filteredNotices.length})
          </TabsTrigger>
          <TabsTrigger value="urgent" data-testid="tab-urgent-notices">
            Urgentes ({urgentCount})
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread-notices">
            Não Lidos ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active-notices">
            Ativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {/* Urgent notices alert */}
          {urgentCount > 0 && selectedTab !== "urgent" && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 dark:text-red-200">
                Avisos Urgentes Disponíveis
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                Existem {urgentCount} avisos urgentes que requerem sua atenção imediata.
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-red-700 dark:text-red-300 underline ml-1"
                  onClick={() => setSelectedTab("urgent")}
                >
                  Ver avisos urgentes →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Notices List */}
          <div className="space-y-4">
            {filteredNotices.map((notice) => {
              const PriorityIcon = getPriorityIcon(notice.priority);
              const isRead = notice.readBy.includes(user?.id || "");
              const isExpired = notice.expiresAt && isAfter(new Date(), notice.expiresAt);
              const daysUntilExpiry = notice.expiresAt ? differenceInDays(notice.expiresAt, new Date()) : null;

              return (
                <Card 
                  key={notice.id} 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/30' : ''
                  } ${
                    notice.priority === 'urgent' ? 'border-red-200 dark:border-red-800' : ''
                  } ${
                    isExpired ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleNoticeClick(notice)}
                  data-testid={`notice-card-${notice.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <PriorityIcon className={`h-4 w-4 ${
                            notice.priority === 'urgent' ? 'text-red-600' :
                            notice.priority === 'high' ? 'text-orange-600' :
                            notice.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <Badge className={getPriorityColor(notice.priority)}>
                            {getPriorityLabel(notice.priority)}
                          </Badge>
                          {!isRead && (
                            <Badge variant="secondary">Novo</Badge>
                          )}
                          {isExpired && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Expirado
                            </Badge>
                          )}
                        </div>
                        <CardTitle className={`text-lg ${!isRead ? 'font-bold' : 'font-semibold'}`}>
                          {notice.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(notice.createdAt, "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notice.targetAudience.map(role => getRoleLabel(role)).join(", ")}
                          </span>
                          {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {daysUntilExpiry === 0 ? "Expira hoje" : `${daysUntilExpiry} dias restantes`}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      
                      {canManageNotices && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNotice(notice);
                            }}
                            data-testid={`button-edit-${notice.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActiveMutation.mutate({
                                id: notice.id,
                                isActive: !notice.isActive
                              });
                            }}
                            data-testid={`button-toggle-${notice.id}`}
                          >
                            {notice.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Tem certeza que deseja excluir este aviso?")) {
                                deleteNoticeMutation.mutate(notice.id);
                              }
                            }}
                            data-testid={`button-delete-${notice.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {notice.createdByName && `Por ${notice.createdByName}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {notice.readBy.length} visualizações
                        </span>
                        {!isRead && (
                          <Button variant="ghost" className="p-0 h-auto text-xs">
                            Marcar como lido →
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredNotices.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedTab === "urgent" ? "Nenhum aviso urgente" :
                   selectedTab === "unread" ? "Todos os avisos foram lidos" :
                   searchTerm ? "Nenhum aviso encontrado" :
                   "Nenhum aviso disponível"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {selectedTab === "urgent" ? "Não há avisos urgentes no momento." :
                   selectedTab === "unread" ? "Parabéns! Você está em dia com todos os avisos." :
                   searchTerm ? "Tente ajustar os filtros ou usar termos de busca diferentes." :
                   "Avisos importantes aparecerão aqui quando forem publicados."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getPriorityColor(selectedNotice.priority)}>
                  {getPriorityLabel(selectedNotice.priority)}
                </Badge>
                <Badge variant={selectedNotice.isActive ? "default" : "secondary"}>
                  {selectedNotice.isActive ? "Ativo" : "Inativo"}
                </Badge>
                {selectedNotice.expiresAt && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Expira em {format(selectedNotice.expiresAt, "dd/MM/yyyy")}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl">{selectedNotice.title}</DialogTitle>
              <DialogDescription>
                Criado em {format(selectedNotice.createdAt, "dd/MM/yyyy 'às' HH:mm")}
                {selectedNotice.createdByName && ` por ${selectedNotice.createdByName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Direcionado para: {selectedNotice.targetAudience.map(role => getRoleLabel(role)).join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{selectedNotice.readBy.length} pessoas visualizaram este aviso</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedNotice(null)}
                  className="flex-1"
                  data-testid="button-close-notice-detail"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}