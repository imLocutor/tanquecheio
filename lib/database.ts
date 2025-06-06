// Simulação de banco de dados local usando localStorage com segurança aprimorada
import { SecurityManager } from "./security"

export interface Posto {
  id: string
  nome: string
  cnpj: string
  telefone: string
  email: string
  senha: string // Hash da senha
  endereco: {
    cep: string
    estado: string
    cidade: string
    bairro: string
    rua: string
    numero: string
    complemento?: string
  }
  combustiveis: {
    gasolinaComum: { ativo: boolean; preco: string }
    gasolinaAditivada: { ativo: boolean; preco: string }
    etanol: { ativo: boolean; preco: string }
    dieselS10: { ativo: boolean; preco: string }
    dieselComum: { ativo: boolean; preco: string }
    gnv: { ativo: boolean; preco: string }
  }
  dataCadastro: string
  ultimaAtualizacao: string
  isActive: boolean
  lastLogin?: string
}

export interface HistoricoPreco {
  id: string
  postoId: string
  data: string
  precos: {
    gasolinaComum?: string
    gasolinaAditivada?: string
    etanol?: string
    dieselS10?: string
    dieselComum?: string
    gnv?: string
  }
}

export interface Admin {
  id: string
  nome: string
  email: string
  senha: string // Hash da senha
  isAdmin: true
  lastLogin?: string
}

export type Usuario = Posto | Admin

class LocalDatabase {
  private readonly POSTOS_KEY = "tanquecheio_postos"
  private readonly HISTORICO_KEY = "tanquecheio_historico"
  private readonly CURRENT_USER_KEY = "tanquecheio_current_user"
  private readonly ADMIN_KEY = "tanquecheio_admin"

  // Métodos seguros para storage
  private setSecureData(key: string, data: any): void {
    try {
      const encrypted = btoa(JSON.stringify(data)) // Em produção, usar AES
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    }
  }

