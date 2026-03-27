# スマート漁業PWA開発スキル

## 概要

このスキルは、漁師の操業記録を効率化し、最適な意思決定を支援するPWA（Progressive Web App）を構築するためのガイドラインです。完全オフライン対応、コンポーネント指向設計、TypeScript型安全性を重視した実装を行います。

---

## プロジェクト構成

### ディレクトリ構造

```
fishing-pwa/
├── frontend/                      # フロントエンド (React + TypeScript)
│   ├── public/
│   │   ├── manifest.json         # PWA マニフェスト
│   │   ├── service-worker.js     # オフライン対応
│   │   └── icons/                # アプリアイコン
│   ├── src/
│   │   ├── components/           # 再利用可能なUIコンポーネント
│   │   │   ├── common/          # 共通コンポーネント
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.types.ts
│   │   │   │   │   └── Button.styles.ts
│   │   │   │   ├── TextInput/
│   │   │   │   ├── SelectInput/
│   │   │   │   ├── MultiSelect/
│   │   │   │   ├── CompassSelect/
│   │   │   │   ├── CatchCounter/
│   │   │   │   └── FormSection/
│   │   │   ├── layout/          # レイアウトコンポーネント
│   │   │   │   ├── AppBar/
│   │   │   │   ├── BottomNavigation/
│   │   │   │   └── AppLayout/
│   │   │   └── features/        # 機能別コンポーネント
│   │   │       ├── departure/   # 出航記録
│   │   │       ├── deployment/  # 縄設置記録
│   │   │       ├── retrieval/   # 縄回収記録
│   │   │       └── return/      # 帰港記録
│   │   ├── pages/               # ページコンポーネント
│   │   │   ├── HomePage.tsx
│   │   │   ├── DeparturePage.tsx
│   │   │   ├── DeploymentPage.tsx
│   │   │   ├── RetrievalPage.tsx
│   │   │   ├── ReturnPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/               # カスタムフック
│   │   │   ├── useOnlineStatus.ts
│   │   │   ├── useSync.ts
│   │   │   ├── useLocalDB.ts
│   │   │   └── useForm.ts
│   │   ├── services/            # ビジネスロジック
│   │   │   ├── db/
│   │   │   │   ├── FishingDB.ts          # Dexie.js設定
│   │   │   │   ├── fishingRecords.ts     # レコード操作
│   │   │   │   ├── deployments.ts        # 設置記録操作
│   │   │   │   ├── retrievals.ts         # 回収記録操作
│   │   │   │   └── syncQueue.ts          # 同期キュー
│   │   │   ├── api/
│   │   │   │   ├── client.ts             # API クライアント
│   │   │   │   ├── fishingAPI.ts         # 漁業記録API
│   │   │   │   └── syncAPI.ts            # 同期API
│   │   │   ├── sync/
│   │   │   │   ├── SyncManager.ts        # 同期管理
│   │   │   │   └── ConflictResolver.ts   # 衝突解決
│   │   │   └── calculations/
│   │   │       ├── moonPhase.ts          # 月齢計算
│   │   │       ├── duration.ts           # 滞留時間計算
│   │   │       └── roi.ts                # ROI計算
│   │   ├── types/               # TypeScript型定義
│   │   │   ├── fishing.types.ts
│   │   │   ├── deployment.types.ts
│   │   │   ├── retrieval.types.ts
│   │   │   └── common.types.ts
│   │   ├── utils/               # ユーティリティ関数
│   │   │   ├── validation.ts
│   │   │   ├── formatters.ts
│   │   │   └── storage.ts
│   │   ├── styles/              # グローバルスタイル
│   │   │   ├── theme.ts
│   │   │   ├── globals.css
│   │   │   └── variables.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # バックエンド (Python + FastAPI)
│   ├── app/
│   │   ├── api/                 # APIエンドポイント
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── fishing.py   # 漁業記録エンドポイント
│   │   │   │   ├── sync.py      # 同期エンドポイント
│   │   │   │   └── analytics.py # 分析エンドポイント
│   │   │   └── __init__.py
│   │   ├── core/                # コア機能
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # 設定
│   │   │   ├── security.py      # セキュリティ
│   │   │   └── database.py      # DB接続
│   │   ├── models/              # データモデル (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── fishing_record.py
│   │   │   ├── deployment.py
│   │   │   ├── retrieval.py
│   │   │   └── user.py
│   │   ├── schemas/             # APIスキーマ
│   │   │   ├── __init__.py
│   │   │   ├── fishing.py
│   │   │   └── response.py
│   │   ├── services/            # ビジネスロジック
│   │   │   ├── __init__.py
│   │   │   ├── fishing_service.py
│   │   │   ├── sync_service.py
│   │   │   └── analytics_service.py
│   │   ├── db/                  # データベース操作
│   │   │   ├── __init__.py
│   │   │   ├── repositories/
│   │   │   │   ├── fishing_repo.py
│   │   │   │   ├── deployment_repo.py
│   │   │   │   └── retrieval_repo.py
│   │   │   └── migrations/      # マイグレーション
│   │   ├── ml/                  # 機械学習モデル
│   │   │   ├── __init__.py
│   │   │   ├── predictor.py     # 予測モデル
│   │   │   └── trainer.py       # 学習スクリプト
│   │   └── main.py
│   ├── tests/
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── test_models/
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
├── docs/                        # ドキュメント
│   ├── api/                     # API仕様書
│   ├── architecture/            # アーキテクチャ図
│   └── setup/                   # セットアップ手順
│
└── README.md
```

