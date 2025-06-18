-- Adicionar campo tipo_carga na tabela equipamentos_logistica
ALTER TABLE equipamentos_logistica 
ADD COLUMN IF NOT EXISTS tipo_carga VARCHAR(50);

-- Atualizar alguns registros existentes com dados de exemplo
UPDATE equipamentos_logistica 
SET tipo_carga = 'Combustível' 
WHERE tipo_carga IS NULL AND id IN (
  SELECT id FROM equipamentos_logistica LIMIT 2
);

UPDATE equipamentos_logistica 
SET tipo_carga = 'Vinhaça' 
WHERE tipo_carga IS NULL AND id IN (
  SELECT id FROM equipamentos_logistica WHERE tipo_carga IS NULL LIMIT 1
);
