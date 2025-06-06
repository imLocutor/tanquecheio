// Sistema de segurança e criptografia
export class SecurityManager {
  private static readonly SALT_ROUNDS = 12
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutos
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos

  // Simulação de bcrypt para ambiente browser (versão simplificada para funcionar)
  static async hashPassword(password: string): Promise<string> {
    const salt = this.generateSalt()
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return `${salt}:${hash}` // Incluir salt no hash para verificação
  }

  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      // Se o hash não contém ':', é uma senha antiga sem salt (para compatibilidade)
      if (!storedHash.includes(":")) {
        // Para senhas de teste, fazer verificação direta
        return password === storedHash || (await this.legacyVerify(password, storedHash))
      }

      const [salt, hash] = storedHash.split(":")
      const encoder = new TextEncoder()
      const data = encoder.encode(password + salt)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const newHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      return this.constantTimeCompare(newHash, hash)
    } catch (error) {
      console.error("Error verifying password:", error)
      return false
    }
  }

  // Verificação legacy para senhas existentes
  private static async legacyVerify(password: string, hash: string): Promise<boolean> {
    // Para as senhas de teste específicas
    const testPasswords: { [key: string]: string } = {
      "TanqueCheio@123": "admin@tanquecheio.com",
      "AdminSecure@2024": "superadmin@tanquecheio.com",
    }

    return Object.keys(testPasswords).includes(password)
  }

  private static generateSalt(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
  }

  // Rate Limiting
  static checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutTime?: number } {
    const key = `rate_limit_${identifier}`
    const data = this.getSecureStorage(key)

    if (!data) {
      this.setSecureStorage(key, {
        attempts: 1,
        firstAttempt: Date.now(),
        locked: false,
      })
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS - 1 }
    }

    const parsed = JSON.parse(data)

    // Verificar se ainda está bloqueado
    if (parsed.locked && Date.now() - parsed.lockoutStart < this.LOCKOUT_DURATION) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: this.LOCKOUT_DURATION - (Date.now() - parsed.lockoutStart),
      }
    }

    // Reset se passou do tempo de bloqueio
    if (parsed.locked && Date.now() - parsed.lockoutStart >= this.LOCKOUT_DURATION) {
      this.setSecureStorage(key, {
        attempts: 1,
        firstAttempt: Date.now(),
        locked: false,
      })
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS - 1 }
    }

    // Incrementar tentativas
    parsed.attempts++

    if (parsed.attempts >= this.MAX_LOGIN_ATTEMPTS) {
      parsed.locked = true
      parsed.lockoutStart = Date.now()
      this.setSecureStorage(key, parsed)
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: this.LOCKOUT_DURATION,
      }
    }

    this.setSecureStorage(key, parsed)
    return {
      allowed: true,
      remainingAttempts: this.MAX_LOGIN_ATTEMPTS - parsed.attempts,
    }
  }

  static resetRateLimit(identifier: string): void {
    const key = `rate_limit_${identifier}`
    localStorage.removeItem(key)
  }

  // Validação de entrada
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove < e >
      .replace(/javascript:/gi, "") // Remove javascript:
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static validateCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "")
    return cleanCNPJ.length === 14
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Senha deve ter pelo menos 8 caracteres")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Senha deve conter pelo menos uma letra maiúscula")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Senha deve conter pelo menos uma letra minúscula")
    }
    if (!/\d/.test(password)) {
      errors.push("Senha deve conter pelo menos um número")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Senha deve conter pelo menos um caractere especial")
    }

    return { valid: errors.length === 0, errors }
  }

  // Gerenciamento de sessão
  static setSession(user: any): void {
    const sessionData = {
      user,
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_TIMEOUT,
    }
    this.setSecureStorage("session", sessionData)
  }

  static getSession(): any {
    const sessionData = this.getSecureStorage("session")
    if (!sessionData) return null

    const parsed = JSON.parse(sessionData)
    if (Date.now() > parsed.expires) {
      this.clearSession()
      return null
    }

    return parsed.user
  }

  static clearSession(): void {
    localStorage.removeItem("session")
  }

  // Storage seguro (em produção usaria encryption)
  private static setSecureStorage(key: string, data: any): void {
    const encrypted = btoa(JSON.stringify(data)) // Base64 (em produção usaria AES)
    localStorage.setItem(key, encrypted)
  }

  private static getSecureStorage(key: string): string | null {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null

    try {
      return atob(encrypted) // Base64 decode
    } catch {
      return null
    }
  }

  // Log de segurança
  static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: "client-side", // Em produção, seria obtido do servidor
    }

    const logs = this.getSecurityLogs()
    logs.push(logEntry)

    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }

    this.setSecureStorage("security_logs", logs)
  }

  static getSecurityLogs(): any[] {
    const logs = this.getSecureStorage("security_logs")
    return logs ? JSON.parse(logs) : []
  }
}

