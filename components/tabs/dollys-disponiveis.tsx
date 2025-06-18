"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from "lucide-react"
import { useDollysDisponiveis } from "@/hooks/useDollysDisponiveis"
import type { DollyDisponivel } from "@/lib/supabase"

export function DollysDisponiveis() {
  const { dollys, loading, error, addDolly, updateDolly, deleteDolly } = useDollysDisponiveis()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<DollyDisponivel, "id" | "created_at" | "updated_at">>({
    numero_dolly: 0,
    tipo: "",
    status: "disponivel",
    localizacao: "",
    observacoes: "",
  })
  const [editingData, setEditingData] = useState<Omit<DollyDisponivel, "id" | "created_at" | "updated_at"> | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "bg-green-100 text-green-800"
      case "em_uso":
        return "bg-blue-100 text-blue-800"
      case "manutencao":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível"
      case "em_uso":
        return "Em Uso"
      case "manutencao":
        return "Manutenção"
      default:
        return status
    }
  }

  const resetForm = () => {
    setFormData({
      numero_dolly: 0,
      tipo: "",
      status: "disponivel",
      localizacao: "",
      observacoes: "",
    })
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  const handleSubmit = async () => {
    if (!formData.numero_dolly) return

    const result = editingId ? await updateDolly(editingId, formData) : await addDolly(formData)

    if (result.success) {
      resetForm()
    }
  }

  const startEdit = (dolly: DollyDisponivel) => {
    setEditingId(dolly.id!)
    setEditingData({
      numero_dolly: dolly.numero_dolly,
      tipo: dolly.tipo || "",
      status: dolly.status,
      localizacao: dolly.localizacao || "",
      observacoes: dolly.observacoes || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveEdit = async () => {
    if (!editingId || !editingData) return

    const result = await updateDolly(editingId, editingData)
    if (result.success) {
      setEditingId(null)
      setEditingData(null)
      alert("Dolly atualizado com sucesso!")
    } else {
      alert(`Erro ao atualizar: ${result.error}`)
    }
  }

  const handleDelete = async (id: string, numero: number) => {
    if (confirm(`Tem certeza que deseja deletar o dolly ${numero}?`)) {
      await deleteDolly(id)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando dollys...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Erro ao carregar dollys</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Para resolver:</strong> Execute o script SQL "create-new-tables.sql" no seu banco de dados
              Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dollys Disponíveis</CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Dolly
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">{editingId ? "Editar Dolly" : "Novo Dolly"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Número do Dolly</Label>
                  <Input
                    type="number"
                    value={formData.numero_dolly || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numero_dolly: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="Ex: 26001"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input
                    value={formData.tipo || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                    placeholder="Ex: Padrão"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input
                    value={formData.localizacao || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Ex: Pátio A"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Observações</Label>
                  <Input
                    value={formData.observacoes || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações gerais"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-1" />
                  {editingId ? "Atualizar" : "Salvar"}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dollys.map((dolly) => (
              <div key={dolly.id} className="p-4 border rounded-lg bg-white">
                {editingId === dolly.id ? (
                  // Formulário de edição inline
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-3">Editando Dolly {dolly.numero_dolly}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Número do Dolly</Label>
                        <Input
                          type="number"
                          value={editingData?.numero_dolly || ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, numero_dolly: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Input
                          value={editingData?.tipo || ""}
                          onChange={(e) => setEditingData((prev) => (prev ? { ...prev, tipo: e.target.value } : null))}
                          placeholder="Ex: Padrão"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={editingData?.status || ""}
                          onValueChange={(value: any) =>
                            setEditingData((prev) => (prev ? { ...prev, status: value } : null))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponivel">Disponível</SelectItem>
                            <SelectItem value="em_uso">Em Uso</SelectItem>
                            <SelectItem value="manutencao">Manutenção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Localização</Label>
                        <Input
                          value={editingData?.localizacao || ""}
                          onChange={(e) =>
                            setEditingData((prev) => (prev ? { ...prev, localizacao: e.target.value } : null))
                          }
                          placeholder="Ex: Pátio A"
                        />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Input
                          value={editingData?.observacoes || ""}
                          onChange={(e) =>
                            setEditingData((prev) => (prev ? { ...prev, observacoes: e.target.value } : null))
                          }
                          placeholder="Observações gerais"
                        />
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
                  // Visualização normal
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">Dolly {dolly.numero_dolly}</h3>
                        <Badge className={getStatusColor(dolly.status)}>{getStatusLabel(dolly.status)}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={() => startEdit(dolly)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(dolly.id!, dolly.numero_dolly)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {dolly.tipo && (
                        <p>
                          <strong>Tipo:</strong> {dolly.tipo}
                        </p>
                      )}
                      {dolly.localizacao && (
                        <p>
                          <strong>Localização:</strong> {dolly.localizacao}
                        </p>
                      )}
                      {dolly.observacoes && (
                        <p>
                          <strong>Obs:</strong> {dolly.observacoes}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {dollys.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">Nenhum dolly cadastrado ainda</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
