"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown, DollarSign, Percent, Clock, Target } from "lucide-react"
import type { BusinessInputs, CalculatedResults } from "../business-simulator"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ResultsScreenProps {
  results: CalculatedResults
  inputs: BusinessInputs
  onNext: () => void
  onBack: () => void
}

interface KPICardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  subtext?: string
}

function KPICard({ label, value, icon, trend, subtext }: KPICardProps) {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
  
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <div className={trendColor}>
            {trend === "up" ? <TrendingUp className="w-5 h-5" /> : trend === "down" ? <TrendingDown className="w-5 h-5" /> : null}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${trend === "down" ? "text-destructive" : "text-foreground"}`}>{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  )
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

export function ResultsScreen({ results, inputs, onNext, onBack }: ResultsScreenProps) {
  // Generate cash flow data for 24 months using Net Profit
  const cashFlowData = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1
    const cumulativeCashFlow = -inputs.initialInvestment + (results.netProfit * month)
    return {
      month: `M${month}`,
      value: cumulativeCashFlow,
    }
  })

  // Revenue vs Costs comparison
  const comparisonData = [
    {
      name: "Mensal",
      Receita: results.monthlyRevenue,
      Custos: results.totalMonthlyCost,
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos dados</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Resultados Financeiros
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${results.isViable ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {results.isViable ? "Viável" : "Não Viável"}
            </span>
          </div>
          <p className="text-muted-foreground">
            Aqui estão suas métricas financeiras calculadas com base nos seus dados.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <KPICard
            label="Receita Mensal"
            value={formatCurrency(results.monthlyRevenue)}
            icon={<DollarSign className="w-5 h-5 text-foreground" />}
            trend="neutral"
          />
          <KPICard
            label="Lucro Operacional"
            value={formatCurrency(results.operatingProfit)}
            icon={<TrendingUp className="w-5 h-5 text-foreground" />}
            trend={results.operatingProfit > 0 ? "up" : "down"}
            subtext="Antes dos impostos"
          />
          <KPICard
            label="Lucro Líquido"
            value={formatCurrency(results.netProfit)}
            icon={<TrendingUp className="w-5 h-5 text-foreground" />}
            trend={results.netProfit > 0 ? "up" : "down"}
            subtext={results.netProfit > 0 ? "Após impostos" : "Custos excedem receita"}
          />
          <KPICard
            label="Margem Líquida"
            value={`${formatNumber(results.marginPercent)}%`}
            icon={<Percent className="w-5 h-5 text-foreground" />}
            trend={results.marginPercent > 20 ? "up" : results.marginPercent > 0 ? "neutral" : "down"}
            subtext={results.marginPercent > 20 ? "Margem saudável" : results.marginPercent > 0 ? "Margem baixa" : "Margem negativa"}
          />
          <KPICard
            label="Período de Retorno"
            value={results.netProfit <= 0 ? "Não recuperável" : isFinite(results.paybackMonths) ? `${formatNumber(results.paybackMonths)} meses` : "Não recuperável"}
            icon={<Clock className="w-5 h-5 text-foreground" />}
            trend={results.netProfit <= 0 ? "down" : results.paybackMonths <= 12 ? "up" : results.paybackMonths <= 24 ? "neutral" : "down"}
            subtext={results.netProfit <= 0 ? "Lucro negativo ou zero" : results.paybackMonths <= 12 ? "Recuperação rápida" : results.paybackMonths <= 24 ? "Recuperação moderada" : "Recuperação longa"}
          />
          <KPICard
            label="Ponto de Equilíbrio"
            value={isFinite(results.breakEvenUnits) ? `${formatNumber(results.breakEvenUnits)} unidades` : "N/A"}
            icon={<Target className="w-5 h-5 text-foreground" />}
            trend={results.breakEvenUnits <= inputs.monthlySalesVolume ? "up" : "down"}
            subtext={results.breakEvenUnits <= inputs.monthlySalesVolume ? "Acima do equilíbrio" : "Abaixo do equilíbrio"}
          />
        </div>

        {/* Break-even Message */}
        {isFinite(results.breakEvenUnits) && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-8">
            <p className="text-sm text-foreground">
              Você precisa vender <strong>{formatNumber(results.breakEvenUnits)} unidades</strong> por mês para atingir o ponto de equilíbrio.
              {results.breakEvenUnits <= inputs.monthlySalesVolume ? (
                <span className="text-success ml-1">Seu volume projetado de {formatNumber(inputs.monthlySalesVolume)} unidades está acima desse limite.</span>
              ) : (
                <span className="text-destructive ml-1">Seu volume projetado de {formatNumber(inputs.monthlySalesVolume)} unidades está abaixo desse limite.</span>
              )}
            </p>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Fluxo de Caixa Acumulado</h3>
            <p className="text-sm text-muted-foreground mb-4">Projeção para 24 meses</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    interval={3}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Fluxo de Caixa"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-medium text-foreground mb-4">Receita vs Custos</h3>
            <p className="text-sm text-muted-foreground mb-4">Comparação mensal</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Receita" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Custos" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onNext}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full"
          >
            Análise de Cenários
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
