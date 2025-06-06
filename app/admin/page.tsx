"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { db, type Admin, type Posto } from "@/lib/database"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)
  const [postos, setPostos] = useState<Posto[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postoToDelete, setPostoToDelete] = useState<Posto | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const user = db.getCurrentUser()
    if (!user || !("isAdmin" in user)) {
      toast({
        title: "❌ Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setCurrentUser(user as Admin)
    loadPostos()
  }, [router, toast])

  const loadPostos = () => {
    const allPostos = db.getPostos()
    setPostos(allPostos)
  }

  const handleDeletePosto = (posto: Posto) => {
    setPostoToDelete(posto)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePosto = () => {
    if (!postoToDelete) return

    try {
      const success = db.deletePosto(postoToDelete.id)
      if (success) {
        toast({
          title: "✅ Posto removido",
          description: `O posto ${postoToDelete.nome} foi removido com sucesso.`,
        })
        loadPostos()
      } else {
        throw new Error("Falha ao remover posto")
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao remover posto",
        description: "Ocorreu um erro ao remover o posto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setPostoToDelete(null)
    }
  }

  const handleLogout = () => {
    db.logout()
    router.push("/")
    toast({
      title: "👋 Logout realizado",
      description: "Você foi desconectado com sucesso.",
    })
  }

  const filteredPostos = postos.filter(
    (posto) =>
      posto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posto.cnpj.includes(searchTerm) ||
      posto.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-700 bg-gray-800 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">⛽</span>
            <span className="text-orange-500">TanqueCheio</span> Admin
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Logado como <span className="font-medium text-white">{currentUser.nome}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-8 w-8" /> Painel de Administração
            </h1>
            <p className="text-gray-400 mt-1">Gerencie todos os postos cadastrados no sistema.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o site
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Postos Cadastrados</CardTitle>
            <CardDescription className="text-gray-400">
              Total de {postos.length} postos cadastrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Buscar por nome, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="rounded-md border border-gray-700 overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium text-white bg-gray-700">
                <div>Nome</div>
                <div>CNPJ</div>
                <div>Email</div>
                <div>Telefone</div>
                <div>Data de Cadastro</div>
                <div className="text-right">Ações</div>
              </div>

              {filteredPostos.length > 0 ? (
                filteredPostos.map((posto) => (
                  <div key={posto.id} className="grid grid-cols-6 gap-4 border-t border-gray-700 p-4 text-gray-300">
                    <div className="truncate">{posto.nome}</div>
                    <div>{posto.cnpj}</div>
                    <div className="truncate">{posto.email}</div>
                    <div>{posto.telefone}</div>
                    <div>{new Date(posto.dataCadastro).toLocaleDateString("pt-BR")}</div>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/posto/${posto.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-800 bg-red-900/30 text-red-400 hover:bg-red-900/50"
                        onClick={() => handleDeletePosto(posto)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-t border-gray-700 p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>Nenhum posto encontrado.</p>
                  {searchTerm && <p className="text-sm mt-1">Tente usar termos diferentes na busca.</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas</CardTitle>
            <CardDescription className="text-gray-400">Visão geral do sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-semibold text-white mb-2">Total de Postos</h3>
                <p className="text-blue-100 text-2xl font-bold">{postos.length}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">Histórico de Preços</h3>
                <p className="text-green-100 text-2xl font-bold">{db.getHistorico().length}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-white mb-2">Último Cadastro</h3>
                <p className="text-purple-100 text-sm">
                  {postos.length > 0
                    ? new Date(
                        postos.reduce((latest, posto) =>
                          new Date(posto.dataCadastro) > new Date(latest.dataCadastro) ? posto : latest,
                        ).dataCadastro,
                      ).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Nenhum posto cadastrado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o posto {postoToDelete?.nome}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePosto}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
