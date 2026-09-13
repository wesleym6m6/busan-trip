import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface CommonProps {
  variant?: Variant;
  size?: 'normal' | 'small';
  block?: boolean;
  /** 只有 icon 時必須提供 aria-label */
  iconOnly?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

function classes(p: CommonProps): string {
  return [
    styles.button,
    styles[p.variant ?? 'secondary'],
    p.size === 'small' ? styles.small : '',
    p.block ? styles.block : '',
    p.iconOnly ? styles.icon : '',
    p.className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, iconOnly, icon, children, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={classes({ variant, size, block, iconOnly, className })} {...rest}>
      {icon}
      {children}
    </button>
  );
});

/** 外部連結按鈕：一律新分頁 + noopener。 */
export function LinkButton({
  href,
  variant,
  size,
  block,
  icon,
  children,
  className,
  ...rest
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes({ variant, size, block, className })}
      {...rest}
    >
      {icon}
      {children}
    </a>
  );
}
