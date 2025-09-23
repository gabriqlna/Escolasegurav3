# Funcionalidades Pendentes - Sistema de Segurança Escolar

Este documento lista todas as funcionalidades que ainda precisam ser implementadas para completar a migração do sistema Python/Kivy para React Native.

## 🚧 Status Atual
- ✅ **Concluído**: Estrutura base, autenticação, dashboard, navegação
- 🔄 **Em desenvolvimento**: Nenhum módulo atualmente
- ❌ **Pendente**: 15+ módulos principais

---

## 📝 1. Sistema de Denúncias (Reports)
**Prioridade: ALTA**

### Funcionalidades necessárias:
- [ ] Formulário de criação de denúncia
  - [ ] Opção anônima vs identificada
  - [ ] Categorias: Bullying, Violência, Infraestrutura, Outros
  - [ ] Upload de fotos/evidências
  - [ ] Localização do incidente
  - [ ] Descrição detalhada
- [ ] Lista de denúncias
  - [ ] Filtros por status, categoria, data
  - [ ] Busca por palavras-chave
  - [ ] Paginação
- [ ] Visualização detalhada da denúncia
- [ ] Sistema de status (Pendente, Em análise, Resolvida, Arquivada)
- [ ] Comentários e atualizações por staff
- [ ] Notificações de mudança de status

### Permissões:
- **Alunos**: Criar denúncias, ver próprias denúncias
- **Funcionários**: Ver e atualizar denúncias
- **Direção**: Acesso completo, arquivar/resolver

---

## 🚨 2. Central de Emergência
**Prioridade: ALTA**

### Funcionalidades necessárias:
- [ ] Botão de pânico/emergência
  - [ ] Confirmação dupla para evitar acionamentos acidentais
  - [ ] Envio automático de localização
  - [ ] Captura de áudio ambiente (opcional)
- [ ] Alertas de emergência
  - [ ] Criação de alertas por administradores
  - [ ] Tipos: Evacuação, Lockdown, Emergência médica, Outros
  - [ ] Notificações push para toda escola
  - [ ] Som de alerta no app
- [ ] Central de controle (Direção)
  - [ ] Painel de emergências ativas
  - [ ] Histórico de emergências
  - [ ] Controle de protocolos
- [ ] Protocolos de emergência
  - [ ] Instruções passo-a-passo
  - [ ] Mapas de evacuação
  - [ ] Contatos de emergência

---

## 👥 3. Gestão de Visitantes
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Check-in de visitantes
  - [ ] Formulário com dados pessoais
  - [ ] Foto do visitante
  - [ ] Motivo da visita
  - [ ] Pessoa a ser visitada
  - [ ] Duração estimada
- [ ] Check-out de visitantes
  - [ ] Registro de saída
  - [ ] Tempo total de visita
- [ ] Lista de visitantes ativos
  - [ ] Status: Dentro da escola, Saiu
  - [ ] Filtros por data, status
- [ ] Histórico de visitas
- [ ] Relatórios de visitação
- [ ] Sistema de badges/identificação

### Permissões:
- **Funcionários**: Check-in/out, ver lista ativa
- **Direção**: Acesso completo + relatórios

---

## 📚 4. Campanhas Educativas
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Categorias de campanhas
  - [ ] Segurança Digital
  - [ ] Educação no Trânsito Escolar
  - [ ] Prevenção ao Bullying
  - [ ] Primeiros Socorros
  - [ ] Prevenção a Acidentes
- [ ] Conteúdo das campanhas
  - [ ] Textos informativos
  - [ ] Imagens e infográficos
  - [ ] Vídeos educativos
  - [ ] Quiz interativo
- [ ] Sistema de visualização
  - [ ] Feed de campanhas
  - [ ] Filtros por categoria
  - [ ] Marcação de lidas
- [ ] Gestão de conteúdo (Direção)
  - [ ] Criar/editar campanhas
  - [ ] Agendar publicações
  - [ ] Estatísticas de engajamento

---

## 📋 5. Diário de Ocorrências
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Registro de ocorrências
  - [ ] Tipo de ocorrência
  - [ ] Data/hora do incidente
  - [ ] Local
  - [ ] Pessoas envolvidas
  - [ ] Descrição detalhada
  - [ ] Medidas tomadas
- [ ] Lista de ocorrências
  - [ ] Filtros por data, tipo, status
  - [ ] Busca por palavras-chave
- [ ] Tipos de ocorrência
  - [ ] Disciplinar
  - [ ] Acidentes
  - [ ] Infraestrutura
  - [ ] Outros
- [ ] Acompanhamento
  - [ ] Status do caso
  - [ ] Ações de follow-up
- [ ] Relatórios mensais

### Permissões:
- **Funcionários**: Criar e ver ocorrências
- **Direção**: Acesso completo + relatórios

---

## ✅ 6. Sistema de Checklist de Segurança
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Templates de checklist
  - [ ] Checklist diário
  - [ ] Checklist semanal
  - [ ] Checklist mensal
  - [ ] Checklist de eventos especiais
