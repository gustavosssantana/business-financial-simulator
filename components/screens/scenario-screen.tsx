"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"
import type { BusinessInputs, CalculatedResults, Scenario } from "../business-simulator"
import { calculateResults } from "../business-simulator"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ScenarioScreenProps {
  inputs: BusinessInputs
  scenario: Scenario
  setScenario: (scenario: Scenario) => void
  results: CalculatedResults
  onNext: () => void
  onBack: () => void
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

interface ScenarioButtonProps {
  label: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  color: string
}

function ScenarioButton({ label, description, icon, isActive, onClick, color }: ScenarioButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border-2 transition-all text-left ${
        isActive
          ? `border-${color} bg-${color}/5`
          : "border-border bg-card hover:border-muted-foreground/30"
      }`}
      style={{
        borderColor: isActive ? `hsl(var(--${color}))` : undefined,
        backgroundColor: isActive ? `hsl(var(--${color}) / 0.05)` : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
        >
          {icon}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

export function ScenarioScreen({ inputs, scenario, setScenario, results, onNext, onBack }: ScenarioScreenProps) {
  const pessimisticResults = calculateResults(inputs, "pessimistic")
  const realisticResults = calculateResults(inputs, "realistic")
  const optimisticResults = calculateResults(inputs, "optimistic")

  // Generate comparison chart data using Net Profit
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1
    return {
      month: `M${month}`,
      Pessimista: -inputs.initialInvestment + (pessimisticResults.netProfit * month),
      Realista: -inputs.initialInvestment + (realisticResults.netProfit * month),
      Otimista: -inputs.initialInvestment + (optimisticResults.netProfit * month),
    }
  })

  const scenarios = [
    {
      key: "pessimistic" as Scenario,
      label: "Pessimista",
      description: "-20% vendas, +10% custos",
      icon: <TrendingDown className="w-4 h-4" style={{ color: "hsl(var(--destructive))" }} />,
      color: "destructive",
      results: pessimisticResults,
    },
    {
      key: "realistic" as Scenario,
      label: "Realista",
      description: "Dados originais",
      icon: <Minus className="w-4 h-4" style={{ color: "hsl(var(--chart-2))" }} />,
      color: "chart-2",
      results: realisticResults,
    },
    {
      key: "optimistic" as Scenario,
      label: "Otimista",
      description: "+20% vendas, -10% custos",
      icon: <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--chart-1))" }} />,
      color: "chart-1",
      results: optimisticResults,
    },
  ]

  const currentScenario = scenarios.find((s) => s.key === scenario)!

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos resultados</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Análise de Cenários
          </h1>
          <p className="text-muted-foreground">
            Veja como seu negócio se comporta em diferentes condições.
          </p>
        </div>

        {/* Scenario Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {scenarios.map((s) => (
            <ScenarioButton
              key={s.key}
              label={s.label}
              description={s.description}
              icon={s.icon}
              isActive={scenario === s.key}
              onClick={() => setScenario(s.key)}
              color={s.color}
            />
          ))}
        </div>

        {/* Current Scenario KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Lucro Líquido</p>
            <p className={`text-xl font-semibold ${results.netProfit > 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(results.netProfit)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Margem</p>
            <p className="text-xl font-semibold text-foreground">
              {formatNumber(results.marginPercent)}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Retorno</p>
            <p className={`text-xl font-semibold ${results.netProfit <= 0 ? "text-destructive" : "text-foreground"}`}>
              {results.netProfit <= 0 ? "Não recuperável" : isFinite(results.paybackMonths) ? `${formatNumber(results.paybackMonths)} meses` : "Não recuperável"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className={`text-xl font-semibold ${results.isViable ? "text-success" : "text-destructive"}`}>
              {results.isViable ? "Viável" : "Não Viável"}
            </p>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <h3 className="text-lg font-medium text-foreground mb-2">Comparação de Fluxo de Caixa</h3>
          <p className="text-sm text-muted-foreground mb-4">Todos os cenários em 24 meses</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Pessimista"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={scenario === "pessimistic" ? 3 : 1.5}
                  strokeDasharray={scenario !== "pessimistic" ? "5 5" : undefined}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Realista"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={scenario === "realistic" ? 3 : 1.5}
                  strokeDasharray={scenario !== "realistic" ? "5 5" : undefined}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Otimista"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={scenario === "optimistic" ? 3 : 1.5}
                  strokeDasharray={scenario !== "optimistic" ? "5 5" : undefined}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <h3 className="text-lg font-medium text-foreground mb-4">Comparação de Cenários</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Métrica</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Pessimista</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Realista</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Otimista</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-foreground">Lucro Líquido</td>
                  <td className={`py-3 px-4 text-right ${pessimisticResults.netProfit > 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(pessimisticResults.netProfit)}
                  </td>
                  <td className={`py-3 px-4 text-right ${realisticResults.netProfit > 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(realisticResults.netProfit)}
                  </td>
                  <td className={`py-3 px-4 text-right ${optimisticResults.netProfit > 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(optimisticResults.netProfit)}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-foreground">Margem</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatNumber(pessimisticResults.marginPercent)}%</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatNumber(realisticResults.marginPercent)}%</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatNumber(optimisticResults.marginPercent)}%</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-foreground">Retorno</td>
                  <td className={`py-3 px-4 text-right ${pessimisticResults.netProfit <= 0 ? "text-destructive" : "text-foreground"}`}>
                    {pessimisticResults.netProfit <= 0 ? "Não recuperável" : isFinite(pessimisticResults.paybackMonths) ? `${formatNumber(pessimisticResults.paybackMonths)} meses` : "Não recuperável"}
                  </td>
                  <td className={`py-3 px-4 text-right ${realisticResults.netProfit <= 0 ? "text-destructive" : "text-foreground"}`}>
                    {realisticResults.netProfit <= 0 ? "Não recuperável" : isFinite(realisticResults.paybackMonths) ? `${formatNumber(realisticResults.paybackMonths)} meses` : "Não recuperável"}
                  </td>
                  <td className={`py-3 px-4 text-right ${optimisticResults.netProfit <= 0 ? "text-destructive" : "text-foreground"}`}>
                    {optimisticResults.netProfit <= 0 ? "Não recuperável" : isFinite(optimisticResults.paybackMonths) ? `${formatNumber(optimisticResults.paybackMonths)} meses` : "Não recuperável"}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground">Ponto de Equilíbrio</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {isFinite(pessimisticResults.breakEvenUnits) ? `${formatNumber(pessimisticResults.breakEvenUnits)} unid.` : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {isFinite(realisticResults.breakEvenUnits) ? `${formatNumber(realisticResults.breakEvenUnits)} unid.` : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {isFinite(optimisticResults.breakEvenUnits) ? `${formatNumber(optimisticResults.breakEvenUnits)} unid.` : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onNext}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full"
          >
            Análise Executiva
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
