-- Adicionar campos para configuração de tanques em conjunto
ALTER TABLE tanques_disponiveis 
ADD COLUMN IF NOT EXISTS tipo_configuracao VARCHAR(20) DEFAULT 'solteiro',
ADD COLUMN IF NOT EXISTS tanque_conjunto_1 INTEGER,
ADD COLUMN IF NOT EXISTS tanque_conjunto_2 INTEGER,
ADD COLUMN IF NOT EXISTS dolly_conjunto INTEGER;

-- Atualizar registros existentes para serem 'solteiro'
UPDATE tanques_disponiveis 
SET tipo_configuracao = 'solteiro' 
WHERE tipo_configuracao IS NULL;

-- Adicionar alguns exemplos de conjuntos
INSERT INTO tanques_disponiveis (
  numero_tanque, 
  tipo_configuracao, 
  tanque_conjunto_1, 
  tanque_conjunto_2, 
  dolly_conjunto,
  tipo, 
  status, 
  localizacao,
  observacoes
) VALUES
(99001, 'conjunto', 29001, 29002, 26001, 'Combustível', 'disponivel', 'Pátio A', 'Conjunto exemplo - Tanque 29001 + 29002 + Dolly 26001'),
(99002, 'conjunto', 29003, 29004, 26002, 'Vinhaça', 'disponivel', 'Pátio B', 'Conjunto exemplo - Tanque 29003 + 29004 + Dolly 26002')
ON CONFLICT (numero_tanque) DO NOTHING;
