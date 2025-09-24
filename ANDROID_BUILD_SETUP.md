# 📱 Configuração do Build Android - Ionic + Capacitor

Este projeto usa **Ionic + Capacitor** para gerar APKs Android via GitHub Actions.

## 🔧 Secrets Necessários no GitHub

Acesse **Settings > Secrets and variables > Actions** no seu repositório e configure:

### 📋 Obrigatórios para Build

```
VITE_FIREBASE_API_KEY=sua-api-key-do-firebase
VITE_FIREBASE_APP_ID=seu-app-id-do-firebase  
VITE_FIREBASE_PROJECT_ID=seu-project-id-do-firebase
```

**Como obter os valores do Firebase:**
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **⚙️ Project Settings**
4. Na aba **General**, role até **Your apps**
5. Clique no ícone da web `</>`
6. Copie os valores de `apiKey`, `appId` e `projectId`

### 🔐 Opcionais para APK Assinado

Para builds de produção assinados (recomendado para distribuição):

```
KEYSTORE=base64-do-seu-keystore-file
KEYSTORE_PASSWORD=senha-do-keystore
KEY_ALIAS=alias-da-chave
KEY_PASSWORD=senha-da-chave
```

**Como gerar keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Converter para base64 (para GitHub secret)
base64 -i my-release-key.keystore | pbcopy  # macOS
base64 -i my-release-key.keystore           # Linux
```

## 🚀 Como Usar

### Build Automático
- **Push para `main`**: Build de debug automático
- **Pull Request**: Build de debug para revisão

### Build Manual
1. Vá para **Actions** > **Build Android APK**
2. Clique **Run workflow**
3. Selecione a branch
4. APK ficará disponível nos **Artifacts**

## 📦 Outputs dos Builds

### Debug APK (sempre gerado)
- **Arquivo**: `debug-apk/app-debug.apk`
- **Assinatura**: Debug (apenas para teste)
- **Tamanho**: ~50-80MB

### Release APK (apenas branch main com secrets configurados)
- **Arquivo**: `release-apk/app-release.apk` 
- **Assinatura**: Produção
- **Otimizado**: ProGuard + minificação
- **Tamanho**: ~20-40MB

## 🔍 Troubleshooting

### ❌ Build falhou: "Firebase Error (auth/invalid-api-key)"
**Solução**: Configure os secrets do Firebase corretamente

### ❌ Build falhou: "Java compilation error"
**Solução**: Workflow já usa Java 21 (requerido pelo Capacitor 7+)

### ❌ Build falhou: "Keystore não encontrado"
**Solução**: Secrets de keystore são opcionais - build de debug continuará

### ❌ APK não instalando no Android
**Solução**: 
- Debug APK: Habilite "Fontes desconhecidas" nas configurações
- Release APK: Assine com keystore válido

## ⚡ Build Local (para teste)

```bash
# 1. Build da aplicação web
npm run build

# 2. Sync do Capacitor  
npx cap sync android

# 3. Build Android
cd android
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK (requer keystore)
```

## 📱 Instalação no Dispositivo

### Via USB (Android Studio)
```bash
npx cap run android --target=device
```

### Via APK Download
1. Download do APK dos **Artifacts**
2. Transfira para o dispositivo Android
3. Instale via gerenciador de arquivos
4. Habilite "Fontes desconhecidas" se necessário

## 🔄 Atualizações Automáticas

O workflow **Dependabot** mantém as dependências atualizadas automaticamente, incluindo:
- Capacitor plugins
- Android Gradle Plugin  
- Firebase SDK
- Ionic framework

---

**💡 Dica**: Para distribuição em produção, sempre use APKs assinados com keystore próprio!