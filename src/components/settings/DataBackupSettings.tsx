'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

// Zod schema for data backup settings
const dataBackupSchema = z.object({
  // Auto backup settings
  autoBackupEnabled: z.boolean(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  backupTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  
  // Backup retention
  retentionPeriod: z.number().min(1).max(365),
  maxBackupFiles: z.number().min(1).max(100),
  
  // Data types to backup
  includeUserData: z.boolean(),
  includeAttendanceRecords: z.boolean(),
  includePayrollData: z.boolean(),
  includeSystemSettings: z.boolean(),
  includeReports: z.boolean(),
  
  // Cloud backup settings
  cloudBackupEnabled: z.boolean(),
  cloudProvider: z.enum(['aws', 'gcp', 'azure', 'none']),
  cloudBucketName: z.string().optional(),
  
  // Security settings
  encryptBackups: z.boolean(),
  compressionEnabled: z.boolean(),
  backupPassword: z.string().optional(),
  
  // Notification settings
  notifyOnSuccess: z.boolean(),
  notifyOnFailure: z.boolean(),
  notificationEmail: z.string().email('Invalid email format').optional(),
});

type DataBackupFormData = z.infer<typeof dataBackupSchema>;

const defaultSettings: DataBackupFormData = {
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  retentionPeriod: 30,
  maxBackupFiles: 10,
  includeUserData: true,
  includeAttendanceRecords: true,
  includePayrollData: true,
  includeSystemSettings: true,
  includeReports: false,
  cloudBackupEnabled: false,
  cloudProvider: 'none',
  cloudBucketName: '',
  encryptBackups: true,
  compressionEnabled: true,
  backupPassword: '',
  notifyOnSuccess: false,
  notifyOnFailure: true,
  notificationEmail: '',
};

interface BackupFile {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: 'auto' | 'manual';
  encrypted: boolean;
}

export default function DataBackupSettings() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupFile[]>([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<BackupFile | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<DataBackupFormData>({
    resolver: zodResolver(dataBackupSchema),
    defaultValues: defaultSettings,
  });

  const cloudBackupEnabled = watch('cloudBackupEnabled');
  const encryptBackups = watch('encryptBackups');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dataBackupSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      reset(parsedSettings);
    }

    // Load backup history
    const savedHistory = localStorage.getItem('backupHistory');
    if (savedHistory) {
      setBackupHistory(JSON.parse(savedHistory));
    } else {
      // Sample backup history
      const sampleHistory: BackupFile[] = [
        {
          id: '1',
          name: 'backup_2024-09-28_02-00.zip',
          size: '25.4 MB',
          createdAt: '2024-09-28 02:00',
          type: 'auto',
          encrypted: true,
        },
        {
          id: '2',
          name: 'manual_backup_2024-09-27_14-30.zip',
          size: '24.8 MB',
          createdAt: '2024-09-27 14:30',
          type: 'manual',
          encrypted: true,
        },
        {
          id: '3',
          name: 'backup_2024-09-27_02-00.zip',
          size: '24.2 MB',
          createdAt: '2024-09-27 02:00',
          type: 'auto',
          encrypted: true,
        },
      ];
      setBackupHistory(sampleHistory);
      localStorage.setItem('backupHistory', JSON.stringify(sampleHistory));
    }
  }, [reset]);

  const onSubmit = async (data: DataBackupFormData) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('dataBackupSettings', JSON.stringify(data));
      
      setIsEditMode(false);
      toast.success('データバックアップ設定を保存しました');
    } catch (error) {
      toast.error('設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const savedSettings = localStorage.getItem('dataBackupSettings');
    if (savedSettings) {
      reset(JSON.parse(savedSettings));
    } else {
      reset(defaultSettings);
    }
    setIsEditMode(false);
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        name: `manual_backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().slice(0, 5).replace(':', '-')}.zip`,
        size: `${(Math.random() * 10 + 20).toFixed(1)} MB`,
        createdAt: new Date().toLocaleString('ja-JP'),
        type: 'manual',
        encrypted: encryptBackups,
      };
      
      const updatedHistory = [newBackup, ...backupHistory].slice(0, 10);
      setBackupHistory(updatedHistory);
      localStorage.setItem('backupHistory', JSON.stringify(updatedHistory));
      
      toast.success('バックアップを作成しました');
    } catch (error) {
      toast.error('バックアップの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackup = (backup: BackupFile) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([''], { type: 'application/zip' }));
    link.download = backup.name;
    link.click();
    toast.success(`${backup.name} をダウンロードしました`);
  };

  const handleDeleteBackup = (backupId: string) => {
    const updatedHistory = backupHistory.filter(backup => backup.id !== backupId);
    setBackupHistory(updatedHistory);
    localStorage.setItem('backupHistory', JSON.stringify(updatedHistory));
    toast.success('バックアップファイルを削除しました');
  };

  const handleRestoreBackup = (backup: BackupFile) => {
    setSelectedBackupFile(backup);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackupFile) return;
    
    try {
      setIsLoading(true);
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`${selectedBackupFile.name} からのリストアが完了しました`);
      setShowRestoreModal(false);
      setSelectedBackupFile(null);
    } catch (error) {
      toast.error('リストアに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ServerIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">データバックアップ・リストア</h2>
            <p className="text-sm text-gray-600">システムデータのバックアップと復元設定</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center space-x-2"
                disabled={isLoading}
              >
                <XMarkIcon className="h-4 w-4" />
                <span>キャンセル</span>
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || !isDirty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>{isLoading ? '保存中...' : '保存'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>編集</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Auto Backup Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
            自動バックアップ設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoBackupEnabled')}
                  disabled={!isEditMode}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">自動バックアップを有効にする</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バックアップ頻度
              </label>
              <select
                {...register('backupFrequency')}
                disabled={!isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
              >
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バックアップ時刻
              </label>
              <input
                type="time"
                {...register('backupTime')}
                disabled={!isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
              />
              {errors.backupTime && (
                <p className="text-red-500 text-xs mt-1">{errors.backupTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                保存期間（日）
              </label>
              <input
                type="number"
                min="1"
                max="365"
                {...register('retentionPeriod', { valueAsNumber: true })}
                disabled={!isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
              />
              {errors.retentionPeriod && (
                <p className="text-red-500 text-xs mt-1">{errors.retentionPeriod.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大バックアップファイル数
              </label>
              <input
                type="number"
                min="1"
                max="100"
                {...register('maxBackupFiles', { valueAsNumber: true })}
                disabled={!isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
              />
              {errors.maxBackupFiles && (
                <p className="text-red-500 text-xs mt-1">{errors.maxBackupFiles.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Backup Data Types */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-green-600" />
            バックアップ対象データ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'includeUserData', label: 'ユーザーデータ' },
              { key: 'includeAttendanceRecords', label: '勤怠記録' },
              { key: 'includePayrollData', label: '給与データ' },
              { key: 'includeSystemSettings', label: 'システム設定' },
              { key: 'includeReports', label: 'レポート' },
            ].map(item => (
              <div key={item.key}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(item.key as keyof DataBackupFormData)}
                    disabled={!isEditMode}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Backup Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CloudArrowUpIcon className="h-5 w-5 mr-2 text-purple-600" />
            クラウドバックアップ
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('cloudBackupEnabled')}
                  disabled={!isEditMode}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">クラウドバックアップを有効にする</span>
              </label>
            </div>

            {cloudBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    クラウドプロバイダー
                  </label>
                  <select
                    {...register('cloudProvider')}
                    disabled={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                  >
                    <option value="none">選択してください</option>
                    <option value="aws">Amazon S3</option>
                    <option value="gcp">Google Cloud Storage</option>
                    <option value="azure">Azure Blob Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    バケット名
                  </label>
                  <input
                    type="text"
                    {...register('cloudBucketName')}
                    disabled={!isEditMode}
                    placeholder="backup-bucket-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-600" />
            セキュリティ設定
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('encryptBackups')}
                    disabled={!isEditMode}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">バックアップを暗号化する</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('compressionEnabled')}
                    disabled={!isEditMode}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">圧縮を有効にする</span>
                </label>
              </div>
            </div>

            {encryptBackups && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  バックアップパスワード
                </label>
                <input
                  type="password"
                  {...register('backupPassword')}
                  disabled={!isEditMode}
                  placeholder="暗号化パスワードを入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('notifyOnSuccess')}
                    disabled={!isEditMode}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">成功時に通知</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('notifyOnFailure')}
                    disabled={!isEditMode}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">失敗時に通知</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                通知メールアドレス
              </label>
              <input
                type="email"
                {...register('notificationEmail')}
                disabled={!isEditMode}
                placeholder="notification@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
              />
              {errors.notificationEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.notificationEmail.message}</p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Manual Backup Section */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">手動バックアップ</h3>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span>{isLoading ? 'バックアップ中...' : 'バックアップ作成'}</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b">
            <h4 className="font-medium text-gray-900">バックアップ履歴</h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {backupHistory.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                バックアップファイルがありません
              </div>
            ) : (
              backupHistory.map((backup) => (
                <div key={backup.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{backup.name}</span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        backup.type === 'auto' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {backup.type === 'auto' ? '自動' : '手動'}
                      </span>
                      {backup.encrypted && (
                        <ShieldCheckIcon className="h-4 w-4 text-yellow-500" title="暗号化済み" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      サイズ: {backup.size} | 作成日時: {backup.createdAt}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadBackup(backup)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="ダウンロード"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                      title="リストア"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="削除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedBackupFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">リストア確認</h3>
            <p className="text-gray-600 mb-4">
              以下のバックアップファイルからデータをリストアしますか？
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{selectedBackupFile.name}</p>
              <p className="text-sm text-gray-600">
                作成日時: {selectedBackupFile.createdAt}
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ リストアを実行すると、現在のデータが上書きされます。この操作は元に戻せません。
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackupFile(null);
                }}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                キャンセル
              </button>
              <button
                onClick={confirmRestore}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'リストア中...' : 'リストア実行'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}