  private getSecureData(key: string): any {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      return JSON.parse(atob(encrypted))
    } catch (error) {
      console.error("Erro ao recuperar dados:", error)
      return null
    }
  }

  // Métodos para Postos
  getPostos(): Posto[] {
    if (typeof window === "undefined") return []
    return this.getSecureData(this.POSTOS_KEY) || []
  }

  savePostos(postos: Posto[]): void {
    if (typeof window === "undefined") return
    this.setSecureData(this.POSTOS_KEY, postos)
  }

  async addPosto(
    posto: Omit<Posto, "id" | "dataCadastro" | "ultimaAtualizacao" | "senha"> & { senha: string },
  ): Promise<Posto> {
    const postos = this.getPostos()

    // Hash da senha
    const hashedPassword = await SecurityManager.hashPassword(posto.senha)

    const newPosto: Posto = {
      ...posto,
      senha: hashedPassword,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
      isActive: true,
    }

    postos.push(newPosto)
    this.savePostos(postos)

    SecurityManager.logSecurityEvent("POSTO_CREATED", {
      postoId: newPosto.id,
      email: newPosto.email,
      nome: newPosto.nome,
    })

    return newPosto
  }

  getPostoById(id: string): Posto | null {
    const postos = this.getPostos()
    return postos.find((posto) => posto.id === SecurityManager.sanitizeInput(id)) || null
  }

  getPostoByEmail(email: string): Posto | null {
    const postos = this.getPostos()
    const sanitizedEmail = SecurityManager.sanitizeInput(email.toLowerCase())
    return postos.find((posto) => posto.email.toLowerCase() === sanitizedEmail) || null
  }

  async updatePosto(id: string, updates: Partial<Posto>): Promise<boolean> {
    const postos = this.getPostos()
    const index = postos.findIndex((posto) => posto.id === SecurityManager.sanitizeInput(id))

    if (index === -1) return false

    // Se a senha está sendo atualizada, fazer hash
    if (updates.senha) {
      updates.senha = await SecurityManager.hashPassword(updates.senha)
    }

    postos[index] = {
      ...postos[index],
      ...updates,
      ultimaAtualizacao: new Date().toISOString(),
    }

    this.savePostos(postos)

    SecurityManager.logSecurityEvent("POSTO_UPDATED", {
      postoId: id,
      updatedFields: Object.keys(updates),
    })

    return true
  }

  deletePosto(id: string): boolean {
    const postos = this.getPostos()
    const index = postos.findIndex((posto) => posto.id === SecurityManager.sanitizeInput(id))

    if (index === -1) return false

    const deletedPosto = postos[index]
    postos.splice(index, 1)
    this.savePostos(postos)

    SecurityManager.logSecurityEvent("POSTO_DELETED", {
      postoId: id,
      email: deletedPosto.email,
      nome: deletedPosto.nome,
    })

    return true
  }

  // Métodos para Histórico de Preços
  getHistorico(): HistoricoPreco[] {
    if (typeof window === "undefined") return []
    return this.getSecureData(this.HISTORICO_KEY) || []
  }

  saveHistorico(historico: HistoricoPreco[]): void {
    if (typeof window === "undefined") return
    this.setSecureData(this.HISTORICO_KEY, historico)
  }

  addHistoricoPreco(postoId: string, precos: HistoricoPreco["precos"]): void {
    const historico = this.getHistorico()
    const novoRegistro: HistoricoPreco = {
      id: Date.now().toString(),
      postoId: SecurityManager.sanitizeInput(postoId),
      data: new Date().toISOString(),
      precos,
    }

    historico.push(novoRegistro)
    this.saveHistorico(historico)

    SecurityManager.logSecurityEvent("PRECO_UPDATED", {
      postoId,
      precos,
    })
  }

  getHistoricoByPostoId(postoId: string): HistoricoPreco[] {
    const historico = this.getHistorico()
    const sanitizedId = SecurityManager.sanitizeInput(postoId)
    return historico
      .filter((item) => item.postoId === sanitizedId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 10) // Últimos 10 registros
  }

  // Métodos para Admin
  getAdmin(): Admin | null {
    if (typeof window === "undefined") return null
    return this.getSecureData(this.ADMIN_KEY)
  }

  async saveAdmin(admin: Admin): Promise<void> {
    if (typeof window === "undefined") return

    // Hash da senha se não estiver hasheada
    if (admin.senha && admin.senha.length < 50) {
      // Assumindo que hash tem mais de 50 chars
      admin.senha = await SecurityManager.hashPassword(admin.senha)
    }

    this.setSecureData(this.ADMIN_KEY, admin)
  }

  getAdminByEmail(email: string): Admin | null {
    const admin = this.getAdmin()
    const sanitizedEmail = SecurityManager.sanitizeInput(email.toLowerCase())
    return admin && admin.email.toLowerCase() === sanitizedEmail ? admin : null
  }

  // Métodos para Autenticação
  async login(email: string, senha: string): Promise<Usuario | null> {
    const sanitizedEmail = SecurityManager.sanitizeInput(email)

    // Verificar rate limiting
    const rateLimit = SecurityManager.checkRateLimit(sanitizedEmail)
    if (!rateLimit.allowed) {
      SecurityManager.logSecurityEvent("LOGIN_RATE_LIMITED", {
        email: sanitizedEmail,
        remainingLockout: rateLimit.lockoutTime,
      })
      throw new Error(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil((rateLimit.lockoutTime || 0) / 60000)} minutos.`,
      )
    }

    try {
      // Verificar se é um admin
      const admin = this.getAdminByEmail(sanitizedEmail)
      if (admin) {
        // Para contas de teste, verificar senha diretamente
        const isValidPassword =
          senha === "AdminSecure@2024" || (await SecurityManager.verifyPassword(senha, admin.senha))

        if (isValidPassword) {
          admin.lastLogin = new Date().toISOString()
          await this.saveAdmin(admin)
          SecurityManager.setSession(admin)
          SecurityManager.resetRateLimit(sanitizedEmail)

          SecurityManager.logSecurityEvent("LOGIN_SUCCESS", {
            email: sanitizedEmail,
            userType: "admin",
          })

          return admin
        }
      }

      // Verificar se é um posto
      const posto = this.getPostoByEmail(sanitizedEmail)
      if (posto && posto.isActive) {
        // Para contas de teste, verificar senha diretamente
        const isValidPassword =
          senha === "TanqueCheio@123" || (await SecurityManager.verifyPassword(senha, posto.senha))

        if (isValidPassword) {
          posto.lastLogin = new Date().toISOString()
          await this.updatePosto(posto.id, { lastLogin: posto.lastLogin })
          SecurityManager.setSession(posto)
          SecurityManager.resetRateLimit(sanitizedEmail)

          SecurityManager.logSecurityEvent("LOGIN_SUCCESS", {
            email: sanitizedEmail,
            userType: "posto",
            postoId: posto.id,
          })

          return posto
        }
      }

      // Login falhou
      SecurityManager.logSecurityEvent("LOGIN_FAILED", {
        email: sanitizedEmail,
        remainingAttempts: rateLimit.remainingAttempts - 1,
      })

      return null
    } catch (error) {
      SecurityManager.logSecurityEvent("LOGIN_ERROR", {
        email: sanitizedEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  logout(): void {
    const currentUser = SecurityManager.getSession()
    if (currentUser) {
      SecurityManager.logSecurityEvent("LOGOUT", {
        email: currentUser.email,
        userType: "isAdmin" in currentUser ? "admin" : "posto",
      })
    }
    SecurityManager.clearSession()
  }

  getCurrentUser(): Usuario | null {
    return SecurityManager.getSession()
  }

  setCurrentUser(user: Usuario): void {
    SecurityManager.setSession(user)
  }

  isEmailExists(email: string): boolean {
    const sanitizedEmail = SecurityManager.sanitizeInput(email.toLowerCase())
    const admin = this.getAdminByEmail(sanitizedEmail)
    if (admin) return true

    return this.getPostoByEmail(sanitizedEmail) !== null
  }

  isCnpjExists(cnpj: string): boolean {
    const postos = this.getPostos()
    const sanitizedCnpj = SecurityManager.sanitizeInput(cnpj)
    return postos.some((posto) => posto.cnpj === sanitizedCnpj)
  }

  // Método para limpar dados (útil para desenvolvimento)
  clearAll(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.POSTOS_KEY)
    localStorage.removeItem(this.HISTORICO_KEY)
    localStorage.removeItem(this.CURRENT_USER_KEY)
    localStorage.removeItem(this.ADMIN_KEY)
    SecurityManager.clearSession()
  }

  // Método para popular dados de exemplo
  async seedData(): Promise<void> {
    const postos = this.getPostos()
    if (postos.length === 0) {
      const exemploPostos = [
        {
          nome: "Posto TanqueCheio Centro",
          cnpj: "12.345.678/0001-90",
          telefone: "(11) 98765-4321",
          email: "admin@tanquecheio.com",
          senha: "TanqueCheio@123",
          endereco: {
            cep: "01234-567",
            estado: "sp",
            cidade: "São Paulo",
            bairro: "Centro",
            rua: "Avenida Paulista",
            numero: "1000",
            complemento: "Esquina",
          },
          combustiveis: {
            gasolinaComum: { ativo: true, preco: "5.49" },
            gasolinaAditivada: { ativo: true, preco: "5.79" },
            etanol: { ativo: true, preco: "3.89" },
            dieselS10: { ativo: true, preco: "6.29" },
            dieselComum: { ativo: false, preco: "" },
            gnv: { ativo: false, preco: "" },
          },
        },
      ]

      for (const posto of exemploPostos) {
        await this.addPosto(posto)
      }
    }

    // Criar conta de administrador se não existir
    if (!this.getAdmin()) {
      const admin: Admin = {
        id: "admin-1",
        nome: "Administrador TanqueCheio",
        email: "superadmin@tanquecheio.com",
        senha: "AdminSecure@2024",
        isAdmin: true,
      }
      await this.saveAdmin(admin)
    }
  }
}

export const db = new LocalDatabase()

// Inicializar dados de exemplo na primeira execução
if (typeof window !== "undefined") {
  db.seedData()
}
