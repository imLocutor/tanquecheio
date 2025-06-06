"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { db, type Admin, type Posto } from "@/lib/database"

export default function EditPostoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)
  const [posto, setPosto] = useState<Posto | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("informacoes")

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

    // Carregar dados do posto
    const postoId = params.id as string
    const postoData = db.getPostoById(postoId)
    if (!postoData) {
      toast({
        title: "❌ Posto não encontrado",
        description: "O posto solicitado não foi encontrado.",
        variant: "destructive",
      })
      router.push("/admin")
      return
    }

    setPosto(postoData)
  }, [params.id, router, toast])

  const handleInputChange = (field: string, value: string) => {
    if (!posto) return

    setPosto((prev) => {
      if (!prev) return prev

      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        }
      }

      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleCombustivelChange = (tipo: string, field: string, value: string | boolean) => {
    if (!posto) return

    setPosto((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        combustiveis: {
          ...prev.combustiveis,
          [tipo]: {
            ...prev.combustiveis[tipo as keyof typeof prev.combustiveis],
            [field]: value,
          },
        },
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!posto) return

    setLoading(true)

    try {
      const success = db.updatePosto(posto.id, posto)
      if (success) {
        toast({
          title: "✅ Posto atualizado",
          description: "As informações do posto foram atualizadas com sucesso.",
        })
      } else {
        throw new Error("Falha ao atualizar posto")
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao atualizar posto",
        description: "Ocorreu um erro ao atualizar as informações do posto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!posto || !currentUser) {
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
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
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
            onClick={() => {
              db.logout()
              router.push("/")
            }}
            className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Editar Posto</h1>
            <p className="text-gray-400 mt-1">Edite as informações do posto {posto.nome}.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline" className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o painel
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="informacoes" className="data-[state=active]:bg-orange-500">
                📋 Informações
              </TabsTrigger>
              <TabsTrigger value="endereco" className="data-[state=active]:bg-orange-500">
                📍 Endereço
              </TabsTrigger>
              <TabsTrigger value="combustiveis" className="data-[state=active]:bg-orange-500">
                ⛽ Combustíveis
              </TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <TabsContent value="informacoes">
                <CardHeader>
                  <CardTitle className="text-white">Informações Básicas</CardTitle>
                  <CardDescription className="text-gray-400">
                    Edite as informações básicas do posto de combustível.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-white">
                      🏪 Nome do Posto
                    </Label>
                    <Input
                      id="nome"
                      value={posto.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-white">
                      📄 CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      value={posto.cnpj}
                      onChange={(e) => handleInputChange("cnpj", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-white">
                      📞 Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={posto.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      📧 Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={posto.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-white">
                      🔒 Senha
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      value={posto.senha}
                      onChange={(e) => handleInputChange("senha", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin")}
                    className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="endereco">
                <CardHeader>
                  <CardTitle className="text-white">Endereço</CardTitle>
                  <CardDescription className="text-gray-400">
                    Edite as informações de endereço do posto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="text-white">
                      📮 CEP
                    </Label>
                    <Input
                      id="cep"
                      value={posto.endereco.cep}
                      onChange={(e) => handleInputChange("endereco.cep", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-white">
                        🗺️ Estado
                      </Label>
                      <Select
                        value={posto.endereco.estado}
                        onValueChange={(value) => handleInputChange("endereco.estado", value)}
                      >
                        <SelectTrigger id="estado" className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="ac">Acre</SelectItem>
                          <SelectItem value="al">Alagoas</SelectItem>
                          <SelectItem value="ap">Amapá</SelectItem>
                          <SelectItem value="am">Amazonas</SelectItem>
                          <SelectItem value="ba">Bahia</SelectItem>
                          <SelectItem value="ce">Ceará</SelectItem>
                          <SelectItem value="df">Distrito Federal</SelectItem>
                          <SelectItem value="es">Espírito Santo</SelectItem>
                          <SelectItem value="go">Goiás</SelectItem>
                          <SelectItem value="ma">Maranhão</SelectItem>
                          <SelectItem value="mt">Mato Grosso</SelectItem>
                          <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="mg">Minas Gerais</SelectItem>
                          <SelectItem value="pa">Pará</SelectItem>
                          <SelectItem value="pb">Paraíba</SelectItem>
                          <SelectItem value="pr">Paraná</SelectItem>
                          <SelectItem value="pe">Pernambuco</SelectItem>
                          <SelectItem value="pi">Piauí</SelectItem>
                          <SelectItem value="rj">Rio de Janeiro</SelectItem>
                          <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                          <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                          <SelectItem value="ro">Rondônia</SelectItem>
                          <SelectItem value="rr">Roraima</SelectItem>
                          <SelectItem value="sc">Santa Catarina</SelectItem>
                          <SelectItem value="sp">São Paulo</SelectItem>
                          <SelectItem value="se">Sergipe</SelectItem>
                          <SelectItem value="to">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-white">
                        🏙️ Cidade
                      </Label>
                      <Input
                        id="cidade"
                        value={posto.endereco.cidade}
                        onChange={(e) => handleInputChange("endereco.cidade", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro" className="text-white">
                      🏘️ Bairro
                    </Label>
                    <Input
                      id="bairro"
                      value={posto.endereco.bairro}
                      onChange={(e) => handleInputChange("endereco.bairro", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rua" className="text-white">
                      🛣️ Rua
                    </Label>
                    <Input
                      id="rua"
                      value={posto.endereco.rua}
                      onChange={(e) => handleInputChange("endereco.rua", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero" className="text-white">
                        🔢 Número
                      </Label>
                      <Input
                        id="numero"
                        value={posto.endereco.numero}
                        onChange={(e) => handleInputChange("endereco.numero", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento" className="text-white">
                        📝 Complemento
                      </Label>
                      <Input
                        id="complemento"
                        value={posto.endereco.complemento || ""}
                        onChange={(e) => handleInputChange("endereco.complemento", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin")}
                    className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="combustiveis">
                <CardHeader>
                  <CardTitle className="text-white">Combustíveis</CardTitle>
                  <CardDescription className="text-gray-400">
                    Edite os combustíveis disponíveis e seus preços.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="gasolina-comum"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.gasolinaComum.ativo}
                            onChange={(e) => handleCombustivelChange("gasolinaComum", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="gasolina-comum" className="text-white font-medium">
                            🔴 Gasolina Comum
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.gasolinaComum.preco}
                              onChange={(e) => handleCombustivelChange("gasolinaComum", "preco", e.target.value)}
                              disabled={!posto.combustiveis.gasolinaComum.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="gasolina-aditivada"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.gasolinaAditivada.ativo}
                            onChange={(e) => handleCombustivelChange("gasolinaAditivada", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="gasolina-aditivada" className="text-white font-medium">
                            🔵 Gasolina Aditivada
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.gasolinaAditivada.preco}
                              onChange={(e) => handleCombustivelChange("gasolinaAditivada", "preco", e.target.value)}
                              disabled={!posto.combustiveis.gasolinaAditivada.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="etanol"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.etanol.ativo}
                            onChange={(e) => handleCombustivelChange("etanol", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="etanol" className="text-white font-medium">
                            🟢 Etanol
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.etanol.preco}
                              onChange={(e) => handleCombustivelChange("etanol", "preco", e.target.value)}
                              disabled={!posto.combustiveis.etanol.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="diesel-s10"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.dieselS10.ativo}
                            onChange={(e) => handleCombustivelChange("dieselS10", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="diesel-s10" className="text-white font-medium">
                            🟡 Diesel S10
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.dieselS10.preco}
                              onChange={(e) => handleCombustivelChange("dieselS10", "preco", e.target.value)}
                              disabled={!posto.combustiveis.dieselS10.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="diesel-comum"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.dieselComum.ativo}
                            onChange={(e) => handleCombustivelChange("dieselComum", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="diesel-comum" className="text-white font-medium">
                            ⚫ Diesel Comum
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.dieselComum.preco}
                              onChange={(e) => handleCombustivelChange("dieselComum", "preco", e.target.value)}
                              disabled={!posto.combustiveis.dieselComum.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="gnv"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={posto.combustiveis.gnv.ativo}
                            onChange={(e) => handleCombustivelChange("gnv", "ativo", e.target.checked)}
                          />
                          <Label htmlFor="gnv" className="text-white font-medium">
                            🟣 GNV
                          </Label>
                        </div>
                        <div className="w-24">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                            <Input
                              className="pl-8 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="0,00"
                              value={posto.combustiveis.gnv.preco}
                              onChange={(e) => handleCombustivelChange("gnv", "preco", e.target.value)}
                              disabled={!posto.combustiveis.gnv.ativo}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin")}
                    className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </TabsContent>
            </form>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}
