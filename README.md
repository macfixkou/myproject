# 建設業勤怠管理システム

GPS付き出退勤打刻と工数管理に特化した建設業向けWebアプリケーションです。

## 主な機能

### 📍 GPS付き出退勤打刻
- ブラウザのGeolocation APIを使用したリアルタイムGPS取得
- ジオフェンス機能による現場内/外判定
- 自動休憩時間控除システム
- オフライン対応（PWA）

### ⏰ 労働時間・残業計算
- 所定労働時間（8時間）超過分の自動残業計算
- 深夜労働（22:00-05:00）・休日労働の集計
- 36協定チェックと段階的アラート通知
- 週40時間・月45時間・年360時間の上限管理

### 🏗️ 現場管理・工数管理
- 現場マスタ管理（住所、GPS座標、ジオフェンス半径）
- 現場別・作業種別・従業員別の工数集計
- 地図上でのジオフェンス設定

### 📝 業務日報
- 作業内容、写真添付、数量、安全KY記録
- 未提出アラート機能
- 現場別日報管理

### 👥 権限管理
- 管理者：全機能アクセス、設定変更、集計・出力
- 従業員：出退勤打刻、日報入力、個人履歴閲覧

### 🔔 アラート・通知機能
- 36協定違反警告（週40/月45/年360時間）
- ジオフェンス外打刻通知
- 退勤忘れアラート
- 日報未提出通知

## 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Form Handling**: React Hook Form + Zod
- **Notifications**: React Hot Toast

### バックエンド
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod

### インフラ・開発環境
- **Development**: Docker Compose (予定)
- **Database**: PostgreSQL
- **Authentication**: JWT + Refresh Token
- **PWA**: Next.js PWA Plugin (予定)

## セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL 12以上
- npm または yarn

### インストール

1. **リポジトリをクローン**
```bash
git clone <repository-url>
cd construction-timesheet-app
```

2. **依存関係をインストール**
```bash
npm install
```

3. **環境変数を設定**
```bash
cp .env.local.example .env.local
```

`.env.local`を編集してデータベース接続情報を設定：
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/construction_timesheet?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **データベースをセットアップ**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **開発サーバーを起動**
```bash
npm run dev
```

アプリケーションが `http://localhost:3000` で起動します。

## デモアカウント

### 管理者
- **Email**: admin@example.com
- **Password**: password123
- **権限**: 全機能アクセス

### 従業員1
- **Email**: employee1@example.com
- **Password**: password123
- **権限**: 出退勤打刻、日報入力

### 従業員2
- **Email**: employee2@example.com
- **Password**: password123
- **権限**: 出退勤打刻、日報入力

## 主要なデータモデル

### 会社 (Company)
- 会社情報、タイムゾーン、給与計算設定
- 休憩ポリシー、GPS必須設定

### ユーザー (User)
- 従業員・管理者情報
- 役割ベースアクセス制御

### 現場 (Site)
- 現場情報、GPS座標、ジオフェンス設定
- 発注者、工期管理

### 出勤記録 (Attendance)
- 出退勤時刻、GPS座標
- 労働時間、残業時間、深夜・休日労働
- ジオフェンス判定結果

### 業務日報 (Report)
- 作業内容、数量、写真
- 安全KY、注意事項

### アラート (Alert)
- 36協定違反、ジオフェンス外打刻
- 退勤忘れ、日報未提出

## API エンドポイント

### 認証
- `POST /api/auth/signin` - ログイン
- `POST /api/auth/signout` - ログアウト

### 出退勤
- `POST /api/attendance/clock-in` - 出勤打刻
- `POST /api/attendance/clock-out` - 退勤打刻
- `GET /api/attendance` - 出勤記録取得

### 現場管理
- `GET /api/sites` - 現場一覧取得
- `POST /api/sites` - 現場作成

### ユーザー管理
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成

## GPS機能の使用

このアプリケーションは位置情報を使用します：

1. **ブラウザ設定**
   - 位置情報の許可が必要
   - HTTPS環境での使用を推奨

2. **精度設定**
   - `enableHighAccuracy: true`
   - タイムアウト: 10秒
   - キャッシュ: 1分

3. **ジオフェンス**
   - 現場ごとに半径設定（10-1000m）
   - Haversine formula による距離計算

## セキュリティ

### 認証・認可
- NextAuth.js による安全な認証
- JWT + Refresh Token
- Role-Based Access Control (RBAC)

### データ保護
- 個人情報の暗号化（At-Rest/Transit）
- 位置情報の適切な取り扱い
- 監査ログの記録

### 監査ログ
- 全ての打刻・修正・設定変更を記録
- IPアドレス、ユーザーエージェント記録
- 変更前後の値を保存

## 今後の拡張予定

### 基本機能の完成
- [ ] 業務日報機能の実装
- [ ] 36協定アラート機能の実装
- [ ] PWA対応とオフライン機能
- [ ] カレンダー表示機能
- [ ] データエクスポート機能

### 高度な機能
- [ ] 顔認証付き打刻
- [ ] 音声による日報入力
- [ ] 交通費自動計算
- [ ] 多言語対応
- [ ] 外部システム連携

### インフラ
- [ ] Docker対応
- [ ] CI/CD パイプライン
- [ ] 本番環境デプロイ設定
- [ ] 監視・ログ収集

## ライセンス

MIT License

## サポート

質問や問題がある場合は、GitHubのIssuesを作成してください。