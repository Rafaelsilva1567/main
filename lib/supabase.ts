import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente Supabase sem autenticação para uso interno
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "X-Client-Info": "logistics-internal-app",
    },
  },
})

export type EquipamentoLogistica = {
  id?: string
  frota_caminhao: number
  tanque_1: number
  tanque_2: number
  dolly: number | null
  tipo_carga?: string | null
  created_at?: string
  updated_at?: string
  modified_by?: string
}

export type TanqueDisponivel = {
  id?: string
  numero_tanque: number
  capacidade?: number
  tipo?: string
  status: "disponivel" | "em_uso" | "manutencao"
  localizacao?: string
  observacoes?: string
  tipo_configuracao: "solteiro" | "conjunto"
  tanque_conjunto_1?: number | null
  tanque_conjunto_2?: number | null
  dolly_conjunto?: number | null
  created_at?: string
  updated_at?: string
}

export type DollyDisponivel = {
  id?: string
  numero_dolly: number
  tipo?: string
  status: "disponivel" | "em_uso" | "manutencao"
  localizacao?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type PendenciaEquipamento = {
  id?: string
  tipo_equipamento: "tanque" | "dolly"
  numero_equipamento: number
  tipo_pendencia: string
  descricao: string
  prioridade: "baixa" | "media" | "alta" | "urgente"
  status: "aberta" | "em_andamento" | "concluida" | "cancelada"
  data_abertura?: string
  data_prevista?: string
  data_conclusao?: string
  responsavel?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}
