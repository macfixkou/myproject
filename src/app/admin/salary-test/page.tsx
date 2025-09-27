'use client'

import Layout from '@/components/layout/Layout'
import { BanknotesIcon } from '@heroicons/react/24/outline'

export default function SalaryTestPage() {
  console.log('SalaryTestPage loaded successfully')
  
  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <BanknotesIcon className="h-8 w-8 mr-3" />
                給与計算テスト
              </h1>
              <p className="text-green-100 mt-1">
                このテストページが表示されていればルーティングは正常です
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">テスト情報</h2>
          <div className="space-y-2">
            <p><strong>URL:</strong> /admin/salary-test</p>
            <p><strong>ページ状態:</strong> 正常に読み込み完了</p>
            <p><strong>タイムスタンプ:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}