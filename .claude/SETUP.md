# Guia de Configuração Rápida - Dashboard Eter

## ⚡ Setup em 5 Minutos

### 1️⃣ Configurar Supabase (2 minutos)

1. **Criar Projeto:**
   - Aceda a https://supabase.com
   - Clique em "New Project"
   - Escolha nome e password

2. **Copiar Credenciais:**
   - Na página do projeto, clique em "Settings" → "API"
   - Copie:
     - **Project URL** (parecido com: https://xxxxx.supabase.co)
     - **anon/public key** (começa com eyJ...)

3. **Configurar .env.local:**
   ```bash
   # Cole as credenciais no ficheiro .env.local
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Executar SQL Migration:**
   - No Supabase, vá a "SQL Editor"
   - Abra o ficheiro `supabase/migrations/001_initial_schema.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique "Run" (pode demorar 10-15 segundos)
   - ✅ Verá mensagem "Success. No rows returned"

5. **Configurar Auth URLs:**
   - Vá a "Authentication" → "URL Configuration"
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/dashboard`
   - Clique "Save"

### 2️⃣ Configurar Google Maps (2 minutos)

1. **Criar Projeto Google Cloud:**
   - Aceda a https://console.cloud.google.com/
   - Clique "Select a project" → "New Project"
   - Dê um nome ao projeto

2. **Ativar APIs:**
   - No menu lateral, procure "APIs & Services" → "Library"
   - Procure e ative estas 3 APIs:
     - ✅ Maps JavaScript API
     - ✅ Directions API
     - ✅ Geocoding API

3. **Criar API Key:**
   - Vá a "Credentials" → "Create Credentials" → "API Key"
   - Copie a API key gerada

4. **Adicionar ao .env.local:**
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIza...
   ```

### 3️⃣ Iniciar Aplicação (1 minuto)

```bash
# Instalar dependências (apenas primeira vez)
npm install

# Iniciar servidor
npm run dev
```

Abra: **http://localhost:3000**

### 4️⃣ Criar Conta

1. Clique no botão **"Dashboard"** no navbar
2. Ou aceda diretamente a: http://localhost:3000/register
3. Crie conta com email e password
4. Será redirecionado para o dashboard automaticamente

---

## ✅ Checklist de Configuração

- [ ] Supabase projeto criado
- [ ] Credenciais copiadas para .env.local
- [ ] Migration SQL executada no Supabase
- [ ] Auth URLs configuradas
- [ ] Google Cloud projeto criado
- [ ] 3 APIs do Maps ativadas
- [ ] Google Maps API key adicionada ao .env.local
- [ ] `npm install` executado
- [ ] `npm run dev` a correr
- [ ] Aplicação aberta em localhost:3000
- [ ] Conta de utilizador criada

---

## 🐛 Troubleshooting Rápido

### Erro: "Missing Supabase environment variables"
- ✅ Verifique se o ficheiro `.env.local` existe
- ✅ Confirme que as variáveis começam com `VITE_`
- ✅ Reinicie o servidor (`npm run dev`)

### Erro ao fazer login: "Invalid credentials"
- ✅ Confirme que executou a migration SQL
- ✅ Verifique se criou a conta com email/password válidos
- ✅ Tente criar nova conta em /register

### Mapa não aparece
- ✅ Verifique se a Google Maps API key está no .env.local
- ✅ Confirme que ativou as 3 APIs necessárias
- ✅ Tente gerar nova API key se necessário

### Erro ao fazer upload no CMS
- ✅ Confirme que o storage bucket 'media' foi criado na migration
- ✅ No Supabase, vá a "Storage" e verifique se existe bucket "media"
- ✅ Se não existir, execute novamente a migration SQL

---

## 📞 Suporte

Se encontrar algum problema:

1. Verifique a consola do browser (F12) para erros JavaScript
2. Consulte o ficheiro **CLAUDE.md** para documentação detalhada
3. Verifique o terminal onde corre `npm run dev` para erros do servidor

---

**Tempo total de setup:** ≈ 5-7 minutos
**Documentação completa:** Ver CLAUDE.md e README.md