---

## 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Dexie.js** (IndexedDB wrapper)
- **TanStack Query** (データフェッチング)
- **Zustand** (状態管理)
- **React Router** (ルーティング)
- **Tailwind CSS** (スタイリング)
- **Framer Motion** (アニメーション)
- **Leaflet.js** (地図表示)
- **Chart.js** (グラフ描画)

### バックエンド
- **FastAPI** (Python)
- **Supabase** / **PostgreSQL** (データベース)
- **Pydantic** (バリデーション)
- **SQLAlchemy** (ORM)
- **Alembic** (マイグレーション)
- **scikit-learn** (機械学習)

### インフラ
- **Cloudflare Pages** (フロントエンドホスティング)
- **Cloudflare Workers** (エッジコンピューティング)
- **GitHub Actions** (CI/CD)

---

## 開発原則

### 1. コンポーネント設計原則

#### **単一責任の原則（SRP）**
各コンポーネントは1つの責任のみを持つ。

```typescript
// ❌ 悪い例: 1つのコンポーネントが複数の責任を持つ
const FishingForm = () => {
  // データ取得、検証、送信、UI表示が混在
  const [data, setData] = useState({});
  const validateData = () => { /* ... */ };
  const submitData = async () => { /* ... */ };
  
  return (
    <div>
      {/* 複雑なフォームロジック */}
    </div>
  );
};

// ✅ 良い例: 責任を分割
const useFishingForm = () => {
  // データロジックのみ
  const [data, setData] = useState({});
  const validate = () => { /* ... */ };
  const submit = async () => { /* ... */ };
  return { data, setData, validate, submit };
};

const FishingFormUI = ({ data, onChange, onSubmit }) => {
  // UI表示のみ
  return <form>{/* ... */}</form>;
};

const FishingFormPage = () => {
  // 統合
  const form = useFishingForm();
  return <FishingFormUI {...form} />;
};
```

#### **プレゼンテーションとコンテナの分離**

```typescript
// containers/DepartureContainer.tsx
export const DepartureContainer = () => {
  const form = useDepartureForm();
  const { mutate: saveDeparture } = useSaveDeparture();
  
  const handleSubmit = async (data) => {
    await saveDeparture(data);
    navigate('/deployment/1');
  };
  
  return (
    <DepartureForm
      data={form.data}
      onChange={form.setData}
      onSubmit={handleSubmit}
      errors={form.errors}
    />
  );
};

// components/DepartureForm.tsx
export const DepartureForm = ({ data, onChange, onSubmit, errors }) => {
  // UIのみ、ロジックなし
  return (
    <form onSubmit={onSubmit}>
      <TextInput
        label="出港時刻"
        value={data.fishing_start_time}
        onChange={(v) => onChange({ ...data, fishing_start_time: v })}
        error={errors.fishing_start_time}
      />
      {/* ... */}
    </form>
  );
};
```

---

### 2. ファイル命名規則

#### **コンポーネント**
- **PascalCase**: `Button.tsx`, `TextInput.tsx`
- **1コンポーネント = 1ファイル**

