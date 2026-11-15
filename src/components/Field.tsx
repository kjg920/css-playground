import { memo, useId, type ReactNode } from 'react';

/** 조절 패널에서 반복되는 입력 줄. memo로 감싸서 값이 바뀐 줄만 다시 그린다. */

export const Slider = memo(function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {props.label}
        <output>
          {props.value}
          {props.unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(e.target.valueAsNumber)}
      />
    </div>
  );
});

export const ColorField = memo(function ColorField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="field color">
      <label htmlFor={id}>{props.label}</label>
      <input id={id} type="color" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      <code>{props.value}</code>
    </div>
  );
});

export const Toggle = memo(function Toggle(props: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
});

export function Segmented<T extends string>(props: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="field">
      <span className="label">{props.label}</span>
      <div className="segmented" role="radiogroup" aria-label={props.label}>
        {(Object.keys(props.options) as T[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={props.value === k}
            className={props.value === k ? 'on' : ''}
            onClick={() => props.onChange(k)}
          >
            {props.options[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="section" open={open}>
      <summary>{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  );
}
