"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdvancedCaptcha } from "@/lib/security"

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  onSolutionChange: (solution: string) => void
}

export function CaptchaComponent({ onVerify, onSolutionChange }: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captcha, setCaptcha] = useState<AdvancedCaptcha | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showError, setShowError] = useState(false)
  const maxAttempts = 3

  useEffect(() => {
    if (canvasRef.current) {
      const newCaptcha = new AdvancedCaptcha(canvasRef.current)
      const solution = newCaptcha.generate()
      setCaptcha(newCaptcha)
      onSolutionChange(solution)
    }
  }, [onSolutionChange])

  const regenerateCaptcha = () => {
    if (captcha && canvasRef.current) {
      const solution = captcha.generate()
      setUserInput("")
      setIsVerified(false)
      setAttempts(0)
      setShowError(false)
      onSolutionChange(solution)
      onVerify(false)
    }
  }

  const verifyCaptcha = () => {
    if (!captcha || !userInput.trim()) {
      setShowError(true)
      return
    }

    const isValid = captcha.verify(userInput)
    setIsVerified(isValid)
    setShowError(!isValid)
    onVerify(isValid)

    if (!isValid) {
      setAttempts((prev) => prev + 1)
      if (attempts + 1 >= maxAttempts) {
        setTimeout(() => {
          regenerateCaptcha()
        }, 1000)
      }
    }
  }

  const handleInputChange = (value: string) => {
    // Permitir apenas números
    const numericValue = value.replace(/[^0-9]/g, "")
    setUserInput(numericValue)
    setShowError(false)

    // Reset verification status when user changes input
    if (isVerified) {
      setIsVerified(false)
      onVerify(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim() && !isVerified) {
      verifyCaptcha()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">🤖 Verificação de Segurança</Label>
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-gray-600 rounded-md bg-white"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={regenerateCaptcha}
              className="absolute top-2 right-2 border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="w-full max-w-xs space-y-2">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Digite a resposta"
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                maxLength={10}
                disabled={isVerified}
              />
              <Button
                type="button"
                onClick={verifyCaptcha}
                disabled={!userInput.trim() || isVerified}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
              >
                {isVerified ? "✅" : "✓"}
              </Button>
            </div>

            {isVerified && (
              <div className="text-green-400 text-sm flex items-center justify-center">
                ✅ Verificação concluída com sucesso!
              </div>
            )}

            {showError && !isVerified && userInput.trim() && (
              <div className="text-red-400 text-sm text-center">
                ❌ Resposta incorreta. Tentativas restantes: {maxAttempts - attempts}
              </div>
            )}

            {attempts >= maxAttempts && (
              <div className="text-yellow-400 text-sm text-center">🔄 Novo desafio gerado. Tente novamente.</div>
            )}

            {!userInput.trim() && showError && (
              <div className="text-red-400 text-sm text-center">⚠️ Por favor, digite uma resposta</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