#### **フック**
- **camelCase + use プレフィックス**: `useOnlineStatus.ts`, `useFishingForm.ts`

#### **ユーティリティ**
- **camelCase**: `validation.ts`, `formatters.ts`

#### **型定義**
- **PascalCase + .types サフィックス**: `fishing.types.ts`, `common.types.ts`

#### **コンポーネントフォルダ構造**
```
Button/
├── Button.tsx           # メインコンポーネント
├── Button.types.ts      # 型定義
├── Button.styles.ts     # スタイル（必要なら）
├── Button.test.tsx      # テスト
└── index.ts             # エクスポート
```

---

### 3. 型定義の管理

#### **型定義の配置**
```typescript
// types/fishing.types.ts
export interface FishingRecord {
  id: string;
  user_id: string;
  date: string;
  departure: DepartureData;
  return?: ReturnData;
}

export interface DepartureData {
  fishing_start_time: string;
  crew: string[];
  target_species: string[];
  // ...
}
```

#### **コンポーネントProps型**
```typescript
// components/common/Button/Button.types.ts
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}
```

---

### 4. カスタムフックの設計

#### **データフェッチング用フック**
```typescript
// hooks/useFishingRecords.ts
import { useQuery } from '@tanstack/react-query';
import { fishingAPI } from '@/services/api/fishingAPI';

export const useFishingRecords = (filters?: RecordFilters) => {
  return useQuery({
    queryKey: ['fishing-records', filters],
    queryFn: () => fishingAPI.getRecords(filters),
    staleTime: 5 * 60 * 1000, // 5分
  });
};
```

#### **フォーム管理用フック**
```typescript
// hooks/useForm.ts
export const useForm = <T extends object>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>
) => {
  const [data, setData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const validate = () => {
    if (!validationSchema) return true;
    const result = validationSchema.validate(data);
    setErrors(result.errors);
    return result.isValid;
  };
  
  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // リアルタイムバリデーション
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  return { data, setData, errors, validate, handleChange };
};
```

#### **オフライン対応フック**
```typescript
// hooks/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

---

### 5. データベース設計

#### **Dexie.js セットアップ**
```typescript
// services/db/FishingDB.ts
import Dexie, { Table } from 'dexie';
import type { FishingRecord, Deployment, Retrieval } from '@/types';

export class FishingDB extends Dexie {
  fishing_records!: Table<FishingRecord>;
  deployments!: Table<Deployment>;
  retrievals!: Table<Retrieval>;
  sync_queue!: Table<SyncQueueItem>;
  
  constructor() {
    super('FishingAppDB');
    
    this.version(1).stores({
      fishing_records: 'id, user_id, date, vessel_name, sync_status',
      deployments: 'id, record_id, line_number, deployment_time, [record_id+line_number]',
      retrievals: 'id, deployment_id, retrieval_time, sync_status',
      sync_queue: '++id, type, priority, created_at, status'
    });
  }
}

export const db = new FishingDB();
```

#### **リポジトリパターン**
```typescript
// services/db/fishingRecords.ts
import { db } from './FishingDB';
import type { FishingRecord } from '@/types';

export const fishingRecordsRepo = {
  async getById(id: string): Promise<FishingRecord | undefined> {
    return await db.fishing_records.get(id);
  },
  
  async getByDate(date: string): Promise<FishingRecord | undefined> {
    return await db.fishing_records
      .where('date')
      .equals(date)
      .first();
  },
  
  async create(record: FishingRecord): Promise<string> {
    return await db.fishing_records.add(record);
  },
  
  async update(id: string, changes: Partial<FishingRecord>): Promise<number> {
    return await db.fishing_records.update(id, changes);
  },
  
  async getRecent(limit: number = 10): Promise<FishingRecord[]> {
    return await db.fishing_records
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray();
  },
};
```

---

### 6. 同期システムの実装

#### **同期マネージャー**
```typescript
// services/sync/SyncManager.ts
export class SyncManager {
  private isRunning = false;
  
