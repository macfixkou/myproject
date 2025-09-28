'use client'

import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  CurrencyYenIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

interface EmployeeSalaryConfig {
  // 基本給与情報
  employeeId: string
  basicSalary: number
  hourlyWage: number
  
  // 手当設定
  allowances: {
    positionAllowance: number      // 役職手当
    familyAllowance: number        // 家族手当
    transportationAllowance: number // 交通費
    mealAllowance: number          // 食事手当
    housingAllowance: number       // 住宅手当
    overtimeAllowance: number      // 時間外手当
    nightShiftAllowance: number    // 深夜手当
    holidayAllowance: number       // 休日手当
    specialAllowance: number       // 特別手当
    otherAllowances: { name: string; amount: number }[]
  }
  
  // 控除設定
  deductions: {
    healthInsurance: number        // 健康保険
    pensionInsurance: number       // 厚生年金保険
    employmentInsurance: number    // 雇用保険
    incomeTax: number             // 所得税
    residentTax: number           // 住民税
    unionFee: number              // 組合費
    otherDeductions: { name: string; amount: number }[]
  }
  
  // 勤務設定
  workSettings: {
    standardWorkDays: number       // 標準出勤日数
    standardWorkHours: number      // 標準労働時間
    overtimeRate: number          // 残業割増率(%)
    nightShiftRate: number        // 深夜割増率(%)
    holidayRate: number           // 休日割増率(%)
  }
}

