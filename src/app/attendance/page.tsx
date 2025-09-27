'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmployeeLayout from '@/components/layout/EmployeeLayout';
import Layout from '@/components/layout/Layout';
import {
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

// Types
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  workHours: number;
  overtimeHours: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'working';
  notes: string;
  location: string;
}

interface AttendanceStats {
  totalWorkDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
  overtimeHours: number;
}

// Sample attendance data
const sampleAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '001',
    employeeName: '田中太郎',
    date: '2024-01-26',
    clockIn: '09:00',
    clockOut: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    workHours: 8,
    overtimeHours: 0,
    status: 'present',
    notes: '',
    location: '本社'
  },
  {
    id: '2',
    employeeId: '001',
    employeeName: '田中太郎',
    date: '2024-01-25',
    clockIn: '09:15',
    clockOut: '18:30',
    breakStart: '12:00',
    breakEnd: '13:00',
    workHours: 8.25,
    overtimeHours: 0.5,
    status: 'late',
    notes: '電車遅延のため遅刻',
    location: '本社'
  },
  {
    id: '3',
    employeeId: '001',
    employeeName: '田中太郎',
    date: '2024-01-24',
    clockIn: '08:45',
    clockOut: '19:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    workHours: 9.25,
    overtimeHours: 1.25,
    status: 'present',
    notes: '残業対応',
    location: '本社'
  },
  {
    id: '4',
    employeeId: '001',
    employeeName: '田中太郎',
    date: '2024-01-23',
    clockIn: null,
    clockOut: null,
    breakStart: null,
    breakEnd: null,
    workHours: 0,
    overtimeHours: 0,
    status: 'absent',
    notes: '有給休暇',
    location: ''
  },
  {
    id: '5',
    employeeId: '001',
    employeeName: '田中太郎',
    date: '2024-01-22',
    clockIn: '09:00',
    clockOut: '17:30',
    breakStart: '12:00',
    breakEnd: '13:00',
    workHours: 7.5,
    overtimeHours: 0,
    status: 'early_leave',
    notes: '早退（体調不良）',
    location: '本社'
  }
];

// Today's attendance for clock in/out functionality
interface TodayAttendance {
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  status: 'not_started' | 'working' | 'on_break' | 'finished';
}

