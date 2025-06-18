-- Criar tabela equipamentos_logistica
CREATE TABLE IF NOT EXISTS equipamentos_logistica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  frota_caminhao INTEGER NOT NULL,
  tanque_1 INTEGER NOT NULL,
  tanque_2 INTEGER NOT NULL,
  dolly INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_frota_caminhao ON equipamentos_logistica(frota_caminhao);

-- Habilitar RLS (Row Level Security)
ALTER TABLE equipamentos_logistica ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações (para desenvolvimento)
CREATE POLICY "Enable all operations for equipamentos_logistica" ON equipamentos_logistica
FOR ALL USING (true) WITH CHECK (true);
