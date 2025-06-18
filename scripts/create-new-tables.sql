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
    status VARCHAR(50) DEFAULT 'disponivel',
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
    status VARCHAR(50) DEFAULT 'disponivel',
    localizacao VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pendências
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

-- Habilitar RLS para as novas tabelas
ALTER TABLE tanques_disponiveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dollys_disponiveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendencias_equipamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir todas as operações
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tanques_disponiveis' AND policyname = 'Enable all operations for tanques_disponiveis') THEN
        CREATE POLICY "Enable all operations for tanques_disponiveis" ON tanques_disponiveis FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dollys_disponiveis' AND policyname = 'Enable all operations for dollys_disponiveis') THEN
        CREATE POLICY "Enable all operations for dollys_disponiveis" ON dollys_disponiveis FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pendencias_equipamentos' AND policyname = 'Enable all operations for pendencias_equipamentos') THEN
        CREATE POLICY "Enable all operations for pendencias_equipamentos" ON pendencias_equipamentos FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

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
