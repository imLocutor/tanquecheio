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
import { useToast } from "@/hooks/use-toast"
import { CaptchaComponent } from "@/components/captcha"
import { db } from "@/lib/database"
import { SecurityManager } from "@/lib/security"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaSolution, setCaptchaSolution] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = SecurityManager.sanitizeInput(value)
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      toast({
        title: "❌ Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      })
      return false
    }

    if (!SecurityManager.validateEmail(formData.email)) {
      toast({
        title: "❌ Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.senha.trim()) {
      toast({
        title: "❌ Campo obrigatório",
        description: "Por favor, insira sua senha.",
        variant: "destructive",
      })
      return false
    }

    if (formData.senha.length < 6) {
      toast({
        title: "❌ Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return false
    }

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
      const user = await db.login(formData.email, formData.senha)

      if (user) {
        toast({
          title: "🎉 Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${user.nome}!`,
        })

        // Pequeno delay para mostrar o toast
        setTimeout(() => {
          setLoading(false)

          // Redirecionar com base no tipo de usuário
          if ("isAdmin" in user && user.isAdmin) {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }, 1000)
      } else {
        setLoading(false)
        toast({
          title: "❌ Erro no login",
          description: "Email ou senha incorretos. Verifique suas credenciais.",
          variant: "destructive",
        })

        // Regenerar captcha após falha no login
        setCaptchaVerified(false)
      }
    } catch (error) {
      setLoading(false)
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao fazer login."
      toast({
        title: "❌ Erro no login",
        description: errorMessage,
        variant: "destructive",
      })

      // Regenerar captcha após erro
      setCaptchaVerified(false)
    }
  }

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid)
    if (isValid) {
      toast({
        title: "✅ Captcha verificado",
        description: "Verificação de segurança concluída!",
      })
    }
  }

  const isFormValid = formData.email.trim() && formData.senha.trim() && captchaVerified

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container flex flex-col items-center justify-center min-h-screen py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />🏠 Voltar para a página inicial
            </Link>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🔑</div>
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Login Seguro
              </CardTitle>
              <CardDescription className="text-gray-400">
                Entre com suas credenciais para acessar o dashboard.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    📧 Email
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha" className="text-white">
                      🔒 Senha
                    </Label>
                    <Link href="/esqueci-senha" className="text-xs text-orange-500 hover:text-orange-400">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="senha"
                    type="password"
                    required
                    value={formData.senha}
                    onChange={(e) => handleInputChange("senha", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    maxLength={128}
                  />
                </div>

                <CaptchaComponent onVerify={handleCaptchaVerify} onSolutionChange={setCaptchaSolution} />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className={`w-full font-semibold transition-all ${
                    isFormValid && !loading ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid || loading}
                >
                  {loading ? "🔄 Entrando..." : isFormValid ? "🚀 Entrar" : "⚠️ Complete todos os campos"}
                </Button>

                {/* Status do formulário */}
                <div className="text-center text-xs text-gray-400">
                  <div className="flex items-center justify-center gap-4">
                    <span className={formData.email.trim() ? "text-green-400" : "text-gray-500"}>
                      {formData.email.trim() ? "✅" : "⭕"} Email
                    </span>
                    <span className={formData.senha.trim() ? "text-green-400" : "text-gray-500"}>
                      {formData.senha.trim() ? "✅" : "⭕"} Senha
                    </span>
                    <span className={captchaVerified ? "text-green-400" : "text-gray-500"}>
                      {captchaVerified ? "✅" : "⭕"} Captcha
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  Não tem uma conta?{" "}
                  <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                    📝 Cadastre-se
                  </Link>
                </div>
                <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
                  <p className="mb-2">
                    🧪 <strong>Contas de teste:</strong>
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="font-medium text-gray-400">Posto:</p>
                      <p>📧 admin@tanquecheio.com</p>
                      <p>🔒 TanqueCheio@123</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Administrador:</p>
                      <p>📧 superadmin@tanquecheio.com</p>
                      <p>🔒 AdminSecure@2024</p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Indicador de segurança */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Conexão protegida com criptografia avançada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