interface EmployeeSalaryFormProps {
  employee: any
  salaryConfig?: EmployeeSalaryConfig
  onSave: (config: EmployeeSalaryConfig) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function EmployeeSalaryForm({
  employee,
  salaryConfig,
  onSave,
  onCancel,
  isLoading = false
}: EmployeeSalaryFormProps) {
  const [config, setConfig] = useState<EmployeeSalaryConfig>({
    employeeId: employee.id,
    basicSalary: 250000,
    hourlyWage: 1500,
    allowances: {
      positionAllowance: 0,
      familyAllowance: 0,
      transportationAllowance: 15000,
      mealAllowance: 8000,
      housingAllowance: 0,
      overtimeAllowance: 0,
      nightShiftAllowance: 0,
      holidayAllowance: 0,
      specialAllowance: 0,
      otherAllowances: []
    },
    deductions: {
      healthInsurance: 12250,
      pensionInsurance: 22950,
      employmentInsurance: 1683,
      incomeTax: 8500,
      residentTax: 12000,
      unionFee: 0,
      otherDeductions: []
    },
    workSettings: {
      standardWorkDays: 22,
      standardWorkHours: 176,
      overtimeRate: 25,
      nightShiftRate: 25,
      holidayRate: 35
    }
  })

  useEffect(() => {
    if (salaryConfig) {
      setConfig(salaryConfig)
    }
  }, [salaryConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(config)
  }

  const addCustomAllowance = () => {
    setConfig(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        otherAllowances: [...prev.allowances.otherAllowances, { name: '', amount: 0 }]
      }
    }))
  }

  const removeCustomAllowance = (index: number) => {
    setConfig(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        otherAllowances: prev.allowances.otherAllowances.filter((_, i) => i !== index)
      }
    }))
  }

  const updateCustomAllowance = (index: number, field: 'name' | 'amount', value: string | number) => {
    setConfig(prev => ({
      ...prev,
      allowances: {
        ...prev.allowances,
        otherAllowances: prev.allowances.otherAllowances.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const addCustomDeduction = () => {
    setConfig(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        otherDeductions: [...prev.deductions.otherDeductions, { name: '', amount: 0 }]
      }
    }))
  }

  const removeCustomDeduction = (index: number) => {
    setConfig(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        otherDeductions: prev.deductions.otherDeductions.filter((_, i) => i !== index)
      }
    }))
  }

  const updateCustomDeduction = (index: number, field: 'name' | 'amount', value: string | number) => {
    setConfig(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        otherDeductions: prev.deductions.otherDeductions.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <CurrencyYenIcon className="h-6 w-6 mr-2 text-green-600" />
            {employee.name}の給与設定
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本給与情報 */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyYenIcon className="h-5 w-5 mr-2 text-blue-600" />
              基本給与情報
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">基本給（月額）</label>
                <input
                  type="number"
                  value={config.basicSalary}
                  onChange={(e) => setConfig(prev => ({ ...prev, basicSalary: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">時給</label>
                <input
                  type="number"
                  value={config.hourlyWage}
                  onChange={(e) => setConfig(prev => ({ ...prev, hourlyWage: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 手当設定 */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-green-600" />
              手当設定
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">役職手当</label>
                <input
                  type="number"
                  value={config.allowances.positionAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, positionAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">家族手当</label>
                <input
                  type="number"
                  value={config.allowances.familyAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, familyAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">交通費</label>
                <input
                  type="number"
                  value={config.allowances.transportationAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, transportationAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">食事手当</label>
                <input
                  type="number"
                  value={config.allowances.mealAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, mealAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">住宅手当</label>
                <input
                  type="number"
                  value={config.allowances.housingAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, housingAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">特別手当</label>
                <input
                  type="number"
                  value={config.allowances.specialAllowance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, specialAllowance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* カスタム手当 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-medium text-gray-800">その他手当</h5>
                <button
                  type="button"
                  onClick={addCustomAllowance}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  追加
                </button>
              </div>
              {config.allowances.otherAllowances.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <input
                    type="text"
                    placeholder="手当名"
                    value={item.name}
                    onChange={(e) => updateCustomAllowance(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="金額"
                    value={item.amount}
                    onChange={(e) => updateCustomAllowance(index, 'amount', parseInt(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomAllowance(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 控除設定 */}
          <div className="bg-red-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MinusIcon className="h-5 w-5 mr-2 text-red-600" />
              控除設定
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">健康保険</label>
                <input
                  type="number"
                  value={config.deductions.healthInsurance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, healthInsurance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">厚生年金保険</label>
                <input
                  type="number"
                  value={config.deductions.pensionInsurance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, pensionInsurance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">雇用保険</label>
                <input
                  type="number"
                  value={config.deductions.employmentInsurance}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, employmentInsurance: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所得税</label>
                <input
                  type="number"
                  value={config.deductions.incomeTax}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, incomeTax: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">住民税</label>
                <input
                  type="number"
                  value={config.deductions.residentTax}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, residentTax: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">組合費</label>
                <input
                  type="number"
                  value={config.deductions.unionFee}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, unionFee: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* カスタム控除 */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-medium text-gray-800">その他控除</h5>
                <button
                  type="button"
                  onClick={addCustomDeduction}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  追加
                </button>
              </div>
              {config.deductions.otherDeductions.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <input
                    type="text"
                    placeholder="控除名"
                    value={item.name}
                    onChange={(e) => updateCustomDeduction(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="number"
                    placeholder="金額"
                    value={item.amount}
                    onChange={(e) => updateCustomDeduction(index, 'amount', parseInt(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomDeduction(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 勤務設定 */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
              勤務設定
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">標準出勤日数</label>
                <input
                  type="number"
                  value={config.workSettings.standardWorkDays}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    workSettings: { ...prev.workSettings, standardWorkDays: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">標準労働時間</label>
                <input
                  type="number"
                  value={config.workSettings.standardWorkHours}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    workSettings: { ...prev.workSettings, standardWorkHours: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">残業割増率(%)</label>
                <input
                  type="number"
                  value={config.workSettings.overtimeRate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    workSettings: { ...prev.workSettings, overtimeRate: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">深夜割増率(%)</label>
                <input
                  type="number"
                  value={config.workSettings.nightShiftRate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    workSettings: { ...prev.workSettings, nightShiftRate: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">休日割増率(%)</label>
                <input
                  type="number"
                  value={config.workSettings.holidayRate}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    workSettings: { ...prev.workSettings, holidayRate: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}