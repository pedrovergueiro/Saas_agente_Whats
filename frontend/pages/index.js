import Head from 'next/head';
import Link from 'next/link';
import { Bot, MessageSquare, BarChart3, Zap, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>WhatsApp Bot SaaS - Automatize seu Atendimento</title>
        <meta name="description" content="Plataforma completa de bots de WhatsApp com IA para seu negócio" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">WhatsApp Bot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-primary-600">
                Entrar
              </Link>
              <Link href="/register" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
                Começar Grátis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Automatize seu Atendimento<br />
              <span className="text-primary-600">no WhatsApp com IA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma completa para criar e gerenciar bots de WhatsApp inteligentes.
              Atenda seus clientes 24/7, agende horários e aumente suas vendas.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg">
                Começar Teste Grátis
              </Link>
              <Link href="/pricing" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-primary-600">
                Ver Planos
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✨ 7 dias grátis • Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600">
              Recursos profissionais para transformar seu atendimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Atendimento Inteligente</h3>
              <p className="text-gray-600">
                Bot com IA que aprende com cada conversa e atende seus clientes de forma natural e personalizada.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
              <p className="text-gray-600">
                Painel administrativo com métricas em tempo real, gráficos e relatórios detalhados.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Configuração Rápida</h3>
              <p className="text-gray-600">
                Configure seu bot em minutos. Escaneie o QR Code e comece a atender imediatamente.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disponível 24/7</h3>
              <p className="text-gray-600">
                Seu bot nunca dorme. Atenda clientes a qualquer hora, inclusive fora do horário comercial.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
              <p className="text-gray-600">
                Seus dados protegidos com criptografia. Cada cliente tem sua instância isolada.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA Avançada</h3>
              <p className="text-gray-600">
                8 módulos de inteligência artificial para atendimento humanizado e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Básico */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Básico</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 97</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 bot WhatsApp
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  500 mensagens/mês
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Dashboard básico
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suporte por email
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition">
                Começar Agora
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-xl shadow-xl border-4 border-primary-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 197</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 bot WhatsApp
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  2000 mensagens/mês
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Dashboard completo
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Analytics avançado
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suporte prioritário
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg hover:bg-primary-700 transition">
                Começar Agora
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 397</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 bots WhatsApp
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Mensagens ilimitadas
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Tudo do Pro +
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  API personalizada
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Suporte 24/7
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition">
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar seu atendimento?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Comece seu teste grátis de 7 dias agora. Sem cartão de crédito.
          </p>
          <Link href="/register" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
            Começar Teste Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6" />
                <span className="text-lg font-bold">WhatsApp Bot</span>
              </div>
              <p className="text-gray-400">
                Automatize seu atendimento com inteligência artificial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing">Preços</Link></li>
                <li><Link href="/features">Funcionalidades</Link></li>
                <li><Link href="/docs">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">Sobre</Link></li>
                <li><Link href="/contact">Contato</Link></li>
                <li><Link href="/support">Suporte</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">Privacidade</Link></li>
                <li><Link href="/terms">Termos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 WhatsApp Bot SaaS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
