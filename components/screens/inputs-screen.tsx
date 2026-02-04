"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft, ArrowRight, DollarSign, Package, ShoppingCart, TrendingUp, Wallet, HelpCircle, Percent } from "lucide-react"
import type { BusinessInputs } from "../business-simulator"

interface InputsScreenProps {
  inputs: BusinessInputs
  setInputs: (inputs: BusinessInputs) => void
  onCalculate: () => void
  onBack: () => void
}

interface InputFieldProps {
  label: string
  tooltip: string
  icon: React.ReactNode
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
}

function InputField({ label, tooltip, icon, value, onChange, prefix, suffix }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
        {prefix && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-12 bg-card border-border text-foreground ${prefix ? "pl-14" : "pl-10"} ${suffix ? "pr-16" : "pr-4"} text-base`}
          placeholder="0"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export function InputsScreen({ inputs, setInputs, onCalculate, onBack }: InputsScreenProps) {
  const updateInput = (key: keyof BusinessInputs) => (value: number) => {
    setInputs({ ...inputs, [key]: value })
  }

  const isValid = Object.values(inputs).every((v) => v > 0)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Dados do Negócio
          </h1>
          <p className="text-muted-foreground">
            Insira os números do seu negócio para calcular a viabilidade.
          </p>
        </div>

        <div className="space-y-6 bg-card p-8 rounded-2xl border border-border">
          <InputField
            label="Investimento Inicial"
            tooltip="O valor total que você precisa investir inicialmente para começar o negócio."
            icon={<Wallet className="w-5 h-5" />}
            value={inputs.initialInvestment}
            onChange={updateInput("initialInvestment")}
            prefix="R$"
          />

          <InputField
            label="Custo Fixo Mensal"
            tooltip="Custos que permanecem os mesmos independente do volume de vendas: aluguel, salários, seguros, etc."
            icon={<DollarSign className="w-5 h-5" />}
            value={inputs.monthlyFixedCost}
            onChange={updateInput("monthlyFixedCost")}
            prefix="R$"
          />

          <InputField
            label="Custo Variável por Unidade"
            tooltip="O custo para produzir ou adquirir cada unidade vendida: materiais, embalagem, frete."
            icon={<Package className="w-5 h-5" />}
            value={inputs.variableCostPerUnit}
            onChange={updateInput("variableCostPerUnit")}
            prefix="R$"
          />

          <InputField
            label="Preço de Venda por Unidade"
            tooltip="O preço que você cobra dos clientes por cada unidade vendida."
            icon={<TrendingUp className="w-5 h-5" />}
            value={inputs.sellingPricePerUnit}
            onChange={updateInput("sellingPricePerUnit")}
            prefix="R$"
          />

          <InputField
            label="Volume de Vendas Mensal"
            tooltip="O número de unidades que você espera vender a cada mês."
            icon={<ShoppingCart className="w-5 h-5" />}
            value={inputs.monthlySalesVolume}
            onChange={updateInput("monthlySalesVolume")}
            suffix="unidades"
          />

          <InputField
            label="Alíquota de Imposto"
            tooltip="A porcentagem de impostos sobre o lucro operacional (ex: Simples Nacional, Lucro Presumido)."
            icon={<Percent className="w-5 h-5" />}
            value={inputs.taxRate}
            onChange={updateInput("taxRate")}
            suffix="%"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={onCalculate}
            disabled={!isValid}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full disabled:opacity-50"
          >
            Calcular viabilidade
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
