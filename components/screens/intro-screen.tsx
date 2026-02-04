"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Calculator, PieChart } from "lucide-react"

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-sm mb-8">
          <Calculator className="w-4 h-4" />
          <span>Ferramenta de Planejamento Financeiro</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground mb-6 text-balance">
          Descubra se sua ideia de negócio é viável
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl mx-auto">
          Simule receitas, custos e veja quanto tempo leva para recuperar seu investimento.
        </p>
        
        <Button
          onClick={onStart}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full"
        >
          Iniciar simulação
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <Calculator className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Entradas Simples</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Insira seus custos, preços e volume de vendas em um formulário intuitivo.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Resultados Instantâneos</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Veja sua lucratividade, margens e período de retorno calculados automaticamente.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Análise de Cenários</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compare cenários otimistas, realistas e pessimistas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
