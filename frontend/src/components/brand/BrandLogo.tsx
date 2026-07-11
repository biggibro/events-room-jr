import clsx from 'clsx'
import { useId } from 'react'
import type { SVGProps } from 'react'
import styles from './BrandLogo.module.css'

export type BrandLogoSize = 'sm' | 'md' | 'lg'
export type BrandLogoAnimation = 'none' | 'idle' | 'loading'

type BrandLogoProps = {
  size?: BrandLogoSize
  animated?: BrandLogoAnimation
  className?: string
  title?: string
} & Pick<SVGProps<SVGSVGElement>, 'aria-hidden'>

const TRACK_PATHS = [
  'M 447.9,268.4 A 140 140 0 0 1 531.6,352.1',
  'M 352.1,268.4 A 140 140 0 0 1 447.9,268.4',
  'M 531.6,352.1 A 140 140 0 0 1 531.6,447.9',
  'M 447.9,531.6 A 140 140 0 0 1 352.1,531.6',
  'M 268.4,447.9 A 140 140 0 0 1 268.4,352.1',
  'M 461.6,230.9 A 180 180 0 0 1 503.2,252.6',
  'M 572.1,154.3 A 300 300 0 0 1 681.9,297.4',
  'M 531.6,447.9 A 140 140 0 0 1 447.9,531.6',
  'M 644.3,488.9 A 260 260 0 0 1 549.1,613.0',
  'M 681.9,502.6 A 300 300 0 0 1 502.6,681.9',
  'M 324.8,606.7 A 220 220 0 0 1 193.3,475.2',
  'M 311.1,644.3 A 260 260 0 0 1 155.7,488.9',
  'M 297.4,681.9 A 300 300 0 0 1 118.1,502.6',
  'M 285.3,480.3 A 140 140 0 0 1 268.4,447.9',
  'M 268.4,352.1 A 140 140 0 0 1 352.1,268.4',
  'M 230.9,338.4 A 180 180 0 0 1 252.6,296.8',
  'M 193.3,324.8 A 220 220 0 0 1 273.8,219.8',
  'M 488.9,155.7 A 260 260 0 0 1 583.8,216.2 L 555.6,244.4 A 220 220 0 0 1 606.7,324.8',
  'M 475.2,606.7 A 220 220 0 0 0 555.6,555.6 L 527.3,527.3 A 180 180 0 0 0 569.1,461.6',
  'M 338.4,569.1 A 180 180 0 0 1 272.7,527.3 L 301.0,499.0 A 140 140 0 0 1 268.4,447.9',
  'M 118.1,297.4 A 300 300 0 0 1 187.9,187.9 L 216.2,216.2 A 260 260 0 0 1 311.1,155.7',
] as const

const TERMINALS = [
  { cx: 503.2, cy: 252.6 },
  { cx: 572.1, cy: 154.3 },
  { cx: 549.1, cy: 613.0 },
  { cx: 285.3, cy: 480.3 },
  { cx: 252.6, cy: 296.8 },
  { cx: 273.8, cy: 219.8 },
] as const

const SPHERES = [
  { cx: 400, cy: 180 },
  { cx: 620, cy: 400 },
  { cx: 400, cy: 620 },
  { cx: 180, cy: 400 },
] as const

function sphereHighlight(cx: number, cy: number) {
  return `M ${cx - 24} ${cy + 5} A 27 27 0 0 1 ${cx + 5} ${cy - 24}`
}

export function BrandLogo({
  size = 'md',
  animated = 'none',
  className,
  title = 'Events Room Jackaroo',
  'aria-hidden': ariaHidden,
}: BrandLogoProps) {
  const glowId = useId()
  const showFlow = animated === 'loading'
  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd

  return (
    <span
      className={clsx(
        styles.root,
        sizeClass,
        animated === 'idle' && styles.idle,
        animated === 'loading' && styles.loading,
        className,
      )}
      aria-hidden={ariaHidden}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : title}
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coreBlur" />
            <feGaussianBlur stdDeviation="5" result="midBlur" />
            <feGaussianBlur stdDeviation="12" result="wideBlur" />
            <feMerge>
              <feMergeNode in="wideBlur" />
              <feMergeNode in="midBlur" />
              <feMergeNode in="coreBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#${glowId})`}>
          <g
            className={styles.ringOuter}
            stroke="currentColor"
            fill="none"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {TRACK_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>

          {showFlow ? (
            <g
              stroke="#ffffff"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            >
              {TRACK_PATHS.map((d) => (
                <path key={`flow-${d}`} d={d} className={styles.flowPath} />
              ))}
            </g>
          ) : null}

          <g fill="currentColor" stroke="#ffffff" strokeWidth="1.5">
            {TERMINALS.map(({ cx, cy }) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" className={styles.pulseNode} />
            ))}
          </g>

          <g className={styles.ringInner}>
            {SPHERES.map(({ cx, cy }) => (
              <g key={`${cx}-${cy}`} className={styles.sphereGroup}>
                <circle cx={cx} cy={cy} r="45" fill="var(--color-surface)" />
                <circle
                  cx={cx}
                  cy={cy}
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5.5"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="44"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                <path
                  d={sphereHighlight(cx, cy)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d={sphereHighlight(cx, cy)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeOpacity="0.9"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </span>
  )
}
