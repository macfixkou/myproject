'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  BuildingOfficeIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const companySchema = z.object({
  name: z.string().min(1, '会社名は必須です').max(100, '会社名は100文字以内で入力してください'),
  kana: z.string().min(1, '会社名（カナ）は必須です').max(100, '会社名（カナ）は100文字以内で入力してください'),
  postalCode: z.string().regex(/^\d{3}-\d{4}$/, '郵便番号は000-0000の形式で入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  building: z.string().max(100, '建物名は100文字以内で入力してください').optional(),
  phone: z.string().regex(/^0\d{9,10}$/, '電話番号は正しい形式で入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  businessNumber: z.string().min(1, '法人番号は必須です').max(20, '法人番号は20文字以内で入力してください'),
  establishedDate: z.string().min(1, '設立日は必須です'),
  fiscalYearStart: z.string().min(1, '会計年度開始月は必須です'),
  employeeCount: z.number().min(1, '従業員数は1人以上で入力してください'),
  industry: z.string().min(1, '業種は必須です'),
  description: z.string().max(500, '事業内容は500文字以内で入力してください').optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

const industries = [
  '建設業', '製造業', '情報通信業', '運輸業・郵便業', '卸売業・小売業',
  '金融業・保険業', '不動産業・物品賃貸業', '学術研究・専門・技術サービス業',
  '宿泊業・飲食サービス業', '生活関連サービス業・娯楽業', '教育・学習支援業',
  '医療・福祉', '複合サービス事業', 'サービス業（他に分類されないもの）',
  '公務（他に分類されるものを除く）', 'その他'
]

export default function CompanySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: 'サンプル建設会社',
      kana: 'サンプルケンセツガイシャ',
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      address: '1-1-1',
      building: 'サンプルビル 5F',
      phone: '0312345678',
      email: 'info@sample-construction.co.jp',
      businessNumber: '1234567890123',
      establishedDate: '2000-04-01',
      fiscalYearStart: '4',
      employeeCount: 25,
      industry: '建設業',
      description: '一般建設業・土木工事業を主要事業とし、関東圏を中心に事業展開しています。'
    }
  })

  useEffect(() => {
    // LocalStorageから会社情報を読み込み
    const savedData = localStorage.getItem('companySettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        reset(data)
      } catch (error) {
        console.error('Failed to load company settings:', error)
      }
    }
  }, [reset])

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true)
    try {
      // LocalStorageに保存（実際のプロジェクトではAPIに送信）
      localStorage.setItem('companySettings', JSON.stringify(data))
      
      // 成功のトーストを表示
      toast.success('会社情報を保存しました')
      setIsEditing(false)
      
      console.log('Company settings saved:', data)
    } catch (error) {
      console.error('Failed to save company settings:', error)
      toast.error('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // フォームをリセット
    const savedData = localStorage.getItem('companySettings')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        reset(data)
      } catch (error) {
        console.error('Failed to reset form:', error)
      }
    }
    setIsEditing(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">会社基本情報</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            編集する
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-gray-600" />
            基本情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.name ? 'border-red-300' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名（カナ） <span className="text-red-500">*</span>
              </label>
              <input
                {...register('kana')}
                type="text"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.kana ? 'border-red-300' : ''}`}
              />
              {errors.kana && (
                <p className="mt-1 text-sm text-red-600">{errors.kana.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                法人番号 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('businessNumber')}
                type="text"
                disabled={!isEditing}
                placeholder="1234567890123"
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.businessNumber ? 'border-red-300' : ''}`}
              />
              {errors.businessNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.businessNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業種 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('industry')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.industry ? 'border-red-300' : ''}`}
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 住所情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
            住所情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                郵便番号 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('postalCode')}
                type="text"
                disabled={!isEditing}
                placeholder="000-0000"
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.postalCode ? 'border-red-300' : ''}`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('prefecture')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.prefecture ? 'border-red-300' : ''}`}
              >
                {prefectures.map(prefecture => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
              {errors.prefecture && (
                <p className="mt-1 text-sm text-red-600">{errors.prefecture.message}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city')}
                type="text"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.city ? 'border-red-300' : ''}`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('address')}
                type="text"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.address ? 'border-red-300' : ''}`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                建物名・階数
              </label>
              <input
                {...register('building')}
                type="text"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.building ? 'border-red-300' : ''}`}
              />
              {errors.building && (
                <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 連絡先情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2 text-gray-600" />
            連絡先情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                disabled={!isEditing}
                placeholder="0312345678"
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.phone ? 'border-red-300' : ''}`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.email ? 'border-red-300' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 会社情報 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BanknotesIcon className="h-5 w-5 mr-2 text-gray-600" />
            その他の情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                設立日 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('establishedDate')}
                type="date"
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.establishedDate ? 'border-red-300' : ''}`}
              />
              {errors.establishedDate && (
                <p className="mt-1 text-sm text-red-600">{errors.establishedDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会計年度開始月 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('fiscalYearStart')}
                disabled={!isEditing}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.fiscalYearStart ? 'border-red-300' : ''}`}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>
                    {i+1}月
                  </option>
                ))}
              </select>
              {errors.fiscalYearStart && (
                <p className="mt-1 text-sm text-red-600">{errors.fiscalYearStart.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                従業員数 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('employeeCount', { valueAsNumber: true })}
                type="number"
                disabled={!isEditing}
                min="1"
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.employeeCount ? 'border-red-300' : ''}`}
              />
              {errors.employeeCount && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeCount.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事業内容
              </label>
              <textarea
                {...register('description')}
                disabled={!isEditing}
                rows={3}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-3 ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                } ${errors.description ? 'border-red-300' : ''}`}
                placeholder="事業内容を入力してください（500文字以内）"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* 操作ガイド */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              会社基本情報について
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>会社情報は勤怠管理システムの基礎となる重要な設定です</li>
                <li>法人番号は国税庁の法人番号公表サイトで確認できます</li>
                <li>設定変更は管理者権限が必要です</li>
                <li>変更された情報は各種帳票出力に反映されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}