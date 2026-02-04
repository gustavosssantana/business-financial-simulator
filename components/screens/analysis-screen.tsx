"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield, Clock } from "lucide-react"
import type { BusinessInputs, CalculatedResults, Scenario } from "../business-simulator"

interface AnalysisScreenProps {
  results: CalculatedResults
  inputs: BusinessInputs
  scenario: Scenario
  onBack: () => void
  onRestart: () => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  if (!isFinite(value)) return "N/A"
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

interface RiskItem {
  title: string
  description: string
  severity: "high" | "medium" | "low"
  icon: React.ReactNode
}

function identifyRisks(results: CalculatedResults, inputs: BusinessInputs): RiskItem[] {
  const risks: RiskItem[] = []

  // Low margin risk
  if (results.marginPercent < 10 && results.marginPercent > 0) {
    risks.push({
      title: "Margem de Lucro Baixa",
      description: `Sua margem de lucro de ${formatNumber(results.marginPercent)}% está abaixo dos 10% recomendados. Pequenos aumentos de custo ou reduções de preço podem tornar o negócio não lucrativo.`,
      severity: "high",
      icon: <AlertTriangle className="w-5 h-5" />,
    })
  } else if (results.marginPercent >= 10 && results.marginPercent < 20) {
    risks.push({
      title: "Margem de Lucro Moderada",
      description: `Sua margem de ${formatNumber(results.marginPercent)}% é aceitável, mas poderia ser melhorada para maior resiliência.`,
      severity: "medium",
      icon: <Shield className="w-5 h-5" />,
    })
  }

  // Long payback risk
  if (results.paybackMonths > 24 && isFinite(results.paybackMonths)) {
    risks.push({
      title: "Período de Retorno Extenso",
      description: `Recuperar seu investimento levará ${formatNumber(results.paybackMonths)} meses. Considere se você consegue manter as operações por esse período.`,
      severity: "high",
      icon: <Clock className="w-5 h-5" />,
    })
  } else if (results.paybackMonths > 12 && results.paybackMonths <= 24) {
    risks.push({
      title: "Período de Retorno Moderado",
      description: `Seu período de retorno de ${formatNumber(results.paybackMonths)} meses é razoável, mas requer desempenho sustentado.`,
      severity: "medium",
      icon: <Clock className="w-5 h-5" />,
    })
  }

  // High fixed costs
  const fixedCostRatio = (inputs.monthlyFixedCost / results.monthlyRevenue) * 100
  if (fixedCostRatio > 50) {
    risks.push({
      title: "Alta Carga de Custos Fixos",
      description: `Custos fixos representam ${formatNumber(fixedCostRatio)}% da receita. Isso reduz a flexibilidade em períodos de baixa.`,
      severity: "high",
      icon: <TrendingUp className="w-5 h-5" />,
    })
  } else if (fixedCostRatio > 30) {
    risks.push({
      title: "Custos Fixos Significativos",
      description: `Custos fixos em ${formatNumber(fixedCostRatio)}% da receita. Monitore-os de perto para manter a lucratividade.`,
      severity: "medium",
      icon: <TrendingUp className="w-5 h-5" />,
    })
  }

  // Break-even risk
  if (results.breakEvenUnits > inputs.monthlySalesVolume * 0.9 && results.breakEvenUnits <= inputs.monthlySalesVolume) {
    risks.push({
      title: "Operando Próximo ao Equilíbrio",
      description: "Suas vendas projetadas estão apenas ligeiramente acima do ponto de equilíbrio. Uma pequena queda nas vendas pode resultar em prejuízos.",
      severity: "medium",
      icon: <AlertTriangle className="w-5 h-5" />,
    })
  }

  // Negative margin
  if (results.marginPercent <= 0) {
    risks.push({
      title: "Margem de Lucro Negativa",
      description: "Seus custos excedem sua receita. O modelo de negócio precisa ser reestruturado para se tornar viável.",
      severity: "high",
      icon: <XCircle className="w-5 h-5" />,
    })
  }

  // Investment not recoverable
  if (results.netProfit <= 0) {
    risks.push({
      title: "Investimento Não Recuperável",
      description: `Com lucro líquido de ${formatCurrency(results.netProfit)}, o investimento inicial de ${formatCurrency(inputs.initialInvestment)} nunca será recuperado. É necessário reestruturar o modelo de negócio.`,
      severity: "high",
      icon: <XCircle className="w-5 h-5" />,
    })
  }

  // If business looks healthy
  if (risks.length === 0 && results.isViable) {
    risks.push({
      title: "Posição Financeira Sólida",
      description: "Seu negócio apresenta margens saudáveis, retorno razoável e custos gerenciáveis. Continue monitorando o desempenho.",
      severity: "low",
      icon: <CheckCircle2 className="w-5 h-5" />,
    })
  }

  return risks
}

function getRiskColor(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "success"
  }
}

