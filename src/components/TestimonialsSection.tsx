import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Daniel Clifford',
      designation: 'CEO, TechStart',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      title: 'Resultados impressionantes em tempo recorde',
      text: 'A automação implementada pela Eter Growth poupou-nos mais de 40 horas semanais em processos administrativos. O ROI foi imediato.',
      colSpan: 'md:col-span-2',
      bg: 'bg-blue-900/20'
    },
    {
      name: 'Jonathan Walters',
      designation: 'Director de Marketing',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      title: 'Uma equipa que entende de crescimento',
      text: 'Começámos com uma presença digital fraca. Hoje somos líderes no nosso nicho graças à estratégia de tráfego pago.',
      colSpan: 'md:col-span-1',
      bg: 'bg-purple-900/20'
    },
    {
      name: 'Kira Whittle',
      designation: 'Fundadora, DesignCo',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      title: 'Transformação digital completa',
      text: 'A consultoria de cibersegurança deu-nos a tranquilidade necessária para escalar. O novo website aumentou a nossa conversão em 150%. Recomendo vivamente a qualquer empresa que queira modernizar-se.',
      colSpan: 'md:col-span-1',
      bg: 'bg-white/5'
    },
    {
      name: 'Jeanette Harmon',
      designation: 'CTO, InovaSystems',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      title: 'Profissionalismo e excelência técnica',
      text: 'A qualidade do código e a atenção aos detalhes na implementação das automações superaram as nossas expectativas.',
      colSpan: 'md:col-span-2',
      bg: 'bg-blue-900/20'
    },
  ];

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            O que dizem os nossos <span className="text-blue-400">parceiros</span>
          </motion.h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Histórias reais de empresas que transformaram os seus resultados através da nossa metodologia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${item.colSpan} relative p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-colors group overflow-hidden ${item.bg}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-24 h-24 text-white" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-full border-2 border-blue-500/30"
                    />
                    <div>
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <p className="text-sm text-blue-400">{item.designation}</p>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
