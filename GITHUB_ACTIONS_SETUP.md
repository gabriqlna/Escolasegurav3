# 🚀 Configuração do GitHub Actions - CI/CD

Este projeto está configurado com workflows automatizados do GitHub Actions para **Integração Contínua (CI)** e **Entrega Contínua (CD)** para ambas as aplicações: **Web** (React/Express) e **Mobile** (Expo React Native).

## 📋 O que foi Configurado

### 🔄 Workflows Criados

1. **`main.yml`** - CI/CD para Web App
   - ✅ Testes e verificações TypeScript
   - ✅ Build da aplicação
   - ✅ Scan de segurança
   - ✅ Deploy automático na branch `main`

2. **`mobile.yml`** - CI/CD para Mobile App
   - ✅ Testes Expo/React Native  
   - ✅ Builds EAS (Android/iOS)
   - ✅ Preview automático em PRs
   - ✅ Submit para App Stores (opcional)

3. **`pr-preview.yml`** - Preview de Pull Requests
   - ✅ Deploy de preview para web
   - ✅ QR codes para teste mobile
   - ✅ Lighthouse performance audit
   - ✅ Comentários automáticos em PRs

### 🔧 Configurações Adicionais

- **Dependabot** - Atualizações automáticas de dependências
- **Templates** - Templates para Issues e Pull Requests
- **Lighthouse CI** - Auditoria de performance automatizada

## 🛠️ Configuração Inicial

### 1. Secrets do GitHub

Acesse **Settings > Secrets and variables > Actions** no seu repositório GitHub e adicione:

#### 📱 Para Mobile App (Expo)
```
EXPO_TOKEN=sua-expo-token-aqui
```
- Crie em: https://expo.dev/settings/access-tokens
- Necessário para builds e deploys EAS

#### 🔒 Para Scans de Segurança (Opcional)
```
SNYK_TOKEN=sua-snyk-token-aqui
LHCI_GITHUB_APP_TOKEN=seu-lighthouse-token-aqui
```

#### 🚀 Para Deploy (Opcional)
Adicione os secrets necessários para sua plataforma de deploy:
- Replit Deploy Token
- Vercel Token
- Netlify Token
- Etc.

### 2. Configuração do Expo (Mobile)

No diretório `mobile/`, configure:

```bash
cd mobile
npx eas login
npx eas build:configure
```

Edite `mobile/eas.json` se necessário:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Atualize Configurações

Edite os seguintes arquivos com suas informações:

#### `.github/dependabot.yml`
```yaml
assignees:
  - "SEU-USERNAME-GITHUB"  # ← Altere aqui
```

