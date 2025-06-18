-- Verificar e criar a tabela se não existir
CREATE TABLE IF NOT EXISTS equipamentos_logistica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  frota_caminhao INTEGER NOT NULL,
  tanque_1 INTEGER NOT NULL,
  tanque_2 INTEGER NOT NULL,
  dolly INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_frota_caminhao ON equipamentos_logistica(frota_caminhao);

-- Habilitar RLS (Row Level Security) - não causa erro se já estiver habilitado
ALTER TABLE equipamentos_logistica ENABLE ROW LEVEL SECURITY;

-- Verificar se a política já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipamentos_logistica' 
    AND policyname = 'Enable all operations for equipamentos_logistica'
  ) THEN
    -- Criar política para permitir todas as operações
    EXECUTE 'CREATE POLICY "Enable all operations for equipamentos_logistica" ON equipamentos_logistica FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END
$$;
