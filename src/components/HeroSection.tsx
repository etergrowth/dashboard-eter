import { ArrowRight, Play, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="min-h-screen relative overflow-hidden flex items-center justify-center pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#030712]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-blue-400 tracking-wider uppercase backdrop-blur-sm">
                Parceiros de Crescimento Digital
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Transformamos processos em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-glow">
                Crescimento Exponencial
              </span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Ajudamos PMEs a ganhar milhares de horas por ano e competir digitalmente
              através de <span className="text-white font-semibold">Automação com IA</span>, Marketing e Cibersegurança.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => scrollToSection('contact')}
                className="group px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-4 bg-white/5 text-white rounded-full font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 fill-current" />
                Ver Como Funciona
              </button>
            </div>

            <div className="flex items-center gap-3 pt-12 justify-center opacity-80">
              <div className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <Award className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  Fee de Sucesso | Só cobramos resultados
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
