import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/Input/Input'
import styles from './AdminToolbar.module.css'

export type AdminToolbarFilterOption<T extends string> = {
  value: T
  label: string
}

type AdminToolbarProps<T extends string, S extends string = string> = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchAriaLabel: string
  filterOptions?: AdminToolbarFilterOption<T>[]
  filterValue?: T
  onFilterChange?: (value: T) => void
  filterAriaLabel?: string
  secondaryFilterOptions?: AdminToolbarFilterOption<S>[]
  secondaryFilterValue?: S
  onSecondaryFilterChange?: (value: S) => void
  secondaryFilterAriaLabel?: string
  action?: ReactNode
}

export function AdminToolbar<T extends string, S extends string = string>({
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filterOptions,
  filterValue,
  onFilterChange,
  filterAriaLabel,
  secondaryFilterOptions,
  secondaryFilterValue,
  onSecondaryFilterChange,
  secondaryFilterAriaLabel,
  action,
}: AdminToolbarProps<T, S>) {
  const searchField = (
    <Input
      placeholder={searchPlaceholder}
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      leftIcon={<Search size={18} aria-hidden />}
      aria-label={searchAriaLabel}
    />
  )

  return (
    <div className={styles.toolbar}>
      {action ? (
        <div className={styles.searchRow}>
          <div className={styles.search}>{searchField}</div>
          <div className={styles.action}>{action}</div>
        </div>
      ) : (
        <div className={styles.search}>{searchField}</div>
      )}
      {filterOptions && filterValue !== undefined && onFilterChange ? (
        <div className={styles.filters}>
          <div className={styles.segment} role="group" aria-label={filterAriaLabel}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.segmentBtn} ${filterValue === option.value ? styles.segmentBtnActive : ''}`}
                onClick={() => onFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {secondaryFilterOptions &&
          secondaryFilterValue !== undefined &&
          onSecondaryFilterChange ? (
            <div
              className={styles.segment}
              role="group"
              aria-label={secondaryFilterAriaLabel}
            >
              {secondaryFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.segmentBtn} ${secondaryFilterValue === option.value ? styles.segmentBtnActive : ''}`}
                  onClick={() => onSecondaryFilterChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