function getScenarioLabel(scenario: string): string {
  switch (scenario) {
    case "pessimistic":
      return "Pessimista"
    case "realistic":
      return "Realista"
    case "optimistic":
      return "Otimista"
    default:
      return scenario
  }
}

function getSeverityLabel(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "Alto"
    case "medium":
      return "Médio"
    case "low":
      return "Baixo"
  }
}

export function AnalysisScreen({ results, inputs, scenario, onBack, onRestart }: AnalysisScreenProps) {
  const risks = identifyRisks(results, inputs)
  const scenarioLabel = getScenarioLabel(scenario)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos cenários</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-sm mb-4">
            <span>Cenário {scenarioLabel}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Análise Executiva
          </h1>
          <p className="text-muted-foreground">
            Um resumo da viabilidade do seu negócio com insights e avaliação de riscos.
          </p>
        </div>

        {/* Main Verdict */}
        <div className={`p-8 rounded-2xl mb-8 ${results.isViable ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${results.isViable ? "bg-success/20" : "bg-destructive/20"}`}>
              {results.isViable ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-semibold mb-2 ${results.isViable ? "text-success" : "text-destructive"}`}>
                {results.isViable
                  ? "Este negócio é financeiramente viável"
                  : "Este negócio não é viável nas condições atuais"}
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {results.isViable ? (
                  <>
                    Com base nos seus dados, o investimento de {formatCurrency(inputs.initialInvestment)} será recuperado em aproximadamente{" "}
                    <strong>{formatNumber(results.paybackMonths)} meses</strong>. Seu lucro líquido mensal de{" "}
                    {formatCurrency(results.netProfit)} (após impostos de {inputs.taxRate}%) representa uma margem de {formatNumber(results.marginPercent)}%.
                  </>
                ) : results.netProfit <= 0 ? (
                  <>
                    Seus custos excedem suas receitas, resultando em um prejuízo líquido mensal de {formatCurrency(Math.abs(results.netProfit))}.
                    O investimento de {formatCurrency(inputs.initialInvestment)} <strong>não será recuperado</strong> enquanto o lucro líquido permanecer negativo ou zero.
                    Você precisa aumentar preços, reduzir custos ou aumentar o volume de vendas para alcançar a lucratividade.
                  </>
                ) : (
                  <>
                    Seus custos excedem suas receitas, resultando em um prejuízo líquido mensal de {formatCurrency(Math.abs(results.netProfit))}.
                    Você precisa aumentar preços, reduzir custos ou aumentar o volume de vendas para alcançar a lucratividade.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Investimento</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(inputs.initialInvestment)}</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Lucro Líquido</p>
            <p className={`text-lg font-semibold ${results.netProfit > 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(results.netProfit)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Margem Líquida</p>
            <p className="text-lg font-semibold text-foreground">{formatNumber(results.marginPercent)}%</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Retorno</p>
            <p className={`text-lg font-semibold ${results.netProfit <= 0 ? "text-destructive" : "text-foreground"}`}>
              {results.netProfit <= 0 ? "Não recuperável" : isFinite(results.paybackMonths) ? `${formatNumber(results.paybackMonths)} meses` : "Não recuperável"}
            </p>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-4">Avaliação de Riscos</h3>
          <div className="space-y-4">
            {risks.map((risk, index) => {
              const color = getRiskColor(risk.severity)
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
                    >
                      <span style={{ color: `hsl(var(--${color}))` }}>{risk.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{risk.title}</h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: `hsl(var(--${color}) / 0.1)`,
                            color: `hsl(var(--${color}))`,
                          }}
                        >
                          {getSeverityLabel(risk.severity)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{risk.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommendations */}
        {!results.isViable && (
          <div className="p-6 rounded-xl bg-secondary/50 border border-border mb-8">
            <h3 className="text-lg font-medium text-foreground mb-3">Recomendações</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground">1.</span>
                <span>Aumente seu preço de venda para melhorar as margens.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">2.</span>
                <span>Reduza custos fixos renegociando contratos ou encontrando alternativas mais baratas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">3.</span>
                <span>Diminua custos variáveis por unidade através de compras em volume ou otimização de processos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">4.</span>
                <span>Aumente o volume de vendas através de marketing ou expandindo seu mercado.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="bg-transparent px-8 py-6 text-lg rounded-full"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Começar Novamente
          </Button>
          <Button
            onClick={onBack}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full"
          >
            Ajustar Cenários
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Esta análise é baseada no cenário {scenarioLabel.toLowerCase()}. Os resultados podem variar de acordo com as condições reais do mercado.
          </p>
        </div>
      </div>
    </div>
  )
}