  async startSync() {
    if (this.isRunning || !navigator.onLine) return;
    
    this.isRunning = true;
    
    try {
      // 1. ローカルの未同期データを取得
      const pendingItems = await this.getPendingItems();
      
      // 2. 優先度順にソート
      const sorted = this.sortByPriority(pendingItems);
      
      // 3. 順次送信
      for (const item of sorted) {
        await this.syncItem(item);
      }
      
      // 4. クラウドから最新データを取得
      await this.fetchLatestData();
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }
  
  private async getPendingItems() {
    return await db.sync_queue
      .where('status')
      .equals('pending')
      .toArray();
  }
  
  private sortByPriority(items: SyncQueueItem[]) {
    return items.sort((a, b) => a.priority - b.priority);
  }
  
  private async syncItem(item: SyncQueueItem) {
    try {
      // APIに送信
      await syncAPI.upload(item.type, item.payload);
      
      // キューから削除
      await db.sync_queue.delete(item.id!);
      
      // 同期ステータス更新
      await this.updateSyncStatus(item);
      
    } catch (error) {
      // リトライカウント増加
      await this.incrementRetryCount(item.id!);
    }
  }
}
```

---

### 7. API通信の設計

#### **APIクライアント**
```typescript
// services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー処理
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **API関数**
```typescript
// services/api/fishingAPI.ts
import { apiClient } from './client';
import type { FishingRecord, RecordFilters } from '@/types';

export const fishingAPI = {
  async getRecords(filters?: RecordFilters): Promise<FishingRecord[]> {
    const { data } = await apiClient.get('/v1/fishing/records', {
      params: filters,
    });
    return data;
  },
  
  async createRecord(record: Omit<FishingRecord, 'id'>): Promise<FishingRecord> {
    const { data } = await apiClient.post('/v1/fishing/records', record);
    return data;
  },
  
  async updateRecord(id: string, updates: Partial<FishingRecord>): Promise<FishingRecord> {
    const { data } = await apiClient.patch(`/v1/fishing/records/${id}`, updates);
    return data;
  },
};
```

---

### 8. バックエンド設計

#### **FastAPI エンドポイント**
```python
# backend/app/api/v1/fishing.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.fishing import FishingRecordCreate, FishingRecordResponse
from app.services.fishing_service import FishingService

router = APIRouter()

@router.post("/records", response_model=FishingRecordResponse)
async def create_record(
    record: FishingRecordCreate,
    service: FishingService = Depends()
):
    """新しい漁業記録を作成"""
    try:
        return await service.create_record(record)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/records", response_model=List[FishingRecordResponse])
async def get_records(
    user_id: str,
    date_from: str = None,
    date_to: str = None,
    service: FishingService = Depends()
):
    """漁業記録一覧を取得"""
    return await service.get_records(
        user_id=user_id,
        date_from=date_from,
        date_to=date_to
    )
```

#### **サービス層**
```python
# backend/app/services/fishing_service.py
from app.db.repositories.fishing_repo import FishingRepository
from app.schemas.fishing import FishingRecordCreate

class FishingService:
    def __init__(self, repo: FishingRepository):
        self.repo = repo
    
    async def create_record(self, record: FishingRecordCreate):
        # ビジネスロジック
        validated_record = self._validate_record(record)
        
        # データベースに保存
        saved = await self.repo.create(validated_record)
        
        # 必要なら通知など
        await self._notify_creation(saved)
        
        return saved
    
    def _validate_record(self, record):
        # バリデーション処理
        if not record.departure.crew:
            raise ValueError("乗組員が必要です")
        return record
```

---

## 開発フロー

### 1. 新機能開発の手順

```bash
# 1. ブランチ作成
git checkout -b feature/deployment-form

# 2. 型定義作成
# types/deployment.types.ts を作成

# 3. API定義
# services/api/deploymentAPI.ts を作成

# 4. DB操作
# services/db/deployments.ts を作成

# 5. フック作成
# hooks/useDeploymentForm.ts を作成

# 6. UIコンポーネント作成
# components/features/deployment/ 配下に作成

# 7. ページ統合
# pages/DeploymentPage.tsx を作成

# 8. テスト
npm run test

# 9. コミット
git add .
git commit -m "feat: 縄設置記録フォームを実装"

# 10. プッシュ
git push origin feature/deployment-form
```

### 2. コンポーネント作成テンプレート

```typescript
// components/common/NewComponent/NewComponent.tsx
import React from 'react';
import type { NewComponentProps } from './NewComponent.types';

export const NewComponent: React.FC<NewComponentProps> = ({
  prop1,
  prop2,
  ...props
}) => {
  // ロジック
  
  return (
    <div {...props}>
      {/* JSX */}
    </div>
  );
};

// components/common/NewComponent/NewComponent.types.ts
export interface NewComponentProps {
  prop1: string;
  prop2?: number;
  className?: string;
}

// components/common/NewComponent/index.ts
export { NewComponent } from './NewComponent';
export type { NewComponentProps } from './NewComponent.types';
```

---

## パフォーマンス最適化

### 1. コード分割

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const DeparturePage = lazy(() => import('./pages/DeparturePage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/departure" element={<DeparturePage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. メモ化

```typescript
// 重い計算のメモ化
const expensiveValue = useMemo(() => {
  return calculateComplexData(data);
}, [data]);

// コールバックのメモ化
const handleSubmit = useCallback((formData) => {
  saveFishingRecord(formData);
}, [saveFishingRecord]);

// コンポーネントのメモ化
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 複雑な描画 */}</div>;
});
```

### 3. 仮想化リスト

```typescript
// 長いリストの仮想化
import { useVirtualizer } from '@tanstack/react-virtual';

const RecordList = ({ records }) => {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <RecordCard key={item.key} record={records[item.index]} />
        ))}
      </div>
    </div>
  );
};
```

---

## テスト戦略

### 1. ユニットテスト

```typescript
// components/common/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### 2. インテグレーションテスト

```typescript
// pages/DeparturePage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeparturePage } from './DeparturePage';

describe('DeparturePage', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<DeparturePage />);
    
    // フォーム入力
    await user.type(screen.getByLabelText('出港時刻'), '05:00');
    await user.click(screen.getByLabelText('悠'));
    
    // 送信
    await user.click(screen.getByText('出港完了'));
    
    // 成功メッセージ確認
    await waitFor(() => {
      expect(screen.getByText('記録を保存しました')).toBeInTheDocument();
    });
  });
});
```

---

## デプロイ設定

### 1. Cloudflare Pages 設定

```toml
# wrangler.toml
name = "fishing-pwa"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
cwd = "frontend"
watch_dir = "frontend/src"

