"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CaptchaComponent } from "@/components/captcha"
import { db } from "@/lib/database"
import { SecurityManager } from "@/lib/security"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("informacoes")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaSolution, setCaptchaSolution] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
    combustiveis: {
      gasolinaComum: { ativo: true, preco: "5.49" },
      gasolinaAditivada: { ativo: true, preco: "5.79" },
      etanol: { ativo: true, preco: "3.89" },
      dieselS10: { ativo: true, preco: "6.29" },
      dieselComum: { ativo: false, preco: "" },
      gnv: { ativo: false, preco: "" },
    },
  })

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    }
    return value
  }

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
      } else {
        return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
      }
    }
    return value
  }

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, "$1-$2")
    }
    return value
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = SecurityManager.sanitizeInput(value)

    if (field === "cnpj") {
      formattedValue = formatCNPJ(formattedValue)
    } else if (field === "telefone") {
      formattedValue = formatTelefone(formattedValue)
    } else if (field === "cep") {
      formattedValue = formatCEP(formattedValue)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }))
  }

  const handleCombustivelChange = (tipo: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      combustiveis: {
        ...prev.combustiveis,
        [tipo]: {
          ...prev.combustiveis[tipo as keyof typeof prev.combustiveis],
          [field]: value,
        },
      },
    }))
  }

  const validateForm = () => {
    // Validação básica
    if (!formData.nome || !formData.cnpj || !formData.telefone || !formData.email || !formData.senha) {
      toast({
        title: "❌ Erro no cadastro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return false
    }

    // Validação de email
    if (!SecurityManager.validateEmail(formData.email)) {
      toast({
        title: "❌ Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      })
      return false
    }

    // Validação de senha
    const passwordValidation = SecurityManager.validatePassword(formData.senha)
    if (!passwordValidation.valid) {
      toast({
        title: "❌ Senha não atende aos critérios",
        description: passwordValidation.errors.join(", "),
        variant: "destructive",
      })
      return false
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "❌ Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return false
    }

    // Validação de CNPJ
    if (!SecurityManager.validateCNPJ(formData.cnpj)) {
      toast({
        title: "❌ CNPJ inválido",
        description: "CNPJ deve ter 14 dígitos.",
        variant: "destructive",
      })
      return false
    }

    const telefoneNumbers = formData.telefone.replace(/\D/g, "")
    if (telefoneNumbers.length < 10 || telefoneNumbers.length > 11) {
      toast({
        title: "❌ Telefone inválido",
        description: "Telefone deve ter 10 ou 11 dígitos.",
        variant: "destructive",
      })
      return false
    }

    // Verificar se email já existe
    if (db.isEmailExists(formData.email)) {
      toast({
        title: "❌ Email já cadastrado",
        description: "Este email já está sendo usado por outro posto.",
        variant: "destructive",
      })
      return false
    }

    // Verificar se CNPJ já existe
    if (db.isCnpjExists(formData.cnpj)) {
      toast({
        title: "❌ CNPJ já cadastrado",
        description: "Este CNPJ já está sendo usado por outro posto.",
        variant: "destructive",
      })
      return false
    }

    // Verificar captcha
    if (!captchaVerified) {
      toast({
        title: "❌ Verificação de segurança",
        description: "Por favor, complete a verificação de segurança.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Criar novo posto no "banco de dados"
      const novoPosto = await db.addPosto({
        nome: formData.nome,
        cnpj: formData.cnpj,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        endereco: {
          cep: formData.cep,
          estado: formData.estado,
          cidade: formData.cidade,
          bairro: formData.bairro,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
        },
        combustiveis: formData.combustiveis,
      })

      // Adicionar histórico inicial de preços
      const precosAtivos: any = {}
      Object.entries(formData.combustiveis).forEach(([tipo, dados]) => {
        if (dados.ativo && dados.preco) {
          precosAtivos[tipo] = dados.preco
        }
      })

      if (Object.keys(precosAtivos).length > 0) {
        db.addHistoricoPreco(novoPosto.id, precosAtivos)
      }

      // Fazer login automático
      db.setCurrentUser(novoPosto)

      setTimeout(() => {
        setLoading(false)
        toast({
          title: "🎉 Cadastro realizado com sucesso!",
          description: `Bem-vindo, ${formData.nome}! Você será redirecionado para o dashboard.`,
        })
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      setLoading(false)
      toast({
        title: "❌ Erro no cadastro",
        description: "Ocorreu um erro ao cadastrar o posto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const nextTab = () => {
    if (currentTab === "informacoes") {
      // Validar informações básicas antes de prosseguir
      if (
        !formData.nome ||
        !formData.cnpj ||
        !formData.telefone ||
        !formData.email ||
        !formData.senha ||
        !formData.confirmarSenha
      ) {
        toast({
          title: "❌ Campos obrigatórios",
          description: "Por favor, preencha todos os campos antes de continuar.",
          variant: "destructive",
        })
        return
      }

      // Validação de senha
      const passwordValidation = SecurityManager.validatePassword(formData.senha)
      if (!passwordValidation.valid) {
        toast({
          title: "❌ Senha não atende aos critérios",
          description: passwordValidation.errors.join(", "),
          variant: "destructive",
        })
        return
      }

      if (formData.senha !== formData.confirmarSenha) {
        toast({
          title: "❌ Erro nas senhas",
          description: "As senhas não coincidem.",
          variant: "destructive",
        })
        return
      }

      // Verificar duplicatas
      if (db.isEmailExists(formData.email)) {
        toast({
          title: "❌ Email já cadastrado",
          description: "Este email já está sendo usado por outro posto.",
          variant: "destructive",
        })
        return
      }

      if (db.isCnpjExists(formData.cnpj)) {
        toast({
          title: "❌ CNPJ já cadastrado",
          description: "Este CNPJ já está sendo usado por outro posto.",
          variant: "destructive",
        })
        return
      }

      setCurrentTab("endereco")
    } else if (currentTab === "endereco") {
      // Validar endereço antes de prosseguir
      if (
        !formData.cep ||
        !formData.estado ||
        !formData.cidade ||
        !formData.bairro ||
        !formData.rua ||
        !formData.numero
      ) {
        toast({
          title: "❌ Campos obrigatórios",
          description: "Por favor, preencha todos os campos de endereço antes de continuar.",
          variant: "destructive",
        })
        return
      }
      setCurrentTab("combustiveis")
    }
  }

  const prevTab = () => {
    if (currentTab === "endereco") {
      setCurrentTab("informacoes")
    } else if (currentTab === "combustiveis") {
      setCurrentTab("endereco")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container flex flex-col items-center justify-center min-h-screen py-10">
        <div className="w-full max-w-3xl">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />🏠 Voltar para a página inicial
            </Link>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Shield className="h-6 w-6" />🏪 Cadastro Seguro de Posto de Combustível
              </CardTitle>
              <CardDescription className="text-gray-400">
                Preencha as informações abaixo para cadastrar seu posto no sistema.
              </CardDescription>
            </CardHeader>
            <Tabs value={currentTab} className="w-full">
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
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-white">
                        🏪 Nome do Posto *
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Posto TanqueCheio"
                        required
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-white">
                        📄 CNPJ *
                      </Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        required
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange("cnpj", e.target.value)}
                        maxLength={18}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-white">
                        📞 Telefone *
                      </Label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        required
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        maxLength={15}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        📧 Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@exemplo.com"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        maxLength={254}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-white">
                        🔒 Senha *
                      </Label>
                      <Input
                        id="senha"
                        type="password"
                        required
                        value={formData.senha}
                        onChange={(e) => handleInputChange("senha", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        minLength={8}
                        maxLength={128}
                      />
                      <div className="text-xs text-gray-400">
                        A senha deve conter: 8+ caracteres, maiúscula, minúscula, número e símbolo
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha" className="text-white">
                        🔐 Confirmar Senha *
                      </Label>
                      <Input
                        id="confirmar-senha"
                        type="password"
                        required
                        value={formData.confirmarSenha}
                        onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        minLength={8}
                        maxLength={128}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => router.push("/")}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      ❌ Cancelar
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-orange-500 hover:bg-orange-600">
                      ➡️ Próximo
                    </Button>
                  </CardFooter>
                </TabsContent>
                <TabsContent value="endereco">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="cep" className="text-white">
                        📮 CEP *
                      </Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        required
                        value={formData.cep}
                        onChange={(e) => handleInputChange("cep", e.target.value)}
                        maxLength={9}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado" className="text-white">
                          🗺️ Estado *
                        </Label>
                        <Select
                          required
                          value={formData.estado}
                          onValueChange={(value) => handleInputChange("estado", value)}
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
                          🏙️ Cidade *
                        </Label>
                        <Input
                          id="cidade"
                          placeholder="Sua cidade"
                          required
                          value={formData.cidade}
                          onChange={(e) => handleInputChange("cidade", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro" className="text-white">
                        🏘️ Bairro *
                      </Label>
                      <Input
                        id="bairro"
                        placeholder="Seu bairro"
                        required
                        value={formData.bairro}
                        onChange={(e) => handleInputChange("bairro", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rua" className="text-white">
                        🛣️ Rua *
                      </Label>
                      <Input
                        id="rua"
                        placeholder="Nome da rua"
                        required
                        value={formData.rua}
                        onChange={(e) => handleInputChange("rua", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        maxLength={200}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero" className="text-white">
                          🔢 Número *
                        </Label>
                        <Input
                          id="numero"
                          placeholder="123"
                          required
                          value={formData.numero}
                          onChange={(e) => handleInputChange("numero", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complemento" className="text-white">
                          📝 Complemento
                        </Label>
                        <Input
                          id="complemento"
                          placeholder="Opcional"
                          value={formData.complemento}
                          onChange={(e) => handleInputChange("complemento", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={prevTab}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      ⬅️ Voltar
                    </Button>
                    <Button type="button" onClick={nextTab} className="bg-orange-500 hover:bg-orange-600">
                      ➡️ Próximo
                    </Button>
                  </CardFooter>
                </TabsContent>
                <TabsContent value="combustiveis">
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        ⛽ Combustíveis disponíveis no posto
                      </h3>
                      <p className="text-sm text-gray-400">
                        Selecione os combustíveis disponíveis e informe os preços atuais.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="gasolina-comum"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={formData.combustiveis.gasolinaComum.ativo}
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
                                value={formData.combustiveis.gasolinaComum.preco}
                                onChange={(e) => handleCombustivelChange("gasolinaComum", "preco", e.target.value)}
                                disabled={!formData.combustiveis.gasolinaComum.ativo}
                                maxLength={10}
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
                              checked={formData.combustiveis.gasolinaAditivada.ativo}
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
                                value={formData.combustiveis.gasolinaAditivada.preco}
                                onChange={(e) => handleCombustivelChange("gasolinaAditivada", "preco", e.target.value)}
                                disabled={!formData.combustiveis.gasolinaAditivada.ativo}
                                maxLength={10}
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
                              checked={formData.combustiveis.etanol.ativo}
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
                                value={formData.combustiveis.etanol.preco}
                                onChange={(e) => handleCombustivelChange("etanol", "preco", e.target.value)}
                                disabled={!formData.combustiveis.etanol.ativo}
                                maxLength={10}
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
                              checked={formData.combustiveis.dieselS10.ativo}
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
                                value={formData.combustiveis.dieselS10.preco}
                                onChange={(e) => handleCombustivelChange("dieselS10", "preco", e.target.value)}
                                disabled={!formData.combustiveis.dieselS10.ativo}
                                maxLength={10}
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
                              checked={formData.combustiveis.dieselComum.ativo}
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
                                value={formData.combustiveis.dieselComum.preco}
                                onChange={(e) => handleCombustivelChange("dieselComum", "preco", e.target.value)}
                                disabled={!formData.combustiveis.dieselComum.ativo}
                                maxLength={10}
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
                              checked={formData.combustiveis.gnv.ativo}
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
                                value={formData.combustiveis.gnv.preco}
                                onChange={(e) => handleCombustivelChange("gnv", "preco", e.target.value)}
                                disabled={!formData.combustiveis.gnv.ativo}
                                maxLength={10}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CaptchaComponent onVerify={setCaptchaVerified} onSolutionChange={setCaptchaSolution} />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={prevTab}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      ⬅️ Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !captchaVerified}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {loading ? "🔄 Cadastrando..." : "✅ Finalizar Cadastro"}
                    </Button>
                  </CardFooter>
                </TabsContent>
              </form>
            </Tabs>
          </Card>

          {/* Indicador de segurança */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Dados protegidos com criptografia de nível militar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
