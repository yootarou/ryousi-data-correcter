import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { SelectInput } from '@/components/common/SelectInput';
import { MultiSelect } from '@/components/common/MultiSelect';
import { CompassSelect } from '@/components/common/CompassSelect';
import { CatchCounter } from '@/components/common/CatchCounter';
import { FormSection } from '@/components/common/FormSection';
import type { Direction } from '@/types';
import type { CatchItem } from '@/components/common/CatchCounter';

const ComponentsPage = () => {
  const [text, setText] = useState('');
  const [select, setSelect] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction | ''>('');
  const [catches, setCatches] = useState<CatchItem[]>([]);

  return (
    <div className="p-4 space-y-6 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1>コンポーネント一覧</h1>

      {/* Buttons */}
      <FormSection title="Button" collapsible={false}>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </FormSection>

      {/* TextInput */}
      <FormSection title="TextInput" collapsible={false}>
        <TextInput
          label="出港時刻"
          type="time"
          value={text}
          onChange={setText}
          required
        />
        <TextInput
          label="水温"
          type="number"
          value=""
          onChange={() => {}}
          suffix="℃"
          hint="海面の水温を入力"
        />
        <TextInput
          label="エラー例"
          value=""
          onChange={() => {}}
          error="入力が必要です"
          required
        />
      </FormSection>

      {/* SelectInput */}
      <FormSection title="SelectInput" collapsible={false}>
        <SelectInput
          label="天候"
          value={select}
          onChange={setSelect}
          options={[
            { value: 'sunny', label: '晴れ' },
            { value: 'cloudy', label: '曇り' },
            { value: 'rainy', label: '雨' },
            { value: 'stormy', label: '荒天' },
          ]}
          required
        />
      </FormSection>

      {/* MultiSelect */}
      <FormSection title="MultiSelect" collapsible={false}>
        <MultiSelect
          label="対象魚種"
          value={multi}
          onChange={setMulti}
          options={[
            { value: 'maguro', label: 'マグロ' },
            { value: 'katsuo', label: 'カツオ' },
            { value: 'buri', label: 'ブリ' },
            { value: 'tai', label: 'タイ' },
            { value: 'hirame', label: 'ヒラメ' },
            { value: 'ika', label: 'イカ' },
          ]}
          required
        />
      </FormSection>

      {/* CompassSelect */}
      <FormSection title="CompassSelect（8方位）" collapsible={false}>
        <CompassSelect
          label="潮流の方向"
          value={direction}
          onChange={setDirection}
        />
        {direction && (
          <p className="text-sm text-gray-500 text-center">
            選択: {direction}
          </p>
        )}
      </FormSection>

      {/* CatchCounter */}
      <FormSection title="CatchCounter（動的リスト）" collapsible={false}>
        <CatchCounter
          label="漁獲記録"
          items={catches}
          onChange={setCatches}
          speciesOptions={['マグロ', 'カツオ', 'ブリ', 'タイ', 'ヒラメ', 'イカ']}
        />
      </FormSection>

      {/* FormSection collapsible */}
      <FormSection title="折りたたみセクション（デフォルト閉じ）" defaultOpen={false}>
        <p className="text-sm text-gray-600">
          このセクションはデフォルトで閉じています。タップで開閉できます。
        </p>
        <TextInput label="メモ" value="" onChange={() => {}} />
      </FormSection>
    </div>
  );
};

export default ComponentsPage;
