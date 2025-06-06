"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Configurações salvas com sucesso!",
        description: "Suas preferências foram atualizadas.",
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <User className="h-5 w-5" />
                Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
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
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-700"
              >
                <User className="h-5 w-5" />
                Perfil do Posto
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-white transition-all hover:bg-orange-600"
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
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-gray-500">Gerencie as configurações da sua conta.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Segurança</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gerencie as configurações de segurança da sua conta.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual" className="text-white">
                        Senha Atual
                      </Label>
                      <Input id="senha-atual" type="password" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova-senha" className="text-white">
                        Nova Senha
                      </Label>
                      <Input id="nova-senha" type="password" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha" className="text-white">
                        Confirmar Nova Senha
                      </Label>
                      <Input id="confirmar-senha" type="password" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" className="bg-orange-500 hover:bg-orange-600">
                      Alterar Senha
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Notificações</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure como você deseja receber notificações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notificacoes" className="text-white">
                          Notificações por Email
                        </Label>
                        <p className="text-sm text-muted-foreground">Receba atualizações importantes por email.</p>
                      </div>
                      <Switch id="email-notificacoes" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notificacoes" className="text-white">
                          Notificações por SMS
                        </Label>
                        <p className="text-sm text-muted-foreground">Receba alertas importantes por SMS.</p>
                      </div>
                      <Switch id="sms-notificacoes" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Tipos de Notificações</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="atualizacoes" defaultChecked />
                          <label
                            htmlFor="atualizacoes"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Atualizações do sistema
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="precos" defaultChecked />
                          <label
                            htmlFor="precos"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Alterações de preços
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="marketing" />
                          <label
                            htmlFor="marketing"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Marketing e promoções
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Usuários e Permissões</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gerencie os usuários que têm acesso ao seu posto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border border-gray-700">
                        <div className="grid grid-cols-3 gap-4 p-4 font-medium text-white bg-gray-700 rounded-t-md">
                          <div>Usuário</div>
                          <div>Email</div>
                          <div>Função</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-700 p-4 text-gray-300">
                          <div>Admin Principal</div>
                          <div>admin@postoexemplo.com</div>
                          <div>Administrador</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-700 p-4 text-gray-300">
                          <div>João Silva</div>
                          <div>joao@postoexemplo.com</div>
                          <div>Gerente</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-700 p-4 text-gray-300">
                          <div>Maria Souza</div>
                          <div>maria@postoexemplo.com</div>
                          <div>Operador</div>
                        </div>
                      </div>
                      <Button variant="outline" className="border-gray-600 bg-gray-700 text-white hover:bg-gray-600">
                        Adicionar Usuário
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                    {loading ? "Salvando..." : "Salvar Todas as Configurações"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
