'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface PendingApproval {
  id: string
  type: 'attendance' | 'overtime' | 'expense'
  user: {
    id: string
    name: string
    email: string
  }
  site: {
    id: string
    name: string
  } | null
  date: string
  clockInAt?: string
  clockOutAt?: string
  workedMinutes?: number
  overtimeMinutes?: number
  amount?: number
  description?: string
  notes?: string
  submittedAt: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export default function ApprovalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'ALL' | 'attendance' | 'overtime' | 'expense'>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // 承認待ち項目を取得
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        manager: 'true',
        status: 'PENDING'
      })
      
      if (selectedType !== 'ALL') {
        params.append('type', selectedType)
      }
      
      if (selectedPriority !== 'ALL') {
        params.append('priority', selectedPriority)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/approvals?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setApprovals(data.data)
      } else {
        console.error('Failed to fetch pending approvals:', data.error)
        // モックデータを表示
        setApprovals([
          {
            id: '1',
            type: 'attendance',
            user: { id: 'u1', name: '田中太郎', email: 'tanaka@company.com' },
            site: { id: 's1', name: '新宿オフィスビル建設現場' },
            date: '2024-09-28',
            clockInAt: '2024-09-28T08:30:00Z',
            clockOutAt: '2024-09-28T18:30:00Z',
            workedMinutes: 600,
            overtimeMinutes: 120,
            notes: 'システム障害のため手動修正',
            submittedAt: '2024-09-28T18:35:00Z',
            priority: 'HIGH',
            status: 'PENDING'
          },
          {
            id: '2',
            type: 'overtime',
            user: { id: 'u2', name: '佐藤花子', email: 'sato@company.com' },
            site: { id: 's2', name: '渋谷マンション改修工事' },
            date: '2024-09-27',
            overtimeMinutes: 180,
            description: '緊急作業対応（配管修理）',
            submittedAt: '2024-09-27T22:00:00Z',
            priority: 'MEDIUM',
            status: 'PENDING'
          },
          {
            id: '3',
            type: 'expense',
            user: { id: 'u3', name: '鈴木次郎', email: 'suzuki@company.com' },
            site: null,
            date: '2024-09-26',
            amount: 5600,
            description: '材料調達（緊急購入）',
            submittedAt: '2024-09-26T16:00:00Z',
            priority: 'LOW',
            status: 'PENDING'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      setApprovals([])
    } finally {
      setLoading(false)
    }
  }

  // 個別承認処理
  const handleApproval = async (approvalId: string, approved: boolean, comments?: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          approved,
          comments,
          managerId: session?.user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        // 承認項目を削除（または状況を更新）
        setApprovals(prev => 
          prev.filter(approval => approval.id !== approvalId)
        )
        setSelectedItems(prev => prev.filter(id => id !== approvalId))
      } else {
        alert('承認処理に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('承認処理中にエラーが発生しました')
    }
  }

  // 一括承認処理
  const handleBulkApproval = async (approved: boolean) => {
    if (selectedItems.length === 0) {
      alert('承認する項目を選択してください')
      return
    }

    const confirmMessage = approved 
      ? `選択した${selectedItems.length}件を承認しますか？`
      : `選択した${selectedItems.length}件を却下しますか？`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch('/api/approvals/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          approvalIds: selectedItems,
          approved,
          managerId: session?.user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        // 承認済み項目を削除
        setApprovals(prev => 
          prev.filter(approval => !selectedItems.includes(approval.id))
        )
        setSelectedItems([])
      } else {
        alert('一括承認処理に失敗しました: ' + data.error)
      }
    } catch (error) {
      console.error('Bulk approval error:', error)
      alert('一括承認処理中にエラーが発生しました')
    }
  }

  // チェックボックス操作
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredApprovals.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredApprovals.map(approval => approval.id))
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user?.role !== 'MANAGER' && session?.user?.role !== 'ADMIN') {
      router.push('/home')
      return
    }

    fetchPendingApprovals()
  }, [session, status, router, selectedType, selectedPriority, searchQuery])

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
          <span className="ml-3 text-gray-600">データを読み込み中...</span>
        </div>
      </Layout>
    )
  }

  const filteredApprovals = approvals.filter(approval => {
    if (selectedType !== 'ALL' && approval.type !== selectedType) return false
    if (selectedPriority !== 'ALL' && approval.priority !== selectedPriority) return false
    if (searchQuery && !approval.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // 統計情報の計算
  const stats = {
    total: filteredApprovals.length,
    attendance: filteredApprovals.filter(a => a.type === 'attendance').length,
    overtime: filteredApprovals.filter(a => a.type === 'overtime').length,
    expense: filteredApprovals.filter(a => a.type === 'expense').length,
    high: filteredApprovals.filter(a => a.priority === 'HIGH').length,
    medium: filteredApprovals.filter(a => a.priority === 'MEDIUM').length,
    low: filteredApprovals.filter(a => a.priority === 'LOW').length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return ClockIcon
      case 'overtime': return ExclamationTriangleIcon
      case 'expense': return DocumentTextIcon
      default: return DocumentTextIcon
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'attendance': return '勤怠記録'
      case 'overtime': return '残業申請'
      case 'expense': return '経費申請'
      default: return type
    }
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">承認管理</h1>
              <p className="text-gray-600 mt-1">
                チームメンバーからの承認待ち項目を管理
              </p>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedItems.length}件選択中
                </span>
                <button
                  onClick={() => handleBulkApproval(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  一括承認
                </button>
                <button
                  onClick={() => handleBulkApproval(false)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  一括却下
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">承認待ち総数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">勤怠記録</p>
              <p className="text-2xl font-bold text-blue-600">{stats.attendance}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">残業申請</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.overtime}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">経費申請</p>
              <p className="text-2xl font-bold text-purple-600">{stats.expense}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">緊急</p>
              <p className="text-2xl font-bold text-red-600">{stats.high}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">通常</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">低優先度</p>
              <p className="text-2xl font-bold text-green-600">{stats.low}</p>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="h-4 w-4 inline mr-1" />
                種別
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="attendance">勤怠記録</option>
                <option value="overtime">残業申請</option>
                <option value="expense">経費申請</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">すべて</option>
                <option value="HIGH">緊急</option>
                <option value="MEDIUM">通常</option>
                <option value="LOW">低優先度</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="従業員名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPendingApprovals}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                検索
              </button>
            </div>
          </div>
        </div>

        {/* 承認項目リスト */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">承認待ち項目</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredApprovals.length && filteredApprovals.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-600">全選択</label>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              承認が必要な項目 ({filteredApprovals.length}件)
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredApprovals.map((approval) => {
              const TypeIcon = getTypeIcon(approval.type)
              return (
                <div key={approval.id} className="p-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(approval.id)}
                      onChange={() => handleSelectItem(approval.id)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {getTypeName(approval.type)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {approval.user.name} ({approval.user.email})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(approval.priority)}`}>
                            {approval.priority === 'HIGH' ? '緊急' : 
                             approval.priority === 'MEDIUM' ? '通常' : '低優先度'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(approval.submittedAt).toLocaleString('ja-JP')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">詳細情報</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>日付: {approval.date}</div>
                            {approval.site && <div>現場: {approval.site.name}</div>}
                            {approval.clockInAt && (
                              <div>出勤: {new Date(approval.clockInAt).toLocaleTimeString('ja-JP')}</div>
                            )}
                            {approval.clockOutAt && (
                              <div>退勤: {new Date(approval.clockOutAt).toLocaleTimeString('ja-JP')}</div>
                            )}
                            {approval.workedMinutes && (
                              <div>労働時間: {(approval.workedMinutes / 60).toFixed(1)}h</div>
                            )}
                            {approval.overtimeMinutes && (
                              <div>残業時間: {(approval.overtimeMinutes / 60).toFixed(1)}h</div>
                            )}
                            {approval.amount && (
                              <div>金額: ¥{approval.amount.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        {(approval.description || approval.notes) && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">備考・理由</h5>
                            <p className="text-sm text-gray-600">
                              {approval.description || approval.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleApproval(approval.id, false)}
                          className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          却下
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, true)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          承認
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredApprovals.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>承認待ちの項目がありません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}