"use client"

import { useState, useEffect } from "react"
import { useToast } from "@chakra-ui/react"
import { api } from "../services/api"
import type { TanqueType } from "../types/TanqueType"

export function useTanquesDisponiveis() {
  const [tanques, setTanques] = useState<TanqueType[]>([])
  const toast = useToast()

  useEffect(() => {
    getTanques()
  }, [])

  async function getTanques() {
    try {
      const response = await api.get<TanqueType[]>("/tanques")
      setTanques(response.data)
    } catch (error) {
      toast({
        title: "Erro ao buscar tanques",
        description: "Ocorreu um erro ao buscar os tanques disponíveis.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  async function addTanque(tanque: Omit<TanqueType, "id" | "created_at" | "updated_at">) {
    try {
      // --- NOVA LÓGICA DE DUPLICIDADE ---
      const existingTanque = tanques.find((t) => t.numero_tanque === tanque.numero_tanque)

      if (existingTanque) {
        // Atualiza o tanque existente em vez de lançar erro
        console.info(`🔄 Tanque ${tanque.numero_tanque} já existia — realizando atualização automática`)
        // Reaproveita a função updateTanque (precisa do id real)
        return await updateTanque(existingTanque.id!, {
          ...existingTanque,
          ...tanque,
          updated_at: new Date().toISOString(),
        })
      }

      const response = await api.post<TanqueType>("/tanques", {
        ...tanque,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setTanques([...tanques, response.data])

      toast({
        title: "Tanque adicionado",
        description: `Tanque ${tanque.numero_tanque} adicionado com sucesso.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      return response.data
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar tanque",
        description: error?.response?.data?.message || "Ocorreu um erro ao adicionar o tanque.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return null
    }
  }

  async function updateTanque(id: string, tanque: TanqueType) {
    try {
      const response = await api.put<TanqueType>(`/tanques/${id}`, tanque)

      setTanques(tanques.map((t) => (t.id === id ? response.data : t)))

      toast({
        title: "Tanque atualizado",
        description: `Tanque ${tanque.numero_tanque} atualizado com sucesso.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      return response.data
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tanque",
        description: error?.response?.data?.message || "Ocorreu um erro ao atualizar o tanque.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return null
    }
  }

  async function deleteTanque(id: string) {
    try {
      await api.delete(`/tanques/${id}`)
      setTanques(tanques.filter((tanque) => tanque.id !== id))

      toast({
        title: "Tanque removido",
        description: "Tanque removido com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao remover tanque",
        description: error?.response?.data?.message || "Ocorreu um erro ao remover o tanque.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return { tanques, addTanque, updateTanque, deleteTanque }
}
