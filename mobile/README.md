# Sistema de Segurança Escolar - Mobile

Aplicativo React Native para o Sistema de Segurança Escolar, uma solução completa para gestão de segurança em ambientes educacionais.

## 🏫 Sobre o Projeto

Este aplicativo mobile foi desenvolvido para substituir o sistema Python/Kivy original, mantendo todas as funcionalidades e adicionando melhorias modernas usando React Native + TypeScript + Firebase.

## ✨ Funcionalidades

### 👥 Gestão de Usuários
- **Login/Logout** com Firebase Authentication
- **Cadastro de novos usuários** com diferentes perfis
- **Três tipos de usuário**: Aluno, Funcionário, Direção
- **Sistema de permissões** baseado em roles

### 📝 Sistema de Denúncias
- Reportar incidentes de forma segura
- Opção de denúncia anônima
- Categorização por tipo (bullying, violência, infraestrutura, etc.)
- Acompanhamento de status das denúncias

### 🚨 Central de Emergência
- Botão de pânico para situações críticas
- Alertas de emergência em tempo real
- Notificações push para toda a comunidade escolar
- Procedimentos de evacuação integrados

### 👥 Gestão de Visitantes
- Check-in/check-out de visitantes
- Registro com foto e dados pessoais
- Controle de acesso por funcionários
- Histórico de visitas

### 📚 Campanhas Educativas
- Conteúdo educativo sobre segurança
- Campanhas de prevenção ao bullying
- Educação digital e no trânsito
- Material segmentado por público-alvo

### 📋 Outros Módulos
- **Diário de Ocorrências**: Registro de incidentes diários
- **Checklist de Segurança**: Verificações periódicas
- **Calendário de Simulados**: Exercícios de evacuação
- **Avisos Urgentes**: Comunicação oficial
- **Contatos Úteis**: Lista de emergência
- **Mapa da Escola**: Áreas de risco identificadas
- **Painel de Vigilância**: Relatórios e estatísticas

## 🛠 Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript** para tipagem estática
- **Firebase** (Auth, Firestore, Cloud Messaging)
- **Expo Router** para navegação
- **React Query** para cache e sincronização
- **Zustand** para gerenciamento de estado
- **AsyncStorage** para dados offline

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta no Firebase

### Configuração do Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Configure Authentication (Email/Password)
3. Configure Firestore Database
4. Configure Cloud Messaging
5. Copie as credenciais para as variáveis de ambiente

### Instalação
```bash
cd mobile
npm install
```

### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
# ... outras configurações
```

### Executar o Projeto
```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📱 Build e Deploy

### Preview Build
```bash
npm run preview
```

### Produção
```bash
npm run build:android
npm run build:ios
```

## 🔐 Segurança

### Regras do Firestore
As regras de segurança do Firestore estão configuradas para:
- Permitir acesso apenas a usuários autenticados e ativos
- Controlar permissões baseadas em roles
- Proteger dados sensíveis
- Validar operações CRUD

### Permissões por Role

**Aluno**:
- Criar denúncias
- Ver avisos
- Usar botão de emergência
- Visualizar campanhas e contatos

**Funcionário** (+ todas do Aluno):
- Gerenciar visitantes
- Registrar ocorrências
- Atualizar checklist
- Ver relatórios básicos

**Direção** (+ todas anteriores):
- Gerenciar usuários
- Criar avisos e campanhas
- Gerenciar alertas de emergência
- Acesso completo ao sistema

## 🧪 Testes

```bash
npm test
```

## 📦 CI/CD

O projeto inclui pipeline GitHub Actions para:
- Verificação de TypeScript
- Testes automatizados
- Build de preview em PRs
- Build de produção no main
- Deploy das regras do Firestore

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para uso educacional e segurança escolar.

## 📞 Suporte

Para suporte ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.