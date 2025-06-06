import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">⛽</span>
            <span className="text-orange-500">TanqueCheio</span> Combustível
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-orange-500 transition-colors">
              🔑 Login
            </Link>
            <Link href="/register" className="text-sm font-medium hover:text-orange-500 transition-colors">
              📝 Cadastrar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="text-6xl mb-4">⛽</div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gerenciamento de Postos</h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  🚀 Cadastre seu posto e mantenha os preços dos combustíveis sempre atualizados para seus clientes.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                    🏪 Cadastrar Posto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600">
                    📊 Acessar Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-lg font-semibold text-white mb-2">Cadastre seu Posto</h3>
                <p className="text-blue-100 text-sm">
                  Registre as informações do seu posto de combustível de forma rápida e simples.
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-white mb-2">Atualize os Preços</h3>
                <p className="text-green-100 text-sm">
                  Mantenha os preços dos combustíveis sempre atualizados para melhor visibilidade.
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 shadow-lg">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-white mb-2">Gerencie Usuários</h3>
                <p className="text-purple-100 text-sm">
                  Adicione funcionários para ajudar na gestão dos preços do seu posto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banner promocional estilo Baratão */}
        <section className="w-full py-8 bg-gradient-to-r from-green-500 to-green-600">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Seja um parceiro TanqueCheio!</h3>
                  <p className="text-green-100">Aproveite benefícios exclusivos para postos cadastrados</p>
                </div>
              </div>
              <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                Quero descontos INCRÍVEIS
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-700 bg-gray-800">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="text-center text-sm leading-loose text-gray-400 md:text-left">
            © 2025 TanqueCheio. Todos os direitos reservados. ⛽
          </div>
        </div>
      </footer>
    </div>
  )
}