[build.upload]
format = "service-worker"

[[build.upload.rules]]
type = "CompiledWasm"
globs = ["**/*.wasm"]
fallthrough = true
```

### 2. CI/CD パイプライン

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: fishing-pwa
          directory: frontend/dist
```

---

## エラーハンドリング

### 1. エラーバウンダリ

```typescript
// components/common/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    // エラーログ送信
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>エラーが発生しました</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            再読み込み
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 2. API エラーハンドリング

```typescript
// utils/errorHandler.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    // サーバーレスポンスあり
    return new APIError(
      error.response.status,
      error.response.data.message || 'サーバーエラー',
      error.response.data
    );
  } else if (error.request) {
    // リクエストは送信されたがレスポンスなし
    return new APIError(
      0,
      'ネットワークエラー。接続を確認してください。'
    );
  } else {
    // その他のエラー
    return new APIError(
      0,
      error.message || '予期しないエラーが発生しました'
    );
  }
};
```

---

## セキュリティ考慮事項

### 1. XSS対策

```typescript
// Reactは自動エスケープするが、dangerouslySetInnerHTMLは避ける
// ❌ 危険
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 安全
<div>{userInput}</div>
```

### 2. CSRF対策

```typescript
// APIクライアントにCSRFトークンを含める
apiClient.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### 3. 認証トークン管理

```typescript
// トークンをHttpOnlyクッキーで管理（推奨）
// または、localStorageに保存する場合はXSS対策を徹底

export const authService = {
  setToken(token: string) {
    // HttpOnlyクッキーはサーバー側で設定
    // localStorageの場合
    localStorage.setItem('auth_token', token);
  },
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
  
  clearToken() {
    localStorage.removeItem('auth_token');
  },
};
```

---

## まとめ

このスキルガイドに従うことで：

1. **保守性の高いコード**: コンポーネント分割、単一責任の原則
2. **スケーラビリティ**: 機能ごとのフォルダ分割、明確な依存関係
3. **型安全性**: TypeScriptによる厳密な型チェック
4. **テスタビリティ**: ユニット・インテグレーションテストの実装
5. **パフォーマンス**: コード分割、メモ化、仮想化
6. **オフライン対応**: IndexDB、Service Worker、同期システム

を実現したスマート漁業PWAを開発できます。