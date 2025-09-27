'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

// Types
interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  managerContact: string;
  employeeCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  contractStart: string;
  contractEnd: string;
  workingHours: string;
  description: string;
}

interface SiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (site: Partial<Site>) => void;
  mode: 'view' | 'edit' | 'create';
}

// Sample site data
const sampleSites: Site[] = [
  {
    id: '1',
    name: '東京本社オフィス',
    address: '東京都千代田区丸の内1-1-1',
    city: '千代田区',
    prefecture: '東京都',
    zipCode: '100-0005',
    phone: '03-1234-5678',
    email: 'tokyo-office@company.com',
    manager: '田中太郎',
    managerContact: '090-1234-5678',
    employeeCount: 45,
    status: 'active',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-15',
    contractStart: '2023-01-01',
    contractEnd: '2025-12-31',
    workingHours: '9:00-18:00',
    description: 'メインオフィス、本社機能を担当'
  },
  {
    id: '2',
    name: '大阪営業所',
    address: '大阪府大阪市北区梅田2-2-2',
    city: '大阪市北区',
    prefecture: '大阪府',
    zipCode: '530-0001',
    phone: '06-2345-6789',
    email: 'osaka-office@company.com',
    manager: '佐藤花子',
    managerContact: '080-2345-6789',
    employeeCount: 28,
    status: 'active',
    createdAt: '2023-03-01',
    updatedAt: '2024-01-10',
    contractStart: '2023-03-01',
    contractEnd: '2024-12-31',
    workingHours: '9:00-18:00',
    description: '関西地区営業拠点'
  },
  {
    id: '3',
    name: '名古屋支店',
    address: '愛知県名古屋市中区錦3-3-3',
    city: '名古屋市中区',
    prefecture: '愛知県',
    zipCode: '460-0003',
    phone: '052-3456-7890',
    email: 'nagoya-office@company.com',
    manager: '鈴木次郎',
    managerContact: '070-3456-7890',
    employeeCount: 32,
    status: 'active',
    createdAt: '2023-06-01',
    updatedAt: '2023-12-20',
    contractStart: '2023-06-01',
    contractEnd: '2025-05-31',
    workingHours: '8:30-17:30',
    description: '中部地区営業・サポート拠点'
  },
  {
    id: '4',
    name: '福岡営業所',
    address: '福岡県福岡市博多区博多駅前4-4-4',
    city: '福岡市博多区',
    prefecture: '福岡県',
    zipCode: '812-0011',
    phone: '092-4567-8901',
    email: 'fukuoka-office@company.com',
    manager: '高橋三郎',
    managerContact: '090-4567-8901',
    employeeCount: 18,
    status: 'active',
    createdAt: '2023-09-01',
    updatedAt: '2024-01-05',
    contractStart: '2023-09-01',
    contractEnd: '2024-08-31',
    workingHours: '9:00-18:00',
    description: '九州地区営業拠点'
  },
  {
    id: '5',
    name: '札幌営業所',
    address: '北海道札幌市中央区大通西5-5-5',
    city: '札幌市中央区',
    prefecture: '北海道',
    zipCode: '060-0042',
    phone: '011-5678-9012',
    email: 'sapporo-office@company.com',
    manager: '山田四郎',
    managerContact: '080-5678-9012',
    employeeCount: 15,
    status: 'maintenance',
    createdAt: '2023-11-01',
    updatedAt: '2024-01-12',
    contractStart: '2023-11-01',
    contractEnd: '2024-10-31',
    workingHours: '9:00-17:30',
    description: '北海道地区営業拠点（設備メンテナンス中）'
  },
  {
    id: '6',
    name: '研修センター',
    address: '神奈川県横浜市西区みなとみらい6-6-6',
    city: '横浜市西区',
    prefecture: '神奈川県',
    zipCode: '220-0012',
    phone: '045-6789-0123',
    email: 'training-center@company.com',
    manager: '伊藤五郎',
    managerContact: '090-6789-0123',
    employeeCount: 8,
    status: 'inactive',
    createdAt: '2023-04-01',
    updatedAt: '2023-12-15',
    contractStart: '2023-04-01',
    contractEnd: '2024-03-31',
    workingHours: '9:00-17:00',
    description: '従業員研修施設（現在使用停止中）'
  }
];

