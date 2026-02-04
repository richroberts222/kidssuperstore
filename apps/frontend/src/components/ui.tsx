import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

export function Button(
  props: PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: 'primary' | 'ghost' | 'danger';
      size?: 'sm' | 'md';
    }
  >,
) {
  const { className, variant = 'primary', size = 'md', ...rest } = props;
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        size === 'sm' ? 'btn-sm' : 'btn-md',
        className,
      )}
      {...rest}
    />
  );
}

export function Card(props: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('card', props.className)}>{props.children}</div>;
}

export function Field(props: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="field">
      <div className="field-label">
        <span>{props.label}</span>
        {props.hint ? <span className="field-hint">{props.hint}</span> : null}
      </div>
      {props.children}
    </label>
  );
}