- [ ] Itens do checklist
  - [ ] Verificação de portões/portas
  - [ ] Funcionamento de câmeras
  - [ ] Teste de alarmes
  - [ ] Verificação de extintores
  - [ ] Iluminação de emergência
  - [ ] Rotas de fuga desobstruídas
- [ ] Execução do checklist
  - [ ] Marcar itens como OK/Problema/N/A
  - [ ] Adicionar observações
  - [ ] Foto de evidência
  - [ ] Assinatura digital
- [ ] Relatórios de conformidade
- [ ] Alertas para itens não conformes

---

## 📅 7. Calendário de Simulados
**Prioridade: BAIXA**

### Funcionalidades necessárias:
- [ ] Agendamento de simulados
  - [ ] Tipo: Incêndio, Evacuação, Lockdown
  - [ ] Data e horário
  - [ ] Áreas envolvidas
  - [ ] Responsáveis
- [ ] Notificações de simulados
  - [ ] Lembretes antecipados
  - [ ] Instruções específicas
- [ ] Execução do simulado
  - [ ] Cronômetro de evacuação
  - [ ] Check de presença
  - [ ] Observações de performance
- [ ] Relatórios pós-simulado
  - [ ] Tempo de evacuação
  - [ ] Problemas identificados
  - [ ] Ações corretivas
- [ ] Histórico de simulados

---

## 📢 8. Sistema de Avisos Urgentes
**Prioridade: ALTA**

### Funcionalidades necessárias:
- [ ] Criação de avisos
  - [ ] Níveis de prioridade
  - [ ] Público-alvo (todos, alunos, funcionários)
  - [ ] Texto do aviso
  - [ ] Data de expiração
- [ ] Distribuição
  - [ ] Notificações push
  - [ ] Avisos in-app
  - [ ] Email (opcional)
- [ ] Gestão de avisos
  - [ ] Editar avisos ativos
  - [ ] Cancelar avisos
  - [ ] Estatísticas de visualização
- [ ] Histórico de avisos

### Permissões:
- **Direção**: Criar e gerenciar avisos
- **Todos**: Receber e visualizar

---

## 📞 9. Lista de Contatos Úteis
**Prioridade: BAIXA**

### Funcionalidades necessárias:
- [ ] Categorias de contatos
  - [ ] Emergência (190, 193, 192)
  - [ ] Escola (direção, secretaria, portaria)
  - [ ] Saúde (hospital, posto de saúde)
  - [ ] Segurança (guarda municipal, segurança privada)
- [ ] Funcionalidades de contato
  - [ ] Ligação direta do app
  - [ ] WhatsApp/SMS
  - [ ] Email
- [ ] Gestão de contatos
  - [ ] Adicionar/editar contatos
  - [ ] Ordenação por categoria
  - [ ] Favoritos

---

## 🗺️ 10. Plano de Evacuação
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Mapas da escola
  - [ ] Planta baixa por andar
  - [ ] Rotas de evacuação marcadas
  - [ ] Pontos de encontro
  - [ ] Localizações de equipamentos
- [ ] Instruções de evacuação
  - [ ] Procedimentos por área
  - [ ] Responsabilidades por função
  - [ ] Sequência de ações
- [ ] Modo emergência
  - [ ] Mapa destacado com rota atual
  - [ ] Navegação até ponto de encontro
  - [ ] Instruções contextuais

---

## 🗺️ 11. Mapa da Escola Interativo
**Prioridade: BAIXA**

### Funcionalidades necessárias:
- [ ] Mapa interativo
  - [ ] Zoom e navegação
  - [ ] Camadas (andares, setores)
- [ ] Pontos de interesse
  - [ ] Salas de aula
  - [ ] Banheiros
  - [ ] Refeitório
  - [ ] Biblioteca
  - [ ] Áreas de recreação
- [ ] Áreas de risco
  - [ ] Identificação visual
  - [ ] Alertas de segurança
  - [ ] Medidas preventivas
- [ ] Navegação interna
  - [ ] Rotas otimizadas
  - [ ] Estimativa de tempo

---

## 📊 12. Painel de Vigilância/Relatórios
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Dashboard de estatísticas
  - [ ] Denúncias por período
  - [ ] Tipos de incidentes mais comuns
  - [ ] Status de segurança geral
- [ ] Relatórios personalizados
  - [ ] Filtros por data, tipo, setor
  - [ ] Exportação em PDF/Excel
  - [ ] Gráficos e visualizações
- [ ] Indicadores de performance
  - [ ] Tempo médio de resolução
  - [ ] Taxa de recorrência
  - [ ] Satisfação dos usuários
- [ ] Alertas automáticos
  - [ ] Padrões anômalos
  - [ ] Metas não atingidas

### Permissões:
- **Funcionários**: Relatórios básicos
- **Direção**: Acesso completo

---

## 👤 13. Gestão de Usuários (Admin)
**Prioridade: BAIXA**

### Funcionalidades necessárias:
- [ ] Lista de usuários
  - [ ] Filtros por role, status
  - [ ] Busca por nome/email
