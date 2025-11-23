
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Globe, BarChart3, Shield } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      title: 'Automação de Processos',
      description: 'Eliminamos tarefas repetitivas e manuais e aumentamos eficiência operacional.',
      icon: Zap,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Web Design Premium',
      description: 'Criamos interfaces responsivas, intuitivas e de alta conversão.',
      icon: Globe,
      color: 'from-purple-400 to-purple-600'
    },
    {
      title: 'Gestão de Anúncios',
      description: 'Estratégias de marketing digital que geram resultados mensuráveis e ROI comprovado.',
      icon: BarChart3,
      color: 'from-pink-400 to-pink-600'
    },
    {
      title: 'Consultoria Especializada',
      description: 'Cibersegurança (RGPD, NIS2, ISO 42001) para proteger e potencializar presença digital.',
      icon: Shield,
      color: 'from-cyan-400 to-cyan-600'
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#030712]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-bold text-blue-400 tracking-wider uppercase">
              Soluções Digitais
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Os 4 pilares que transformam<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              o seu negócio
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-3xl mx-auto"
          >
            Desenvolvemos estratégias personalizadas para cada desafio empresarial,
            focando em resultados reais e escaláveis.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Hover Gradient */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-3 mb-6 shadow-lg`}>
                  <service.icon className="w-full h-full text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-400 mb-8 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {service.description}
                </p>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center gap-2 text-sm font-bold text-white/80 group-hover:text-white transition-colors"
                >
                  Saber mais
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