const AttendanceClockModal = ({ 
  isOpen, 
  onClose, 
  action, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  action: string; 
  onConfirm: () => void; 
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const actionLabels: { [key: string]: string } = {
    clockIn: '出勤',
    clockOut: '退勤',
    breakStart: '休憩開始',
    breakEnd: '休憩終了'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {actionLabels[action]}確認
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            現在時刻: {new Date().toLocaleTimeString('ja-JP', { hour12: false })}
          </p>
          <p className="text-gray-800">
            {actionLabels[action]}を記録しますか？
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備考（任意）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="備考があれば入力してください"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(sampleAttendanceData);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(sampleAttendanceData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance>({
    clockIn: null,
    clockOut: null,
    breakStart: null,
    breakEnd: null,
    status: 'not_started'
  });
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    let filtered = attendanceRecords;

    // Filter by employee if not admin
    if (session?.user.role !== 'ADMIN') {
      filtered = filtered.filter(record => record.employeeId === session?.user.id);
    }

    if (searchTerm && session?.user.role === 'ADMIN') {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(record => record.date >= dateRange.start);
    }

    if (dateRange.end) {
      filtered = filtered.filter(record => record.date <= dateRange.end);
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, searchTerm, statusFilter, dateRange, session]);

  const handleClockAction = (action: string) => {
    setPendingAction(action);
    setIsClockModalOpen(true);
  };

  const confirmClockAction = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit' });

    setTodayAttendance(prev => {
      const newAttendance = { ...prev };
      
      switch (pendingAction) {
        case 'clockIn':
          newAttendance.clockIn = timeString;
          newAttendance.status = 'working';
          break;
        case 'clockOut':
          newAttendance.clockOut = timeString;
          newAttendance.status = 'finished';
          break;
        case 'breakStart':
          newAttendance.breakStart = timeString;
          newAttendance.status = 'on_break';
          break;
        case 'breakEnd':
          newAttendance.breakEnd = timeString;
          newAttendance.status = 'working';
          break;
      }
      
      return newAttendance;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: '出勤', className: 'bg-green-100 text-green-800' },
      absent: { label: '欠勤', className: 'bg-red-100 text-red-800' },
      late: { label: '遅刻', className: 'bg-yellow-100 text-yellow-800' },
      early_leave: { label: '早退', className: 'bg-orange-100 text-orange-800' },
      working: { label: '勤務中', className: 'bg-blue-100 text-blue-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const calculateStats = (): AttendanceStats => {
    const records = session?.user.role === 'ADMIN' ? filteredRecords : 
                   filteredRecords.filter(record => record.employeeId === session?.user.id);
    
    return {
      totalWorkDays: records.length,
      presentDays: records.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'early_leave').length,
      absentDays: records.filter(r => r.status === 'absent').length,
      lateDays: records.filter(r => r.status === 'late').length,
      totalWorkHours: records.reduce((sum, r) => sum + r.workHours, 0),
      averageWorkHours: records.length > 0 ? records.reduce((sum, r) => sum + r.workHours, 0) / records.length : 0,
      overtimeHours: records.reduce((sum, r) => sum + r.overtimeHours, 0)
    };
  };

  const stats = calculateStats();
  const isAdmin = session?.user.role === 'ADMIN';
  const LayoutComponent = isAdmin ? Layout : EmployeeLayout;

  if (status === 'loading') {
    return (
      <LayoutComponent>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </LayoutComponent>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <LayoutComponent>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">勤怠管理</h1>
          <p className="text-gray-600">
            {isAdmin ? '全従業員の勤怠状況を管理できます' : '勤怠の記録と確認ができます'}
          </p>
        </div>

        {/* 今日の勤怠（従業員のみ） */}
        {!isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">今日の勤怠</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">出勤時間</div>
                <div className="text-lg font-semibold text-gray-900">
                  {todayAttendance.clockIn || '--:--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">退勤時間</div>
                <div className="text-lg font-semibold text-gray-900">
                  {todayAttendance.clockOut || '--:--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">休憩開始</div>
                <div className="text-lg font-semibold text-gray-900">
                  {todayAttendance.breakStart || '--:--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">休憩終了</div>
                <div className="text-lg font-semibold text-gray-900">
                  {todayAttendance.breakEnd || '--:--'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleClockAction('clockIn')}
                disabled={todayAttendance.clockIn !== null}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                出勤
              </button>
              <button
                onClick={() => handleClockAction('breakStart')}
                disabled={!todayAttendance.clockIn || todayAttendance.status === 'on_break'}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <PauseIcon className="h-5 w-5 mr-2" />
                休憩開始
              </button>
              <button
                onClick={() => handleClockAction('breakEnd')}
                disabled={todayAttendance.status !== 'on_break'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                休憩終了
              </button>
              <button
                onClick={() => handleClockAction('clockOut')}
                disabled={!todayAttendance.clockIn || todayAttendance.clockOut !== null}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                退勤
              </button>
            </div>
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">総勤務日数</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalWorkDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">出勤日数</h3>
                <p className="text-3xl font-bold text-green-600">{stats.presentDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="h-12 w-12 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">総勤務時間</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalWorkHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-12 w-12 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">残業時間</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.overtimeHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {isAdmin && (
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="従業員名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60"
                  />
                </div>
              )}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全ステータス</option>
                <option value="present">出勤</option>
                <option value="absent">欠勤</option>
                <option value="late">遅刻</option>
                <option value="early_leave">早退</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">〜</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Excel出力
            </button>
          </div>
        </div>

        {/* 勤怠記録一覧 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      従業員
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出勤時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    退勤時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    休憩時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勤務時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    残業時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{record.date}</div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.clockIn || '--:--'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.clockOut || '--:--'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.breakStart && record.breakEnd 
                          ? `${record.breakStart} - ${record.breakEnd}`
                          : '--:-- - --:--'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.workHours.toFixed(1)}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.overtimeHours > 0 ? `${record.overtimeHours.toFixed(1)}h` : '--'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{record.notes || '--'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">勤怠記録が見つかりません</h3>
              <p className="mt-1 text-sm text-gray-500">
                検索条件を変更してください。
              </p>
            </div>
          )}
        </div>

        {/* 打刻確認モーダル */}
        <AttendanceClockModal
          isOpen={isClockModalOpen}
          onClose={() => setIsClockModalOpen(false)}
          action={pendingAction}
          onConfirm={confirmClockAction}
        />
      </div>
    </LayoutComponent>
  );
}