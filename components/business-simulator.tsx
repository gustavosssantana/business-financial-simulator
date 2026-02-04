"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IntroScreen } from "./screens/intro-screen"
import { InputsScreen } from "./screens/inputs-screen"
import { ResultsScreen } from "./screens/results-screen"
import { ScenarioScreen } from "./screens/scenario-screen"
import { AnalysisScreen } from "./screens/analysis-screen"

export interface BusinessInputs {
  initialInvestment: number
  monthlyFixedCost: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  monthlySalesVolume: number
  taxRate: number
}

export interface CalculatedResults {
  monthlyRevenue: number
  totalMonthlyCost: number
  operatingProfit: number
  netProfit: number
  monthlyProfit: number // Alias for netProfit (backward compatibility)
  marginPercent: number
  paybackMonths: number
  breakEvenUnits: number
  isViable: boolean
}

export type Scenario = "pessimistic" | "realistic" | "optimistic"

const defaultInputs: BusinessInputs = {
  initialInvestment: 50000,
  monthlyFixedCost: 5000,
  variableCostPerUnit: 15,
  sellingPricePerUnit: 50,
  monthlySalesVolume: 200,
  taxRate: 15,
}

export function calculateResults(inputs: BusinessInputs, scenario: Scenario = "realistic"): CalculatedResults {
  let adjustedVolume = inputs.monthlySalesVolume
  let adjustedFixedCost = inputs.monthlyFixedCost
  let adjustedVariableCost = inputs.variableCostPerUnit

  if (scenario === "pessimistic") {
    adjustedVolume = inputs.monthlySalesVolume * 0.8
    adjustedFixedCost = inputs.monthlyFixedCost * 1.1
    adjustedVariableCost = inputs.variableCostPerUnit * 1.1
  } else if (scenario === "optimistic") {
    adjustedVolume = inputs.monthlySalesVolume * 1.2
    adjustedFixedCost = inputs.monthlyFixedCost * 0.9
    adjustedVariableCost = inputs.variableCostPerUnit * 0.9
  }

  const monthlyRevenue = inputs.sellingPricePerUnit * adjustedVolume
  const totalMonthlyCost = adjustedFixedCost + (adjustedVariableCost * adjustedVolume)
  
  // Operating Profit = Revenue - Variable Costs - Fixed Costs
  const operatingProfit = monthlyRevenue - totalMonthlyCost
  
  // Net Profit = Operating Profit * (1 - Tax Rate)
  const taxMultiplier = 1 - (inputs.taxRate / 100)
  const netProfit = operatingProfit > 0 ? operatingProfit * taxMultiplier : operatingProfit
  
  // Margin based on net profit
  const marginPercent = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0
  
  // Payback uses Net Profit
  const paybackMonths = netProfit > 0 ? inputs.initialInvestment / netProfit : Infinity
  
  // Break-even: units needed to cover fixed costs
  const contributionMargin = inputs.sellingPricePerUnit - adjustedVariableCost
  const breakEvenUnits = contributionMargin > 0 ? adjustedFixedCost / contributionMargin : Infinity

  return {
    monthlyRevenue,
    totalMonthlyCost,
    operatingProfit,
    netProfit,
    monthlyProfit: netProfit, // Alias for backward compatibility
    marginPercent,
    paybackMonths,
    breakEvenUnits,
    isViable: netProfit > 0,
  }
}

export function BusinessSimulator() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [inputs, setInputs] = useState<BusinessInputs>(defaultInputs)
  const [scenario, setScenario] = useState<Scenario>("realistic")

  const results = useMemo(() => calculateResults(inputs, scenario), [inputs, scenario])

  const screens = [
    <IntroScreen key="intro" onStart={() => setCurrentScreen(1)} />,
    <InputsScreen
      key="inputs"
      inputs={inputs}
      setInputs={setInputs}
      onCalculate={() => setCurrentScreen(2)}
      onBack={() => setCurrentScreen(0)}
    />,
    <ResultsScreen
      key="results"
      results={results}
      inputs={inputs}
      onNext={() => setCurrentScreen(3)}
      onBack={() => setCurrentScreen(1)}
    />,
    <ScenarioScreen
      key="scenario"
      inputs={inputs}
      scenario={scenario}
      setScenario={setScenario}
      results={results}
      onNext={() => setCurrentScreen(4)}
      onBack={() => setCurrentScreen(2)}
    />,
    <AnalysisScreen
      key="analysis"
      results={results}
      inputs={inputs}
      scenario={scenario}
      onBack={() => setCurrentScreen(3)}
      onRestart={() => {
        setCurrentScreen(0)
        setInputs(defaultInputs)
        setScenario("realistic")
      }}
    />,
  ]

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {screens[currentScreen]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
