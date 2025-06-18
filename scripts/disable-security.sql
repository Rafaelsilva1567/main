-- Desabilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE equipamentos_logistica DISABLE ROW LEVEL SECURITY;
ALTER TABLE tanques_disponiveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE dollys_disponiveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE pendencias_equipamentos DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable all operations for equipamentos_logistica" ON equipamentos_logistica;
DROP POLICY IF EXISTS "Enable all operations for tanques_disponiveis" ON tanques_disponiveis;
DROP POLICY IF EXISTS "Enable all operations for dollys_disponiveis" ON dollys_disponiveis;
DROP POLICY IF EXISTS "Enable all operations for pendencias_equipamentos" ON pendencias_equipamentos;

-- Garantir que as tabelas existam sem restrições
CREATE TABLE IF NOT EXISTS equipamentos_logistica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  frota_caminhao INTEGER NOT NULL,
  tanque_1 INTEGER NOT NULL,
  tanque_2 INTEGER NOT NULL,
  dolly INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by VARCHAR(255) DEFAULT 'Sistema'
);

CREATE TABLE IF NOT EXISTS tanques_disponiveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_tanque INTEGER NOT NULL UNIQUE,
    capacidade DECIMAL(10,2),
    tipo VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponivel',
    localizacao VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dollys_disponiveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_dolly INTEGER NOT NULL UNIQUE,
    tipo VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponivel',
    localizacao VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pendencias_equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_equipamento VARCHAR(50) NOT NULL,
    numero_equipamento INTEGER NOT NULL,
    tipo_pendencia VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media',
    status VARCHAR(50) DEFAULT 'aberta',
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_prevista TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    responsavel VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO tanques_disponiveis (numero_tanque, capacidade, tipo, localizacao) VALUES
(29001, 30000.00, 'Combustível', 'Pátio A'),
(29002, 30000.00, 'Vinhaça', 'Pátio A'),
(29003, 25000.00, 'Água', 'Pátio B'),
(29004, 30000.00, 'Adubo', 'Pátio B'),
(29005, 30000.00, 'Combustível', 'Pátio C')
ON CONFLICT (numero_tanque) DO NOTHING;

INSERT INTO dollys_disponiveis (numero_dolly, tipo, localizacao) VALUES
(26001, 'Padrão', 'Pátio A'),
(26002, 'Padrão', 'Pátio A'),
(26003, 'Padrão', 'Pátio B'),
(26004, 'Padrão', 'Pátio B'),
(26005, 'Padrão', 'Pátio C')
ON CONFLICT (numero_dolly) DO NOTHING;
