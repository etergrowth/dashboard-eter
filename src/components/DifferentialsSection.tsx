import { DollarSign, Users, Shield, ArrowRight } from 'lucide-react';

export default function DifferentialsSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="differentials" className="py-24 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Não somos apenas uma agência
          </h2>
          <p className="text-lg text-[#3C3C3C] max-w-3xl mx-auto">
            Somos parceiros com pele no jogo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#7BA8F9]/10 to-[#3C64B1]/5 rounded-2xl p-8 lg:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#7BA8F9]/20">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-block bg-gradient-to-r from-[#7BA8F9] to-[#3C64B1] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 w-fit shadow-lg">
                  <DollarSign className="w-4 h-4" />
                  MODELO ÚNICO
                </div>

                <h3 className="text-3xl font-bold text-black">
                  Só cobramos se geramos resultados
                </h3>

                <p className="text-[#3C3C3C] leading-relaxed text-lg">
                  Nosso compromisso é entregar valor real. Se não geramos resultados mensuráveis, não cobramos.
                </p>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-[#7BA8F9] font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-300 text-lg"
                >
                  Saber Mais
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full lg:w-64 h-48 bg-gradient-to-br from-[#7BA8F9]/20 to-[#3C64B1]/20 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7BA8F9] to-[#3C64B1] opacity-10"></div>
                <div className="relative">
                  <div className="text-6xl font-bold text-[#7BA8F9]">100%</div>
                  <div className="text-sm text-[#3C64B1] font-semibold text-center mt-2">
                    Alinhamento de Resultados
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
            <div className="inline-block bg-gradient-to-r from-[#7BA8F9]/20 to-[#3C64B1]/20 text-[#3C64B1] px-4 py-2 rounded-full text-sm font-bold mb-6">
              EXPERTISE
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-[#7BA8F9] to-[#3C64B1] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#7BA8F9]/30">
              <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-bold text-black mb-4">
              Fundadores Especializados
            </h3>

            <ul className="space-y-3 text-[#3C3C3C] mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#7BA8F9] font-bold">•</span>
                <span>Ricardo: Marketing/IA/Automação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7BA8F9] font-bold">•</span>
                <span>Luís: Cibersegurança/Normas</span>
              </li>
            </ul>

            <button
              onClick={() => scrollToSection('contact')}
              className="text-[#7BA8F9] font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-300"
            >
              Conhecer
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="md:col-span-2 lg:col-span-1 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
            <div className="inline-block bg-gradient-to-r from-[#7BA8F9]/20 to-[#3C64B1]/20 text-[#3C64B1] px-4 py-2 rounded-full text-sm font-bold mb-6">
              SEGURANÇA
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-[#7BA8F9] to-[#3C64B1] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#7BA8F9]/30">
              <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h3 className="text-2xl font-bold text-black mb-4">
              Compliance Rigoroso
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
              {['RGPD', 'IA Act', 'NIS2', 'QNRCS', 'ISO 42001'].map((cert, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-[#7BA8F9]/10 to-[#3C64B1]/10 text-[#3C64B1] rounded-full text-sm font-semibold border border-[#7BA8F9]/20"
                >
                  {cert}
                </span>
              ))}
            </div>

            <button
              onClick={() => scrollToSection('contact')}
              className="text-[#7BA8F9] font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-300"
            >
              Certificações
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
