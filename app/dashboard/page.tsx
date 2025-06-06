"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { db, type Posto, type HistoricoPreco } from "@/lib/database"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<Posto | null>(null)
  const [historico, setHistorico] = useState<HistoricoPreco[]>([])
  const [prices, setPrices] = useState({
    gasolinaComum: "",
    gasolinaAditivada: "",
    etanol: "",
    dieselS10: "",
    dieselComum: "",
    gnv: "",
  })

  useEffect(() => {
    const user = db.getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    setCurrentUser(user)
    setHistorico(db.getHistoricoByPostoId(user.id))

    // Carregar preços atuais
    setPrices({
      gasolinaComum: user.combustiveis.gasolinaComum.preco,
      gasolinaAditivada: user.combustiveis.gasolinaAditivada.preco,
      etanol: user.combustiveis.etanol.preco,
      dieselS10: user.combustiveis.dieselS10.preco,
      dieselComum: user.combustiveis.dieselComum.preco,
      gnv: user.combustiveis.gnv.preco,
    })
  }, [router])

  const handlePriceChange = (fuel: string, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [fuel]: value,
    }))
  }

  const handleSavePrices = () => {
    if (!currentUser) return

    try {
      // Atualizar preços no posto
      const updatedCombustiveis = { ...currentUser.combustiveis }
      Object.entries(prices).forEach(([tipo, preco]) => {
        if (updatedCombustiveis[tipo as keyof typeof updatedCombustiveis]) {
          updatedCombustiveis[tipo as keyof typeof updatedCombustiveis].preco = preco
        }
      })

      // Salvar no banco de dados
      const success = db.updatePosto(currentUser.id, {
        combustiveis: updatedCombustiveis,
      })

      if (success) {
        // Adicionar ao histórico
        const precosAtivos: any = {}
        Object.entries(prices).forEach(([tipo, preco]) => {
          if (currentUser.combustiveis[tipo as keyof typeof currentUser.combustiveis]?.ativo && preco) {
            precosAtivos[tipo] = preco
          }
        })

        if (Object.keys(precosAtivos).length > 0) {
          db.addHistoricoPreco(currentUser.id, precosAtivos)
        }

        // Atualizar usuário atual
        const updatedUser = db.getPostoById(currentUser.id)
        if (updatedUser) {
          setCurrentUser(updatedUser)
          db.setCurrentUser(updatedUser)
        }

        // Atualizar histórico
        setHistorico(db.getHistoricoByPostoId(currentUser.id))

        toast({
          title: "🎉 Preços atualizados com sucesso!",
          description: "Os novos valores já estão disponíveis para os clientes.",
        })
      } else {
        throw new Error("Falha ao atualizar preços")
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao atualizar preços",
        description: "Ocorreu um erro ao salvar os preços. Tente novamente.",
        variant: "destructive",
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatPrice = (price: string | undefined) => {
    return price ? `R$ ${price}` : "-"
  }

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
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-700 bg-gray-800 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden border-gray-600 text-white hover:bg-gray-700">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-gray-800 border-gray-700">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
              >
                <BarChart3 className="h-5 w-5" />📊 Dashboard
              </Link>
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <User className="h-5 w-5" />👤 Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <Settings className="h-5 w-5" />
                ⚙️ Configurações
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">⛽</span>
            <span className="text-orange-500">TanqueCheio</span> Combustível
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon" className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-8 flex items-center gap-2 rounded-full border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
              >
                <span className="hidden md:inline-flex">🏪 {currentUser.nome}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Link href="/dashboard/perfil">
                  <User className="mr-2 h-4 w-4" />
                  <span>👤 Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Link href="/dashboard/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>⚙️ Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>🚪 Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-gray-700 bg-gray-800 md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <nav className="grid gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
              >
                <BarChart3 className="h-5 w-5" />📊 Dashboard
              </Link>
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <User className="h-5 w-5" />👤 Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <Settings className="h-5 w-5" />
                ⚙️ Configurações
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">📊 Dashboard</h1>
              <p className="text-gray-400">Gerencie os preços dos combustíveis do seu posto.</p>
            </div>
            <div className="grid gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    💰 Atualizar Preços dos Combustíveis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Mantenha os preços atualizados para melhor visibilidade no aplicativo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentUser.combustiveis.gasolinaComum.ativo && (
                          <div className="space-y-2">
                            <label
                              htmlFor="gasolina-comum"
                              className="text-sm font-medium text-white flex items-center gap-2"
                            >
                              🔴 Gasolina Comum (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="gasolina-comum"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.gasolinaComum}
                                onChange={(e) => handlePriceChange("gasolinaComum", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {currentUser.combustiveis.gasolinaAditivada.ativo && (
                          <div className="space-y-2">
                            <label
                              htmlFor="gasolina-aditivada"
                              className="text-sm font-medium text-white flex items-center gap-2"
                            >
                              🔵 Gasolina Aditivada (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="gasolina-aditivada"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.gasolinaAditivada}
                                onChange={(e) => handlePriceChange("gasolinaAditivada", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {currentUser.combustiveis.etanol.ativo && (
                          <div className="space-y-2">
                            <label htmlFor="etanol" className="text-sm font-medium text-white flex items-center gap-2">
                              🟢 Etanol (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="etanol"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.etanol}
                                onChange={(e) => handlePriceChange("etanol", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {currentUser.combustiveis.dieselS10.ativo && (
                          <div className="space-y-2">
                            <label
                              htmlFor="diesel-s10"
                              className="text-sm font-medium text-white flex items-center gap-2"
                            >
                              🟡 Diesel S10 (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="diesel-s10"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.dieselS10}
                                onChange={(e) => handlePriceChange("dieselS10", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {currentUser.combustiveis.dieselComum.ativo && (
                          <div className="space-y-2">
                            <label
                              htmlFor="diesel-comum"
                              className="text-sm font-medium text-white flex items-center gap-2"
                            >
                              ⚫ Diesel Comum (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="diesel-comum"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.dieselComum}
                                onChange={(e) => handlePriceChange("dieselComum", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {currentUser.combustiveis.gnv.ativo && (
                          <div className="space-y-2">
                            <label htmlFor="gnv" className="text-sm font-medium text-white flex items-center gap-2">
                              🟣 GNV (R$)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">R$</span>
                              <Input
                                id="gnv"
                                className="pl-8 bg-gray-700 border-gray-600 text-white"
                                value={prices.gnv}
                                onChange={(e) => handlePriceChange("gnv", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSavePrices} className="bg-orange-500 hover:bg-orange-600 font-semibold">
                          💾 Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banner promocional estilo TanqueCheio */}
              <div className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">+ 25.000 lojas</h3>
                      <p className="text-green-100">Aproveite benefícios exclusivos</p>
                    </div>
                  </div>
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">Como funciona?</Button>
                </div>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">📈 Histórico de Preços</CardTitle>
                  <CardDescription className="text-gray-400">
                    Visualize as últimas atualizações de preços do seu posto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border border-gray-700">
                      <div className="grid grid-cols-6 gap-4 p-4 font-medium text-white bg-gray-700 rounded-t-md">
                        <div>📅 Data</div>
                        <div>🔴 Gasolina Comum</div>
                        <div>🔵 Gasolina Aditivada</div>
                        <div>🟢 Etanol</div>
                        <div>🟡 Diesel S10</div>
                        <div>🟣 GNV</div>
                      </div>
                      {historico.length > 0 ? (
                        historico.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-6 gap-4 border-t border-gray-700 p-4 text-gray-300"
                          >
                            <div>{formatDate(item.data)}</div>
                            <div>{formatPrice(item.precos.gasolinaComum)}</div>
                            <div>{formatPrice(item.precos.gasolinaAditivada)}</div>
                            <div>{formatPrice(item.precos.etanol)}</div>
                            <div>{formatPrice(item.precos.dieselS10)}</div>
                            <div>{formatPrice(item.precos.gnv)}</div>
                          </div>
                        ))
                      ) : (
                        <div className="border-t border-gray-700 p-8 text-center text-gray-400">
                          <div className="text-4xl mb-2">📊</div>
                          <p>Nenhum histórico de preços encontrado.</p>
                          <p className="text-sm">Atualize os preços para começar a ver o histórico.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
