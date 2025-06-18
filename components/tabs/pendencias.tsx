"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, Edit2, Trash2, Check, X, AlertCircle } from "lucide-react"
import { usePendencias } from "@/hooks/usePendencias"
import type { PendenciaEquipamento } from "@/lib/supabase"

export function Pendencias() {
  const { pendencias, loading, error, addPendencia, updatePendencia, deletePendencia } = usePendencias()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<
    Omit<PendenciaEquipamento, "id" | "created_at" | "updated_at" | "data_abertura">
  >({
    tipo_equipamento: "tanque",
    numero_equipamento: 0,
    tipo_pendencia: "",
    descricao: "",
    prioridade: "media",
    status: "aberta",
    data_prevista: "",
    data_conclusao: "",
    responsavel: "",
    observacoes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return "bg-green-100 text-green-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "urgente":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta":
        return "bg-red-100 text-red-800"
      case "em_andamento":
        return "bg-blue-100 text-blue-800"
      case "concluida":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const resetForm = () => {
    setFormData({
      tipo_equipamento: "tanque",
      numero_equipamento: 0,
      tipo_pendencia: "",
      descricao: "",
      prioridade: "media",
      status: "aberta",
      data_prevista: "",
      data_conclusao: "",
      responsavel: "",
      observacoes: "",
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    console.log("📝 Iniciando submissão da pendência:", formData)

    // Validação mais detalhada
    if (!formData.numero_equipamento) {
      alert("Por favor, preencha o número do equipamento")
      return
    }

    if (!formData.tipo_pendencia.trim()) {
      alert("Por favor, preencha o tipo de pendência")
      return
    }

    if (!formData.descricao.trim()) {
      alert("Por favor, preencha a descrição")
      return
    }

    setIsSubmitting(true)
    console.log("✅ Validação passou, enviando dados...")

    try {
      const result = editingId ? await updatePendencia(editingId, formData) : await addPendencia(formData)

      console.log("📊 Resultado da operação:", result)

      if (result.success) {
        console.log("🎉 Sucesso! Resetando formulário...")
        resetForm()

        // Feedback mais claro para o usuário
        const message = editingId
          ? "Pendência atualizada com sucesso!"
          : `Pendência criada com sucesso! ${navigator.onLine ? "" : "(Será sincronizada quando voltar online)"}`

        alert(message)

        // Forçar uma pequena atualização visual
        setTimeout(() => {
          console.log("🔄 Verificando se a pendência apareceu na lista...")
        }, 100)
      } else {
        console.error("❌ Erro ao salvar:", result.error)
        alert(`Erro ao salvar: ${result.error}`)
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error)
      alert("Erro inesperado ao salvar a pendência")
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (pendencia: PendenciaEquipamento) => {
    setFormData({
      tipo_equipamento: pendencia.tipo_equipamento,
      numero_equipamento: pendencia.numero_equipamento,
      tipo_pendencia: pendencia.tipo_pendencia,
      descricao: pendencia.descricao,
      prioridade: pendencia.prioridade,
      status: pendencia.status,
      data_prevista: pendencia.data_prevista ? pendencia.data_prevista.split("T")[0] : "",
      data_conclusao: pendencia.data_conclusao ? pendencia.data_conclusao.split("T")[0] : "",
      responsavel: pendencia.responsavel || "",
      observacoes: pendencia.observacoes || "",
    })
    setEditingId(pendencia.id!)
    setShowForm(true)
  }

  const handleDelete = async (id: string, equipamento: string) => {
    if (confirm(`Tem certeza que deseja deletar a pendência do ${equipamento}?`)) {
      await deletePendencia(id)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando pendências...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Erro ao carregar pendências</h3>
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pendências de Equipamentos
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pendência
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">{editingId ? "Editar Pendência" : "Nova Pendência"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Equipamento</Label>
                  <Select
                    value={formData.tipo_equipamento}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, tipo_equipamento: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanque">Tanque</SelectItem>
                      <SelectItem value="dolly">Dolly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Número do Equipamento</Label>
                  <Input
                    type="number"
                    value={formData.numero_equipamento || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numero_equipamento: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="Ex: 29001"
                  />
                </div>
                <div>
                  <Label>Tipo de Pendência</Label>
                  <Input
                    value={formData.tipo_pendencia}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tipo_pendencia: e.target.value }))}
                    placeholder="Ex: Manutenção, Reparo, Inspeção"
                  />
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, prioridade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
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
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Input
                    value={formData.responsavel || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <Label>Data Prevista</Label>
                  <Input
                    type="date"
                    value={formData.data_prevista || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, data_prevista: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data Conclusão</Label>
                  <Input
                    type="date"
                    value={formData.data_conclusao || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, data_conclusao: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva detalhadamente a pendência..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  <Check className="h-4 w-4 mr-1" />
                  {isSubmitting ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {pendencias.map((pendencia) => (
              <div key={pendencia.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {pendencia.tipo_equipamento === "tanque" ? "Tanque" : "Dolly"} {pendencia.numero_equipamento}
                      </h3>
                      <Badge className={getPrioridadeColor(pendencia.prioridade)}>
                        {pendencia.prioridade.charAt(0).toUpperCase() + pendencia.prioridade.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(pendencia.status)}>
                        {pendencia.status === "aberta"
                          ? "Aberta"
                          : pendencia.status === "em_andamento"
                            ? "Em Andamento"
                            : pendencia.status === "concluida"
                              ? "Concluída"
                              : "Cancelada"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Tipo:</strong> {pendencia.tipo_pendencia}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{pendencia.descricao}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                      <div>
                        <strong>Abertura:</strong> {formatDate(pendencia.data_abertura)}
                      </div>
                      {pendencia.data_prevista && (
                        <div>
                          <strong>Prevista:</strong> {formatDate(pendencia.data_prevista)}
                        </div>
                      )}
                      {pendencia.data_conclusao && (
                        <div>
                          <strong>Conclusão:</strong> {formatDate(pendencia.data_conclusao)}
                        </div>
                      )}
                      {pendencia.responsavel && (
                        <div>
                          <strong>Responsável:</strong> {pendencia.responsavel}
                        </div>
                      )}
                    </div>
                    {pendencia.observacoes && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Obs:</strong> {pendencia.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button onClick={() => startEdit(pendencia)} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() =>
                        handleDelete(pendencia.id!, `${pendencia.tipo_equipamento} ${pendencia.numero_equipamento}`)
                      }
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendencias.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">Nenhuma pendência cadastrada ainda</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