// Site Detail Modal Component
const SiteModal = ({ site, isOpen, onClose, onSave, mode }: SiteModalProps) => {
  const [formData, setFormData] = useState<Partial<Site>>({});

  useEffect(() => {
    if (site && mode !== 'create') {
      setFormData(site);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        address: '',
        city: '',
        prefecture: '',
        zipCode: '',
        phone: '',
        email: '',
        manager: '',
        managerContact: '',
        status: 'active',
        workingHours: '9:00-18:00',
        description: ''
      });
    }
  }, [site, mode]);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? '新規拠点登録' : mode === 'edit' ? '拠点情報編集' : '拠点詳細情報'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">基本情報</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">拠点名</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
                <input
                  type="text"
                  value={formData.prefecture || ''}
                  onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">市区町村</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
              <input
                type="text"
                value={formData.zipCode || ''}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Site['status'] })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="active">稼働中</option>
                <option value="inactive">停止中</option>
                <option value="maintenance">メンテナンス中</option>
              </select>
            </div>
          </div>

          {/* 連絡先・管理情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">連絡先・管理情報</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">拠点管理者</label>
              <input
                type="text"
                value={formData.manager || ''}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">管理者連絡先</label>
              <input
                type="text"
                value={formData.managerContact || ''}
                onChange={(e) => setFormData({ ...formData, managerContact: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">勤務時間</label>
              <input
                type="text"
                value={formData.workingHours || ''}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* 契約情報・説明 */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">契約情報・説明</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">契約開始日</label>
                <input
                  type="date"
                  value={formData.contractStart || ''}
                  onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">契約終了日</label>
                <input
                  type="date"
                  value={formData.contractEnd || ''}
                  onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考・説明</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {mode === 'view' ? '閉じる' : 'キャンセル'}
          </button>
          {mode !== 'view' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? '登録' : '保存'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SitesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>(sampleSites);
  const [filteredSites, setFilteredSites] = useState<Site[]>(sampleSites);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    let filtered = sites;

    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.manager.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [sites, searchTerm, statusFilter]);

  const handleViewSite = (site: Site) => {
    setSelectedSite(site);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditSite = (site: Site) => {
    setSelectedSite(site);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateSite = () => {
    setSelectedSite(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm('この拠点を削除してもよろしいですか？')) {
      setSites(sites.filter(site => site.id !== siteId));
    }
  };

  const handleSaveSite = (siteData: Partial<Site>) => {
    if (modalMode === 'create') {
      const newSite: Site = {
        ...siteData as Site,
        id: (sites.length + 1).toString(),
        employeeCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setSites([...sites, newSite]);
    } else if (modalMode === 'edit' && selectedSite) {
      setSites(sites.map(site =>
        site.id === selectedSite.id
          ? { ...site, ...siteData, updatedAt: new Date().toISOString().split('T')[0] }
          : site
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '稼働中', className: 'bg-green-100 text-green-800' },
      inactive: { label: '停止中', className: 'bg-red-100 text-red-800' },
      maintenance: { label: 'メンテナンス中', className: 'bg-yellow-100 text-yellow-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.status === 'active').length;
  const totalEmployees = sites.reduce((sum, site) => sum + site.employeeCount, 0);
  const maintenanceSites = sites.filter(site => site.status === 'maintenance').length;

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </Layout>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">拠点管理</h1>
          <p className="text-gray-600">全社拠点の管理と運営状況を確認できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">総拠点数</h3>
                <p className="text-3xl font-bold text-blue-600">{totalSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <MapPinIcon className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">稼働拠点</h3>
                <p className="text-3xl font-bold text-green-600">{activeSites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="h-12 w-12 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">総従業員数</h3>
                <p className="text-3xl font-bold text-purple-600">{totalEmployees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-12 w-12 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">メンテナンス中</h3>
                <p className="text-3xl font-bold text-yellow-600">{maintenanceSites}</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="拠点名、住所、管理者で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全てのステータス</option>
                <option value="active">稼働中</option>
                <option value="inactive">停止中</option>
                <option value="maintenance">メンテナンス中</option>
              </select>
            </div>
            <button
              onClick={handleCreateSite}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新規拠点登録
            </button>
          </div>
        </div>

        {/* 拠点一覧テーブル */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    拠点情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所在地
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    管理者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    従業員数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約期間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {site.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{site.prefecture} {site.city}</div>
                      <div className="text-sm text-gray-500">{site.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{site.manager}</div>
                      <div className="text-sm text-gray-500">{site.managerContact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{site.employeeCount}名</div>
                      <div className="text-sm text-gray-500">{site.workingHours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(site.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{site.contractStart}</div>
                      <div className="text-sm text-gray-500">〜 {site.contractEnd}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewSite(site)}
                          className="text-blue-600 hover:text-blue-900"
                          title="詳細表示"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditSite(site)}
                          className="text-green-600 hover:text-green-900"
                          title="編集"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSites.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">拠点が見つかりません</h3>
              <p className="mt-1 text-sm text-gray-500">
                検索条件を変更するか、新しい拠点を登録してください。
              </p>
            </div>
          )}
        </div>

        {/* 拠点詳細/編集/作成モーダル */}
        <SiteModal
          site={selectedSite}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSite}
          mode={modalMode}
        />
      </div>
    </Layout>
  );
}