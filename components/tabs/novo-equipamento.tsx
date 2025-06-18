"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save } from "lucide-react"
import { useEquipamentos } from "@/hooks/useEquipamentos"
import type { EquipamentoLogistica } from "@/lib/supabase"

type FormEquipamento = Omit<EquipamentoLogistica, "id" | "created_at" | "updated_at" | "modified_by">

export function NovoEquipamento() {
  const { equipamentos, addEquipamento } = useEquipamentos()
  const [formGroups, setFormGroups] = useState<FormEquipamento[]>([
    { frota_caminhao: 0, tanque_1: 0, tanque_2: 0, dolly: null, tipo_carga: null },
  ])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const exemploEquipamento = () => {
    setFormGroups([
      { frota_caminhao: 4609, tanque_1: 29001, tanque_2: 29102, dolly: 26008, tipo_carga: "Combustível" },
      { frota_caminhao: 4610, tanque_1: 29003, tanque_2: 29104, dolly: null, tipo_carga: "Vinhaça" },
      { frota_caminhao: 4611, tanque_1: 29005, tanque_2: 29006, dolly: 26009, tipo_carga: "Água" },
    ])
  }

  const addNewGroup = () => {
    setFormGroups([...formGroups, { frota_caminhao: 0, tanque_1: 0, tanque_2: 0, dolly: null, tipo_carga: null }])
  }

  const removeGroup = (index: number) => {
    setFormGroups(formGroups.filter((_, i) => i !== index))
  }

  const updateGroup = (index: number, field: keyof FormEquipamento, value: number | string | null) => {
    const updated = [...formGroups]
    updated[index] = { ...updated[index], [field]: value }
    setFormGroups(updated)
  }

  const validateForm = () => {
    for (const group of formGroups) {
      if (!group.frota_caminhao || !group.tanque_1 || !group.tanque_2) {
        return "Campos obrigatórios: Frota Caminhão, Tanque 1 e Tanque 2 devem ser preenchidos"
      }
    }

    // Verificar frotas duplicadas no formulário
    const frotas = formGroups.map((g) => g.frota_caminhao)
    const frotasUnicas = new Set(frotas)
    if (frotas.length !== frotasUnicas.size) {
      return "Não é possível ter frotas de caminhão duplicadas no mesmo envio"
    }

    // Verificar se já existe no banco
    const frotasExistentes = equipamentos.map((eq) => eq.frota_caminhao)
    for (const frota of frotas) {
      if (frotasExistentes.includes(frota)) {
        return `Frota ${frota} já existe no sistema`
      }
    }

    return null
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      showMessage("error", validationError)
      return
    }

    let successCount = 0
    for (const group of formGroups) {
      const result = await addEquipamento(group)
      if (result.success) {
        successCount++
      } else {
        showMessage("error", result.error || "Erro ao salvar")
        return
      }
    }

    showMessage(
      "success",
      `${successCount} equipamento(s) salvos! ${navigator.onLine ? "" : "(Será sincronizado quando voltar online)"}`,
    )
    setFormGroups([{ frota_caminhao: 0, tanque_1: 0, tanque_2: 0, dolly: null, tipo_carga: null }])
  }

  const getTipoCargaColor = (tipo: string | null) => {
    switch (tipo) {
      case "Vinhaça":
        return "bg-purple-100 text-purple-800"
      case "Água":
        return "bg-blue-100 text-blue-800"
      case "Combustível":
        return "bg-orange-100 text-orange-800"
      case "Adubo":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Cadastrar Novos Equipamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {formGroups.map((group, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">Caminhão {index + 1}</h3>
                {group.tipo_carga && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoCargaColor(group.tipo_carga)}`}>
                    {group.tipo_carga}
                  </span>
                )}
              </div>
              {formGroups.length > 1 && (
                <Button variant="destructive" size="sm" onClick={() => removeGroup(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor={`frota-${index}`}>Frota Caminhão *</Label>
                <Input
                  id={`frota-${index}`}
                  type="number"
                  value={group.frota_caminhao || ""}
                  onChange={(e) => updateGroup(index, "frota_caminhao", Number.parseInt(e.target.value) || 0)}
                  placeholder="Ex: 4609"
                  className={!group.frota_caminhao ? "border-red-300" : ""}
                />
              </div>
              <div>
                <Label htmlFor={`tanque1-${index}`}>Tanque 1 *</Label>
                <Input
                  id={`tanque1-${index}`}
                  type="number"
                  value={group.tanque_1 || ""}
                  onChange={(e) => updateGroup(index, "tanque_1", Number.parseInt(e.target.value) || 0)}
                  placeholder="Ex: 29001"
                  className={!group.tanque_1 ? "border-red-300" : ""}
                />
              </div>
              <div>
                <Label htmlFor={`tanque2-${index}`}>Tanque 2 *</Label>
                <Input
                  id={`tanque2-${index}`}
                  type="number"
                  value={group.tanque_2 || ""}
                  onChange={(e) => updateGroup(index, "tanque_2", Number.parseInt(e.target.value) || 0)}
                  placeholder="Ex: 29102"
                  className={!group.tanque_2 ? "border-red-300" : ""}
                />
              </div>
              <div>
                <Label htmlFor={`dolly-${index}`}>
                  Dolly <span className="text-gray-400 text-sm">(Opcional)</span>
                </Label>
                <Input
                  id={`dolly-${index}`}
                  type="number"
                  value={group.dolly || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    updateGroup(index, "dolly", value ? Number.parseInt(value) : null)
                  }}
                  placeholder="Ex: 26008"
                />
              </div>
              <div>
                <Label htmlFor={`carga-${index}`}>Tipo de Carga</Label>
                <Select
                  value={group.tipo_carga || ""}
                  onValueChange={(value) => updateGroup(index, "tipo_carga", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a carga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem carga</SelectItem>
                    <SelectItem value="Vinhaça">🍇 Vinhaça</SelectItem>
                    <SelectItem value="Água">💧 Água</SelectItem>
                    <SelectItem value="Combustível">⛽ Combustível</SelectItem>
                    <SelectItem value="Adubo">🌱 Adubo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button onClick={addNewGroup} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Caminhão
          </Button>
          <Button onClick={exemploEquipamento} variant="secondary">
            📋 Carregar Exemplo
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar Todos
          </Button>
        </div>

        <p className="text-xs text-gray-500">* Campos obrigatórios</p>
      </CardContent>
    </Card>
  )
}