- [ ] Gerenciamento de usuários
  - [ ] Alterar role/permissões
  - [ ] Ativar/desativar conta
  - [ ] Reset de senha
- [ ] Auditoria de acessos
  - [ ] Log de logins
  - [ ] Ações realizadas
  - [ ] Relatórios de uso

### Permissões:
- **Direção**: Acesso completo

---

## 🔔 14. Sistema de Notificações Push
**Prioridade: ALTA**

### Funcionalidades necessárias:
- [ ] Configuração FCM
  - [ ] Tokens de dispositivo
  - [ ] Sincronização automática
- [ ] Tipos de notificação
  - [ ] Emergências (alta prioridade)
  - [ ] Avisos importantes
  - [ ] Atualizações de denúncias
  - [ ] Lembretes de simulados
- [ ] Configurações do usuário
  - [ ] Ativar/desativar por tipo
  - [ ] Horário de funcionamento
  - [ ] Som personalizado
- [ ] Histórico de notificações

---

## 💾 15. Sistema Offline
**Prioridade: MÉDIA**

### Funcionalidades necessárias:
- [ ] Cache inteligente
  - [ ] Dados críticos offline
  - [ ] Sincronização automática
- [ ] Funcionalidades offline
  - [ ] Visualizar contatos
  - [ ] Mapas de evacuação
  - [ ] Instruções de emergência
  - [ ] Criar denúncias (sync posterior)
- [ ] Indicadores de status
  - [ ] Online/offline
  - [ ] Pendências de sync

---

## 🛡️ 16. Canal Anti-Bullying Especializado
**Prioridade: ALTA**

### Funcionalidades necessárias:
- [ ] Formulário especializado
  - [ ] Perguntas específicas sobre bullying
  - [ ] Escala de gravidade
  - [ ] Frequência dos episódios
  - [ ] Impacto emocional
- [ ] Fluxo diferenciado
  - [ ] Prioridade alta automática
  - [ ] Encaminhamento para psicólogo
  - [ ] Follow-up obrigatório
- [ ] Anonimato reforçado
  - [ ] Criptografia adicional
  - [ ] Proteção de identidade
- [ ] Recursos de apoio
  - [ ] Contatos de ajuda
  - [ ] Material educativo
  - [ ] Dicas de prevenção

---

## 🧪 17. Testes e Otimização
**Prioridade: BAIXA**

### Atividades necessárias:
- [ ] Testes unitários
  - [ ] Componentes React Native
  - [ ] Serviços de autenticação
  - [ ] Lógica de negócio
- [ ] Testes de integração
  - [ ] Firebase Auth
  - [ ] Firestore operations
  - [ ] Push notifications
- [ ] Testes e2e
  - [ ] Fluxos principais
  - [ ] Cenários de erro
- [ ] Otimizações de performance
  - [ ] Lazy loading
  - [ ] Otimização de imagens
  - [ ] Cache strategies
- [ ] Testes de usabilidade
  - [ ] Feedback de usuários
  - [ ] Métricas de uso
  - [ ] Ajustes de UX

---

## 📱 18. Funcionalidades Mobile Específicas
**Prioridade: BAIXA**

### Funcionalidades necessárias:
- [ ] Geolocalização
  - [ ] Localização automática em denúncias
  - [ ] Navegação até pontos de encontro
- [ ] Câmera integrada
  - [ ] Captura de evidências
  - [ ] Scan de QR codes (visitantes)
- [ ] Biometria
  - [ ] Login com digital/face
  - [ ] Confirmação de ações críticas
- [ ] Modo offline robusto
  - [ ] Dados essenciais sempre disponíveis
  - [ ] Sincronização inteligente

---

## 🚀 Cronograma Sugerido

### Fase 1 (Crítica) - 2-3 semanas
1. Sistema de Denúncias
2. Central de Emergência 
3. Avisos Urgentes
4. Canal Anti-Bullying
5. Notificações Push

### Fase 2 (Importante) - 2-3 semanas
1. Gestão de Visitantes
2. Diário de Ocorrências
3. Checklist de Segurança
4. Campanhas Educativas
5. Plano de Evacuação

### Fase 3 (Complementar) - 1-2 semanas
1. Calendário de Simulados
2. Contatos Úteis
3. Mapa da Escola
4. Painel de Relatórios
5. Sistema Offline

### Fase 4 (Polimento) - 1 semana
1. Gestão de Usuários
2. Testes e Otimização
3. Funcionalidades Mobile
4. Ajustes finais

---

## 📊 Estimativa Total
- **Tempo**: 6-9 semanas de desenvolvimento
- **Complexidade**: Alta (integração com Firebase, notificações, offline)
- **Prioridade**: Sistema crítico para segurança escolar

## 🎯 Próximos Passos Imediatos
1. Implementar Sistema de Denúncias (módulo mais usado)
2. Configurar Notificações Push (base para emergências)
3. Desenvolver Central de Emergência (funcionalidade crítica)