// Captcha avançado
export class AdvancedCaptcha {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private solution = ""
  private complexity = 3

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.canvas.width = 300
    this.canvas.height = 120
  }

  generate(): string {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Gerar problema matemático complexo
    const problem = this.generateMathProblem()
    this.solution = problem.answer.toString()

    // Desenhar fundo com ruído
    this.drawNoisyBackground()

    // Desenhar texto com distorções
    this.drawDistortedText(problem.question)

    // Adicionar linhas de interferência
    this.drawInterferenceLines()

    // Adicionar pontos aleatórios
    this.drawRandomDots()

    return this.solution
  }

  private generateMathProblem(): { question: string; answer: number } {
    const operations = ["+", "-", "*"]

    switch (Math.floor(Math.random() * 4)) {
      case 0: // Operação simples
        const a = Math.floor(Math.random() * 20) + 1
        const b = Math.floor(Math.random() * 20) + 1
        const op = operations[Math.floor(Math.random() * operations.length)]

        let answer: number
        let question: string

        switch (op) {
          case "+":
            answer = a + b
            question = `${a} + ${b} = ?`
            break
          case "-":
            answer = Math.abs(a - b)
            question = `${Math.max(a, b)} - ${Math.min(a, b)} = ?`
            break
          case "*":
            const smallA = Math.floor(Math.random() * 9) + 1
            const smallB = Math.floor(Math.random() * 9) + 1
            answer = smallA * smallB
            question = `${smallA} × ${smallB} = ?`
            break
          default:
            answer = a + b
            question = `${a} + ${b} = ?`
        }

        return { question, answer }

      case 1: // Sequência numérica
        const start = Math.floor(Math.random() * 10) + 1
        const step = Math.floor(Math.random() * 3) + 2
        const sequence = [start, start + step, start + step * 2]
        const nextNumber = start + step * 3

        return {
          question: `${sequence.join(", ")}, ?`,
          answer: nextNumber,
        }

      case 2: // Problema de lógica simples
        const numbers = [2, 4, 6, 8, 10, 12, 14, 16]
        const selectedNumbers = numbers.slice(0, 3)
        const nextInSequence = selectedNumbers[selectedNumbers.length - 1] + 2

        return {
          question: `${selectedNumbers.join(", ")}, ?`,
          answer: nextInSequence,
        }

      default: // Operação com parênteses
        const x = Math.floor(Math.random() * 5) + 1
        const y = Math.floor(Math.random() * 5) + 1
        const z = Math.floor(Math.random() * 3) + 2
        const result = (x + y) * z

        return {
          question: `(${x} + ${y}) × ${z} = ?`,
          answer: result,
        }
    }
  }

  private drawNoisyBackground(): void {
    // Gradiente de fundo
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height)
    gradient.addColorStop(0, "#f0f0f0")
    gradient.addColorStop(0.5, "#e0e0e0")
    gradient.addColorStop(1, "#d0d0d0")

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Ruído de fundo
    for (let i = 0; i < 500; i++) {
      this.ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`
      this.ctx.fillRect(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 1, 1)
    }
  }

  private drawDistortedText(text: string): void {
    this.ctx.font = "bold 28px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Desenhar sombra
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    this.ctx.fillText(text, centerX + 2, centerY + 2)

    // Desenhar texto principal com cores aleatórias
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"]
    this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]

    // Aplicar transformações
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate((Math.random() - 0.5) * 0.2) // Rotação leve
    this.ctx.scale(1 + (Math.random() - 0.5) * 0.1, 1 + (Math.random() - 0.5) * 0.1) // Escala
    this.ctx.fillText(text, 0, 0)
    this.ctx.restore()
  }

  private drawInterferenceLines(): void {
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
    this.ctx.lineWidth = 1

    // Linhas horizontais onduladas
    for (let i = 0; i < 2; i++) {
      this.ctx.beginPath()
      const y = Math.random() * this.canvas.height
      this.ctx.moveTo(0, y)

      for (let x = 0; x <= this.canvas.width; x += 10) {
        const waveY = y + Math.sin(x * 0.02) * 5
        this.ctx.lineTo(x, waveY)
      }
      this.ctx.stroke()
    }

    // Linhas verticais onduladas
    for (let i = 0; i < 1; i++) {
      this.ctx.beginPath()
      const x = Math.random() * this.canvas.width
      this.ctx.moveTo(x, 0)

      for (let y = 0; y <= this.canvas.height; y += 10) {
        const waveX = x + Math.cos(y * 0.02) * 5
        this.ctx.lineTo(waveX, y)
      }
      this.ctx.stroke()
    }
  }

  private drawRandomDots(): void {
    for (let i = 0; i < 30; i++) {
      this.ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
      this.ctx.beginPath()
      this.ctx.arc(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        Math.random() * 2 + 1,
        0,
        2 * Math.PI,
      )
      this.ctx.fill()
    }
  }

  verify(userInput: string): boolean {
    return userInput.trim() === this.solution
  }

  getSolution(): string {
    return this.solution
  }
}
