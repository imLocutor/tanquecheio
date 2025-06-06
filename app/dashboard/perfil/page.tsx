"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "As informações do seu posto foram atualizadas.",
      })
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-700 bg-gray-800 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-gray-800 border-gray-700">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
              >
                <User className="h-5 w-5" />
                Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <Settings className="h-5 w-5" />
                Configurações
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
                <span className="hidden md:inline-flex">Posto Exemplo</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-white">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Link href="/dashboard/perfil">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Link href="/dashboard/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </Link>
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
              >
                <User className="h-5 w-5" />
                Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl font-bold">Perfil do Posto</h1>
              <p className="text-gray-500">Gerencie as informações do seu posto de combustível.</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <Tabs defaultValue="informacoes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                </TabsList>
                <form onSubmit={handleSubmit}>
                  <TabsContent value="informacoes">
                    <CardHeader>
                      <CardTitle className="text-white">Informações Básicas</CardTitle>
                      <CardDescription className="text-gray-400">
                        Atualize as informações básicas do seu posto de combustível.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-white">
                          Nome do Posto
                        </Label>
                        <Input
                          id="nome"
                          defaultValue="Posto Exemplo"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-white">
                          CNPJ
                        </Label>
                        <Input
                          id="cnpj"
                          defaultValue="12.345.678/0001-90"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-white">
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          defaultValue="(11) 98765-4321"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="contato@postoexemplo.com"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horario" className="text-white">
                          Horário de Funcionamento
                        </Label>
                        <Input
                          id="horario"
                          defaultValue="24 horas"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        type="button"
                        className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                        {loading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </CardFooter>
                  </TabsContent>
                  <TabsContent value="endereco">
                    <CardHeader>
                      <CardTitle className="text-white">Endereço</CardTitle>
                      <CardDescription className="text-gray-400">
                        Atualize as informações de endereço do seu posto.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep" className="text-white">
                          CEP
                        </Label>
                        <Input
                          id="cep"
                          defaultValue="01234-567"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="estado" className="text-white">
                            Estado
                          </Label>
                          <Select defaultValue="sp">
                            <SelectTrigger id="estado" className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="sp">São Paulo</SelectItem>
                              <SelectItem value="rj">Rio de Janeiro</SelectItem>
                              <SelectItem value="mg">Minas Gerais</SelectItem>
                              <SelectItem value="es">Espírito Santo</SelectItem>
                              {/* Adicionar outros estados */}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cidade" className="text-white">
                            Cidade
                          </Label>
                          <Input
                            id="cidade"
                            defaultValue="São Paulo"
                            required
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro" className="text-white">
                          Bairro
                        </Label>
                        <Input
                          id="bairro"
                          defaultValue="Centro"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rua" className="text-white">
                          Rua
                        </Label>
                        <Input
                          id="rua"
                          defaultValue="Avenida Paulista"
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="numero" className="text-white">
                            Número
                          </Label>
                          <Input
                            id="numero"
                            defaultValue="1000"
                            required
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complemento" className="text-white">
                            Complemento
                          </Label>
                          <Input
                            id="complemento"
                            defaultValue="Esquina"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        type="button"
                        className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                        {loading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </CardFooter>
                  </TabsContent>
                </form>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
