"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Check, X, AlertCircle, Link, Unlink } from "lucide-react"
import { useTanquesDisponiveis } from "@/hooks/useTanquesDisponiveis"
import type { TanqueDisponivel } from "@/lib/supabase"

export function TanquesDisponiveis() {
  const { tanques, loading, error, addTanque, updateTanque, deleteTanque } = useTanquesDisponiveis()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<TanqueDisponivel, "id" | "created_at" | "updated_at">>({
    numero_tanque: 0,
    capacidade: 0,
    tipo: "",
    status: "disponivel",
    localizacao: "",
    observacoes: "",
    tipo_configuracao: "solteiro",
    tanque_conjunto_1: null,
    tanque_conjunto_2: null,
    dolly_conjunto: null,
  })

  // Estado para edição inline
  const [editingData, setEditingData] = useState<Omit<TanqueDisponivel, "id" | "created_at" | "updated_at"> | null>(
    null,
  )

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

  const getConfigColor = (config: string) => {
    return config === "conjunto" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
  }

  const resetForm = () => {
    setFormData({
      numero_tanque: 0,
      capacidade: 0,
      tipo: "",
      status: "disponivel",
      localizacao: "",
      observacoes: "",
      tipo_configuracao: "solteiro",
      tanque_conjunto_1: null,
      tanque_conjunto_2: null,
      dolly_conjunto: null,
    })
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  const handleSubmit = async () => {
    console.log("Dados do formulário:", formData)

    // Validação básica
    if (!formData.numero_tanque || formData.numero_tanque <= 0) {
      alert("Por favor, preencha um número de tanque válido")
      return
    }

    // Validação específica para conjunto
    if (formData.tipo_configuracao === "conjunto") {
      if (!formData.tanque_conjunto_1 || !formData.tanque_conjunto_2) {
        alert("Para tanques em conjunto, é obrigatório preencher Tanque 1 e Tanque 2")
        return
      }
      if (formData.tanque_conjunto_1 === formData.tanque_conjunto_2) {
        alert("Tanque 1 e Tanque 2 não podem ser iguais")
        return
      }
    }

    setIsSubmitting(true)
    console.log("Validação passou, enviando dados...")

    try {
      const result = await addTanque(formData)

      console.log("Resultado da operação:", result)

      if (result.success) {
        console.log("Sucesso! Resetando formulário...")
        resetForm()
        alert("Tanque salvo com sucesso!")
      } else {
        console.error("Erro ao salvar:", result.error)
        alert(`Erro ao salvar: ${result.error}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funções para edição inline
  const startEdit = (tanque: TanqueDisponivel) => {
    setEditingId(tanque.id!)
    setEditingData({
      numero_tanque: tanque.numero_tanque,
      capacidade: tanque.capacidade || 0,
      tipo: tanque.tipo || "",
      status: tanque.status,
      localizacao: tanque.localizacao || "",
      observacoes: tanque.observacoes || "",
      tipo_configuracao: tanque.tipo_configuracao || "solteiro",
      tanque_conjunto_1: tanque.tanque_conjunto_1 || null,
      tanque_conjunto_2: tanque.tanque_conjunto_2 || null,
      dolly_conjunto: tanque.dolly_conjunto || null,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveEdit = async () => {
    if (!editingId || !editingData) return

    // Validações para edição
    if (editingData.tipo_configuracao === "conjunto") {
      if (!editingData.tanque_conjunto_1 || !editingData.tanque_conjunto_2) {
        alert("Para tanques em conjunto, é obrigatório preencher Tanque 1 e Tanque 2")
        return
      }
      if (editingData.tanque_conjunto_1 === editingData.tanque_conjunto_2) {
        alert("Tanque 1 e Tanque 2 não podem ser iguais")
        return
      }
    }

    const result = await updateTanque(editingId, editingData)
    if (result.success) {
      setEditingId(null)
      setEditingData(null)
      alert("Tanque atualizado com sucesso!")
    } else {
      alert(`Erro ao atualizar: ${result.error}`)
    }
  }

  const handleDelete = async (id: string, numero: number) => {
    if (confirm(`Tem certeza que deseja deletar o tanque ${numero}?`)) {
      const result = await deleteTanque(id)
      if (!result.success) {
        alert(`Erro ao deletar: ${result.error}`)
      }
    }
  }

  const carregarExemplo = () => {
    setFormData({
      numero_tanque: 30001,
      capacidade: 25000,
      tipo: "Vinhaça",
      status: "disponivel",
      localizacao: "Pátio D",
      observacoes: "Tanque de exemplo",
      tipo_configuracao: "solteiro",
      tanque_conjunto_1: null,
      tanque_conjunto_2: null,
      dolly_conjunto: null,
    })
  }

  const carregarExemploConjunto = () => {
    setFormData({
      numero_tanque: 99003,
      capacidade: 0,
      tipo: "Combustível",
      status: "disponivel",
      localizacao: "Pátio C",
      observacoes: "Conjunto de tanques exemplo",
      tipo_configuracao: "conjunto",
      tanque_conjunto_1: 29005,
      tanque_conjunto_2: 29006,
      dolly_conjunto: 26003,
    })
  }

  // Separar tanques por tipo
  const tanquesSolteiros = tanques.filter((t) => t.tipo_configuracao === "solteiro")
  const tanquesConjunto = tanques.filter((t) => t.tipo_configuracao === "conjunto")

  if (loading) {
    return <div className="text-center py-8">Carregando tanques...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Erro ao carregar tanques</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Para resolver:</strong> Execute o script SQL "enhance-tanques-table.sql" no seu banco de dados
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
            <CardTitle>
              Tanques Disponíveis ({tanques.length}) - {tanquesSolteiros.length} Solteiros, {tanquesConjunto.length}{" "}
              Conjuntos
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tanque
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Novo Tanque</h3>

              {/* Seleção do Tipo de Configuração */}
              <div className="mb-4">
                <Label>Tipo de Configuração *</Label>
                <Select
                  value={formData.tipo_configuracao}
                  onValueChange={(value: "solteiro" | "conjunto") => {
                    setFormData((prev) => ({
                      ...prev,
                      tipo_configuracao: value,
                      // Limpar campos de conjunto se mudar para solteiro
                      tanque_conjunto_1: value === "solteiro" ? null : prev.tanque_conjunto_1,
                      tanque_conjunto_2: value === "solteiro" ? null : prev.tanque_conjunto_2,
                      dolly_conjunto: value === "solteiro" ? null : prev.dolly_conjunto,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">
                      <div className="flex items-center gap-2">
                        <Unlink className="h-4 w-4" />
                        Tanque Solteiro
                      </div>
                    </SelectItem>
                    <SelectItem value="conjunto">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        Tanques Engatados em Conjunto
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Número do Tanque/Conjunto *</Label>
                  <Input
                    type="number"
                    value={formData.numero_tanque || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numero_tanque: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder={formData.tipo_configuracao === "conjunto" ? "Ex: 99001" : "Ex: 29001"}
                    className={!formData.numero_tanque ? "border-red-300" : ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.tipo_configuracao === "conjunto"
                      ? "Número identificador do conjunto"
                      : "Número do tanque individual"}
                  </p>
                </div>

                {/* Campos específicos para conjunto */}
                {formData.tipo_configuracao === "conjunto" && (
                  <>
                    <div>
                      <Label>Tanque 1 do Conjunto *</Label>
                      <Input
                        type="number"
                        value={formData.tanque_conjunto_1 || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tanque_conjunto_1: Number.parseInt(e.target.value) || null,
                          }))
                        }
                        placeholder="Ex: 29001"
                        className={!formData.tanque_conjunto_1 ? "border-red-300" : ""}
                      />
                    </div>
                    <div>
                      <Label>Tanque 2 do Conjunto *</Label>
                      <Input
                        type="number"
                        value={formData.tanque_conjunto_2 || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tanque_conjunto_2: Number.parseInt(e.target.value) || null,
                          }))
                        }
                        placeholder="Ex: 29002"
                        className={!formData.tanque_conjunto_2 ? "border-red-300" : ""}
                      />
                    </div>
                    <div>
                      <Label>Dolly do Conjunto</Label>
                      <Input
                        type="number"
                        value={formData.dolly_conjunto || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dolly_conjunto: Number.parseInt(e.target.value) || null,
                          }))
                        }
                        placeholder="Ex: 26001"
                      />
                    </div>
                  </>
                )}

                {/* Campos comuns */}
                {formData.tipo_configuracao === "solteiro" && (
                  <div>
                    <Label>Capacidade (L)</Label>
                    <Input
                      type="number"
                      value={formData.capacidade || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, capacidade: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="Ex: 30000"
                    />
                  </div>
                )}

                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={formData.tipo || ""}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vinhaça">Vinhaça</SelectItem>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Combustível">Combustível</SelectItem>
                      <SelectItem value="Adubo">Adubo</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                  <Check className="h-4 w-4 mr-1" />
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button onClick={carregarExemplo} variant="secondary">
                  📋 Exemplo Solteiro
                </Button>
                <Button onClick={carregarExemploConjunto} variant="secondary">
                  🔗 Exemplo Conjunto
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">* Campos obrigatórios</p>
            </div>
          )}

          {/* Seção de Tanques Solteiros */}
          {tanquesSolteiros.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Unlink className="h-5 w-5" />
                Tanques Solteiros ({tanquesSolteiros.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tanquesSolteiros.map((tanque) => (
                  <div key={tanque.id} className="p-4 border rounded-lg bg-white">
                    {editingId === tanque.id ? (
                      // Formulário de edição inline
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg mb-3">Editando Tanque {tanque.numero_tanque}</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Número do Tanque</Label>
                            <Input
                              type="number"
                              value={editingData?.numero_tanque || ""}
                              onChange={(e) =>
                                setEditingData((prev) =>
                                  prev ? { ...prev, numero_tanque: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Capacidade (L)</Label>
                            <Input
                              type="number"
                              value={editingData?.capacidade || ""}
                              onChange={(e) =>
                                setEditingData((prev) =>
                                  prev ? { ...prev, capacidade: Number.parseFloat(e.target.value) || 0 } : null,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={editingData?.tipo || ""}
                              onValueChange={(value) =>
                                setEditingData((prev) => (prev ? { ...prev, tipo: value } : null))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Vinhaça">Vinhaça</SelectItem>
                                <SelectItem value="Água">Água</SelectItem>
                                <SelectItem value="Combustível">Combustível</SelectItem>
                                <SelectItem value="Adubo">Adubo</SelectItem>
                              </SelectContent>
                            </Select>
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
                            />
                          </div>
                          <div>
                            <Label>Observações</Label>
                            <Input
                              value={editingData?.observacoes || ""}
                              onChange={(e) =>
                                setEditingData((prev) => (prev ? { ...prev, observacoes: e.target.value } : null))
                              }
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
                            <h4 className="font-semibold text-lg">Tanque {tanque.numero_tanque}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge className={getStatusColor(tanque.status)}>{getStatusLabel(tanque.status)}</Badge>
                              <Badge className={getConfigColor(tanque.tipo_configuracao)}>Solteiro</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button onClick={() => startEdit(tanque)} variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(tanque.id!, tanque.numero_tanque)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {tanque.capacidade && (
                            <p>
                              <strong>Capacidade:</strong> {tanque.capacidade.toLocaleString()} L
                            </p>
                          )}
                          {tanque.tipo && (
                            <p>
                              <strong>Tipo:</strong> {tanque.tipo}
                            </p>
                          )}
                          {tanque.localizacao && (
                            <p>
                              <strong>Localização:</strong> {tanque.localizacao}
                            </p>
                          )}
                          {tanque.observacoes && (
                            <p>
                              <strong>Obs:</strong> {tanque.observacoes}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Tanques em Conjunto */}
          {tanquesConjunto.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Tanques em Conjunto ({tanquesConjunto.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tanquesConjunto.map((tanque) => (
                  <div key={tanque.id} className="p-4 border rounded-lg bg-white">
                    {editingId === tanque.id ? (
                      // Formulário de edição inline para conjunto
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg mb-3">Editando Conjunto {tanque.numero_tanque}</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Número do Conjunto</Label>
                            <Input
                              type="number"
                              value={editingData?.numero_tanque || ""}
                              onChange={(e) =>
                                setEditingData((prev) =>
                                  prev ? { ...prev, numero_tanque: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Tanque 1</Label>
                              <Input
                                type="number"
                                value={editingData?.tanque_conjunto_1 || ""}
                                onChange={(e) =>
                                  setEditingData((prev) =>
                                    prev
                                      ? { ...prev, tanque_conjunto_1: Number.parseInt(e.target.value) || null }
                                      : null,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Tanque 2</Label>
                              <Input
                                type="number"
                                value={editingData?.tanque_conjunto_2 || ""}
                                onChange={(e) =>
                                  setEditingData((prev) =>
                                    prev
                                      ? { ...prev, tanque_conjunto_2: Number.parseInt(e.target.value) || null }
                                      : null,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Dolly</Label>
                            <Input
                              type="number"
                              value={editingData?.dolly_conjunto || ""}
                              onChange={(e) =>
                                setEditingData((prev) =>
                                  prev ? { ...prev, dolly_conjunto: Number.parseInt(e.target.value) || null } : null,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={editingData?.tipo || ""}
                              onValueChange={(value) =>
                                setEditingData((prev) => (prev ? { ...prev, tipo: value } : null))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Vinhaça">Vinhaça</SelectItem>
                                <SelectItem value="Água">Água</SelectItem>
                                <SelectItem value="Combustível">Combustível</SelectItem>
                                <SelectItem value="Adubo">Adubo</SelectItem>
                              </SelectContent>
                            </Select>
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
                            />
                          </div>
                          <div>
                            <Label>Observações</Label>
                            <Input
                              value={editingData?.observacoes || ""}
                              onChange={(e) =>
                                setEditingData((prev) => (prev ? { ...prev, observacoes: e.target.value } : null))
                              }
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
                      // Visualização normal do conjunto
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">Conjunto {tanque.numero_tanque}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge className={getStatusColor(tanque.status)}>{getStatusLabel(tanque.status)}</Badge>
                              <Badge className={getConfigColor(tanque.tipo_configuracao)}>Conjunto</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button onClick={() => startEdit(tanque)} variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(tanque.id!, tanque.numero_tanque)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="font-medium mb-2">Composição do Conjunto:</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <strong>Tanque 1:</strong>
                                <br />
                                {tanque.tanque_conjunto_1}
                              </div>
                              <div>
                                <strong>Tanque 2:</strong>
                                <br />
                                {tanque.tanque_conjunto_2}
                              </div>
                              <div>
                                <strong>Dolly:</strong>
                                <br />
                                {tanque.dolly_conjunto || "N/A"}
                              </div>
                            </div>
                          </div>
                          {tanque.tipo && (
                            <p>
                              <strong>Tipo:</strong> {tanque.tipo}
                            </p>
                          )}
                          {tanque.localizacao && (
                            <p>
                              <strong>Localização:</strong> {tanque.localizacao}
                            </p>
                          )}
                          {tanque.observacoes && (
                            <p>
                              <strong>Obs:</strong> {tanque.observacoes}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tanques.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum tanque cadastrado ainda</p>
              <Button onClick={() => setShowForm(true)} className="mt-2" variant="outline">
                Cadastrar primeiro tanque
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
