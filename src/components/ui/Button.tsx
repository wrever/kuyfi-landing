import type { ComponentPropsWithoutRef } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary'

const classes = (variant: Variant, extra?: string) =>
  [styles.button, styles[variant], extra].filter(Boolean).join(' ')

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: Variant }

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={classes(variant, className)} {...rest} />
}

type ButtonLinkProps = ComponentPropsWithoutRef<'a'> & { variant?: Variant; href: string }

export function ButtonLink({ variant = 'secondary', className, ...rest }: ButtonLinkProps) {
  return <a className={classes(variant, className)} {...rest} />
}
