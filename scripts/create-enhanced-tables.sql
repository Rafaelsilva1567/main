-- Atualizar tabela de equipamentos para incluir timestamps de modificação
ALTER TABLE equipamentos_logistica 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS modified_by VARCHAR(255) DEFAULT 'Sistema';

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar timestamp automaticamente
DROP TRIGGER IF EXISTS update_equipamentos_updated_at ON equipamentos_logistica;
CREATE TRIGGER update_equipamentos_updated_at
    BEFORE UPDATE ON equipamentos_logistica
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de tanques disponíveis
CREATE TABLE IF NOT EXISTS tanques_disponiveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_tanque INTEGER NOT NULL UNIQUE,
    capacidade DECIMAL(10,2),
    tipo VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponivel', -- disponivel, em_uso, manutencao
    localizacao VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de dollys disponíveis
CREATE TABLE IF NOT EXISTS dollys_disponiveis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_dolly INTEGER NOT NULL UNIQUE,
    tipo VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disponivel', -- disponivel, em_uso, manutencao
    localizacao VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pendências
CREATE TABLE IF NOT EXISTS pendencias_equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_equipamento VARCHAR(50) NOT NULL, -- tanque, dolly
    numero_equipamento INTEGER NOT NULL,
    tipo_pendencia VARCHAR(100) NOT NULL, -- manutencao, reparo, inspecao, etc
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media', -- baixa, media, alta, urgente
    status VARCHAR(50) DEFAULT 'aberta', -- aberta, em_andamento, concluida, cancelada
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_prevista TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    responsavel VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar triggers para as novas tabelas
DROP TRIGGER IF EXISTS update_tanques_updated_at ON tanques_disponiveis;
CREATE TRIGGER update_tanques_updated_at
    BEFORE UPDATE ON tanques_disponiveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dollys_updated_at ON dollys_disponiveis;
CREATE TRIGGER update_dollys_updated_at
    BEFORE UPDATE ON dollys_disponiveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pendencias_updated_at ON pendencias_equipamentos;
CREATE TRIGGER update_pendencias_updated_at
    BEFORE UPDATE ON pendencias_equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS para as novas tabelas
ALTER TABLE tanques_disponiveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dollys_disponiveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendencias_equipamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir todas as operações (desenvolvimento)
CREATE POLICY "Enable all operations for tanques_disponiveis" ON tanques_disponiveis
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for dollys_disponiveis" ON dollys_disponiveis
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for pendencias_equipamentos" ON pendencias_equipamentos
FOR ALL USING (true) WITH CHECK (true);

-- Inserir alguns dados de exemplo
INSERT INTO tanques_disponiveis (numero_tanque, capacidade, tipo, localizacao) VALUES
(29001, 30000.00, 'Combustível', 'Pátio A'),
(29002, 30000.00, 'Combustível', 'Pátio A'),
(29003, 25000.00, 'Combustível', 'Pátio B'),
(29004, 30000.00, 'Combustível', 'Pátio B'),
(29005, 30000.00, 'Combustível', 'Pátio C')
ON CONFLICT (numero_tanque) DO NOTHING;

INSERT INTO dollys_disponiveis (numero_dolly, tipo, localizacao) VALUES
(26001, 'Padrão', 'Pátio A'),
(26002, 'Padrão', 'Pátio A'),
(26003, 'Padrão', 'Pátio B'),
(26004, 'Padrão', 'Pátio B'),
(26005, 'Padrão', 'Pátio C')
ON CONFLICT (numero_dolly) DO NOTHING;
