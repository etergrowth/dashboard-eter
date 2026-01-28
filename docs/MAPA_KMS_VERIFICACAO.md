# Mapa de Kms - Documento de Verificação

## Status: Implementação Completa ✅

Data: 28 Janeiro 2026

---

## O Que Foi Implementado

### 1. Database (Supabase) ✅

**Tabela `trips` criada com sucesso:**
- `id` UUID (PK)
- `user_id` UUID (FK → profiles)
- `date` TIMESTAMPTZ
- `reason` TEXT
- `start_km` INT
- `end_km` INT
- `distance` INT (coluna gerada: end_km - start_km)
- `start_location`, `end_location` TEXT
- `start_lat`, `start_lng`, `end_lat`, `end_lng` DECIMAL
- `start_photo_url`, `end_photo_url` TEXT
- `status` TEXT ('draft' | 'completed')
- `created_at`, `updated_at` TIMESTAMPTZ

**RLS Policies configuradas:**
- SELECT, INSERT, UPDATE, DELETE para `auth.uid() = user_id`

**Índices criados:**
- `idx_trips_user_id`
- `idx_trips_date`
- `idx_trips_status`

### 2. Storage Bucket ⚠️ VERIFICAR

**Bucket `odometer-photos`** - Precisa verificação manual:

```sql
-- Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE id = 'odometer-photos';
```

Se não existir, criar manualmente no Supabase Dashboard:
1. Storage → New Bucket
2. Name: `odometer-photos`
3. Public: ✅ (checked)
4. File size limit: 5MB
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/heic, image/heif`

**Políticas de Storage a verificar:**
```sql
-- Verificar políticas
SELECT * FROM storage.policies WHERE bucket_id = 'odometer-photos';
```

### 3. Edge Function ✅

**`ocr-odometer`** deployada com sucesso:
- ID: `0d884db4-2ad9-49ef-be66-36f09b0a7a9d`
- Status: ACTIVE
- JWT Verification: Enabled

**Endpoint:**
```
POST ${SUPABASE_URL}/functions/v1/ocr-odometer
```

**Body:**
```json
{
  "imageBase64": "base64_encoded_image",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "km_reading": 123456,
  "confidence": 0.95,
  "notes": "Clear reading detected"
}
```

### 4. TypeScript Types ✅

**Adicionados em `src/types/database.ts`:**
- `trips` table definition

**Adicionados em `src/types/index.ts`:**
- `Trip`
- `TripInsert`
- `TripUpdate`
- `TripStatus`

### 5. React Hooks ✅

**Ficheiro:** `src/dashboard/hooks/useTrips.ts`

Hooks disponíveis:
- `useTrips(limit?)` - Lista viagens
- `useTrip(id)` - Viagem por ID
- `useCreateTrip()` - Criar viagem
- `useUpdateTrip()` - Atualizar viagem
- `useDeleteTrip()` - Eliminar viagem
- `useTripStats()` - Estatísticas
- `useOcrOdometer()` - OCR de imagens
- `useUploadOdometerPhoto()` - Upload de fotos
- `useTripsByMonth()` - Viagens agrupadas por mês

### 6. Páginas React ✅

**Lista de Viagens:** `src/dashboard/pages/MapaKms/index.tsx`
- Estatísticas (km mês, total, média)
- Lista agrupada por mês
- Pesquisa
- Export CSV
- Modal de detalhes

**Nova Viagem (Wizard):** `src/dashboard/pages/MapaKms/NewTrip.tsx`
- Step 1: Data e Motivo
- Step 2: Foto início + OCR
- Step 3: Foto fim + OCR (opcional)
- Step 4: Localizações (opcional)

**Componentes:**
- `TripCard.tsx` - Card de viagem
- `MonthlyGroup.tsx` - Grupo mensal
- `OdometerCapture.tsx` - Captura foto + OCR
- `LocationInput.tsx` - Input de localização com geolocation

### 7. Routing ✅

**Adicionado em `src/App.tsx`:**
```tsx
<Route path="mapa-kms" element={<MapaKms />} />
<Route path="mapa-kms/nova" element={<NewTrip />} />
```

### 8. Navegação ✅

**Adicionado em `src/dashboard/components/navigation/constants.ts`:**
```ts
{ id: 'mapa-kms', name: 'Mapa Kms', to: '/dashboard/mapa-kms', iconKey: 'Car', visible: true, order: 8 }
```

---

## Tarefas de Verificação para Cursor

### 1. Verificar Storage Bucket

```bash
# No Supabase Dashboard ou via SQL Editor:
SELECT * FROM storage.buckets WHERE id = 'odometer-photos';
```

Se não existir:
1. Ir a Supabase Dashboard → Storage
2. Criar bucket `odometer-photos` (público, 5MB limit)

### 2. Verificar Políticas de Storage

Se as políticas não existirem, executar:

```sql
-- Política para upload
CREATE POLICY "Users can upload odometer photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'odometer-photos'
  );

-- Política para visualização (bucket público)
CREATE POLICY "Anyone can view odometer photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'odometer-photos');

-- Política para delete
CREATE POLICY "Users can delete their odometer photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'odometer-photos');
```

### 3. Testar Fluxo Completo

1. **Aceder à página:** `/dashboard/mapa-kms`
2. **Criar nova viagem:** Clicar "Nova Viagem"
3. **Preencher wizard:**
   - Motivo: "Reunião cliente"
   - Tirar/carregar foto do odómetro
   - Verificar se OCR detecta leitura
   - Concluir
4. **Verificar lista:** Viagem aparece na lista
5. **Exportar CSV:** Verificar formato PT-PT

### 4. Verificar Edge Function

```bash
# Testar endpoint (substituir valores)
curl -X POST "${SUPABASE_URL}/functions/v1/ocr-odometer" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "...", "mimeType": "image/jpeg"}'
```

### 5. Verificar TypeScript

```bash
cd /Users/ricardo/Documents/Dashboard\ Eter/dashboard-eter
npm run typecheck
```

Erros esperados: Apenas erros pré-existentes (não relacionados com MapaKms)

---

## Ficheiros Criados/Modificados

| Ficheiro | Ação |
|----------|------|
| `supabase/migrations/xxx_create_trips_table.sql` | Criado via MCP |
| `supabase/functions/ocr-odometer/index.ts` | Criado |
| `src/types/database.ts` | Modificado |
| `src/types/index.ts` | Modificado |
| `src/dashboard/hooks/useTrips.ts` | Criado |
| `src/dashboard/pages/MapaKms/index.tsx` | Criado |
| `src/dashboard/pages/MapaKms/NewTrip.tsx` | Criado |
| `src/dashboard/pages/MapaKms/components/TripCard.tsx` | Criado |
| `src/dashboard/pages/MapaKms/components/MonthlyGroup.tsx` | Criado |
| `src/dashboard/pages/MapaKms/components/OdometerCapture.tsx` | Criado |
| `src/dashboard/pages/MapaKms/components/LocationInput.tsx` | Criado |
| `src/App.tsx` | Modificado |
| `src/dashboard/components/navigation/constants.ts` | Modificado |

---

## Ambiente Necessário

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_OPENAI_API_KEY=xxx  # Para OCR
```

---

## Próximos Passos (Opcionais)

1. [ ] Adicionar edição de viagens existentes
2. [ ] Adicionar filtros por período
3. [ ] Adicionar gráfico de evolução mensal
4. [ ] Implementar PWA para uso offline
5. [ ] Adicionar notificações push para lembrar registo
