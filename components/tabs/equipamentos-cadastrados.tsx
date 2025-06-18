"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Check, X, Trash2, Clock } from "lucide-react"
import { useEquipamentos } from "@/hooks/useEquipamentos"
import type { EquipamentoLogistica } from "@/lib/supabase"

type FormEquipamento = Omit<EquipamentoLogistica, "id" | "created_at" | "updated_at" | "modified_by">

export function EquipamentosCadastrados() {
  const { equipamentos, loading, updateEquipamento, deleteEquipamento } = useEquipamentos()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<FormEquipamento | null>(null)

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getTipoCargaColor = (tipo: string | null | undefined) => {
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
        return "bg-gray-100 text-gray-600"
    }
  }

  const startEdit = (equipamento: EquipamentoLogistica) => {
    setEditingId(equipamento.id!)
    setEditingData({
      frota_caminhao: equipamento.frota_caminhao,
      tanque_1: equipamento.tanque_1,
      tanque_2: equipamento.tanque_2,
      dolly: equipamento.dolly,
      tipo_carga: equipamento.tipo_carga,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveEdit = async () => {
    if (!editingId || !editingData) return

    const result = await updateEquipamento(editingId, editingData)
    if (result.success) {
      setEditingId(null)
      setEditingData(null)
    }
  }

  const handleDelete = async (id: string, frota: number) => {
    if (confirm(`Tem certeza que deseja deletar a frota ${frota}?`)) {
      await deleteEquipamento(id)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando equipamentos...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipamentos em Operação ({equipamentos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {equipamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum equipamento cadastrado ainda</div>
        ) : (
          <div className="space-y-4">
            {equipamentos.map((equipamento) => (
              <div key={equipamento.id} className="p-4 border rounded-lg bg-white">
                {editingId === equipamento.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label>Frota Caminhão</Label>
                        <Input
                          type="number"
                          value={editingData?.frota_caminhao || ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, frota_caminhao: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Tanque 1</Label>
                        <Input
                          type="number"
                          value={editingData?.tanque_1 || ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, tanque_1: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Tanque 2</Label>
                        <Input
                          type="number"
                          value={editingData?.tanque_2 || ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, tanque_2: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>
                          Dolly <span className="text-gray-400 text-sm">(Opcional)</span>
                        </Label>
                        <Input
                          type="number"
                          value={editingData?.dolly || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            setEditingData((prev) =>
                              prev ? { ...prev, dolly: value ? Number.parseInt(value) : null } : null,
                            )
                          }}
                          placeholder="Deixe vazio se não tiver dolly"
                        />
                      </div>
                      <div>
                        <Label>Tipo de Carga</Label>
                        <Select
                          value={editingData?.tipo_carga || ""}
                          onValueChange={(value) =>
                            setEditingData((prev) => (prev ? { ...prev, tipo_carga: value || null } : null))
                          }
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
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                        <div>
                          <span className="text-sm text-gray-500">Caminhão:</span>
                          <div className="font-semibold flex items-center gap-2">
                            {equipamento.frota_caminhao}
                            {equipamento.id?.startsWith("temp_") && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendente</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Tanque 1:</span>
                          <div className="font-semibold">{equipamento.tanque_1}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Tanque 2:</span>
                          <div className="font-semibold">{equipamento.tanque_2}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Dolly:</span>
                          <div className="font-semibold">
                            {equipamento.dolly ? (
                              equipamento.dolly
                            ) : (
                              <span className="text-gray-400 italic">Sem dolly</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Carga:</span>
                          <div className="font-semibold">
                            {equipamento.tipo_carga ? (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getTipoCargaColor(equipamento.tipo_carga)}`}
                              >
                                {equipamento.tipo_carga}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Sem carga</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button onClick={() => startEdit(equipamento)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(equipamento.id!, equipamento.frota_caminhao)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Informações de data/hora */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Criado: {formatDateTime(equipamento.created_at)}</span>
                      </div>
                      {equipamento.updated_at && equipamento.updated_at !== equipamento.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Modificado: {formatDateTime(equipamento.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