#### `.github/workflows/pr-preview.yml`
```yaml
# Linha 97 e 134:
body: `🔗 [Preview URL](https://preview-${{ github.event.number }}.SUA-DOMAIN.com)`

# Linha 158:
body: `🔗 [Open in Expo](exp://exp.host/@SEU-EXPO-USERNAME/SEU-APP-NAME?release-channel=pr-${{ github.event.number }})`
```

## 🎯 Como Usar

### 📝 Para Web App

1. **Push para `main`**: Deploy automático
2. **Pull Request**: Preview automático + Lighthouse audit
3. **Commits**: Testes e builds automáticos

### 📱 Para Mobile App

1. **Push para `main`**: Build EAS automático
2. **Pull Request**: Preview com QR code
3. **Commit com `[submit]`**: Submit para App Stores

#### Exemplo de commit para submit:
```bash
git commit -m "feat: nova funcionalidade [submit]"
```

### 🔄 Workflows Automáticos

| Trigger | Web App | Mobile App | Ações |
|---------|---------|------------|--------|
| Push para `main` | ✅ Build + Deploy | ✅ Build EAS | Automático |
| Pull Request | ✅ Preview + Tests | ✅ Preview + QR | Automático |
| Push com `[submit]` | - | ✅ Submit Stores | Automático |

## 📊 Status dos Builds

Após configurar, você verá badges nos PRs e commits:

- ✅ **CI/CD - Web App** - Status do build web
- ✅ **CI/CD - Mobile App** - Status do build mobile  
- ✅ **PR Preview** - Status do preview

## 🐛 Troubleshooting

### Problema: Build falhando

1. Verifique os logs no tab **Actions** do GitHub
2. Confirme que todos os secrets estão configurados
3. Verifique se os comandos npm funcionam localmente

### Problema: Expo build falhando

1. Confirme que `EXPO_TOKEN` está configurado
2. Execute `eas login` localmente
3. Verifique se `eas.json` está correto

### Problema: Preview não funcionando

1. Verifique se a URL de preview está correta
2. Confirme que o deploy está configurado corretamente

## 🔧 Customização

### Adicionar Novos Steps

Edite os arquivos em `.github/workflows/` para adicionar:

- Testes específicos
- Deploy para outras plataformas
- Notificações Slack/Discord
- Mais verificações de qualidade

### Modificar Triggers

```yaml
on:
  push:
    branches: [main, develop, staging]  # Adicionar mais branches
    paths-ignore:
      - '**.md'  # Ignorar arquivos markdown
```

## 📱 Construção de APK Específica

### Dependências Pendentes
Antes de fazer o build, adicione as seguintes dependências ao `mobile/package.json`:

```bash
cd mobile
npm install react-native-chart-kit @react-native-community/datetimepicker@7.6.3 --legacy-peer-deps
npm run lint --fix
```

### Configuração do Firebase
Configure as variáveis de ambiente do Firebase no projeto Expo ou no `mobile/eas.json`:

**Opção 1: Via EAS Project (Recomendado)**
```bash
cd mobile
eas env:set EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
eas env:set EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
eas env:set EXPO_PUBLIC_FIREBASE_APP_ID=seu-app-id
eas env:set EXPO_PUBLIC_FIREBASE_SENDER_ID=seu-sender-id
```

**Opção 2: Via eas.json**
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "sua-api-key",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "seu-project-id",
        "EXPO_PUBLIC_FIREBASE_APP_ID": "seu-app-id",
        "EXPO_PUBLIC_FIREBASE_SENDER_ID": "seu-sender-id"
      }
    }
  }
}
```

### Comandos de Build Manual

```bash
# Preview APK (recomendado para teste)
cd mobile && eas build -p android --profile preview --wait

# Production AAB (para Google Play Store)
cd mobile && eas build -p android --profile production --wait

# iOS (se necessário)
cd mobile && eas build -p ios --profile production --wait
```

### Workflow GitHub Actions para APK

O arquivo `.github/workflows/mobile-apk.yml` já foi criado com as seguintes características:

- **Trigger**: Manual (workflow_dispatch) para evitar conflitos com mobile.yml existente
- **Perfis**: Permite escolher entre 'preview' (APK) e 'production' (AAB)
- **Download automático**: Baixa e disponibiliza o APK como artifact
- **Integração EAS**: Usa EAS Build cloud corretamente

Para usar:
1. Vá para Actions > Build Mobile APK
2. Clique em "Run workflow" 
3. Escolha o perfil desejado
4. Baixe o artifact gerado

## 🚀 Próximos Passos

1. ✅ Configure os secrets necessários (especialmente EXPO_TOKEN)
2. ✅ Instale as dependências pendentes no mobile
3. ✅ Configure as variáveis de ambiente do Firebase
4. ✅ Teste o build local primeiro com `eas build`
5. ✅ Crie o workflow para builds automáticos
6. ✅ Teste com um Pull Request
7. ✅ Monitore os builds e otimize conforme necessário

---

**💡 Dica**: Use os templates de Issue e PR criados para padronizar a colaboração da equipe!

## 🤝 Contribuindo

Com esta configuração, contribuir é simples:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Faça seus commits
4. Abra um Pull Request
5. Os workflows automáticos irão testar e criar previews
6. Após aprovação, merge para `main` fará deploy automático

**Happy coding! 🎉**