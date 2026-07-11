import {
  getSeedAccountRoleLabel,
  SEED_ACCOUNTS,
  type SeedAccount,
} from '@/pages/auth/seedAccounts'
import styles from './AuthPage.module.css'

type SeedAccountsHintProps = {
  onSelect?: (account: SeedAccount) => void
}

export function SeedAccountsHint({ onSelect }: SeedAccountsHintProps) {
  return (
    <aside className={styles.seedAccounts} aria-label="Тестовые учётные записи">
      <p className={styles.seedTitle}>Тестовые учётки (временно)</p>
      <ul className={styles.seedList}>
        {SEED_ACCOUNTS.map((account) => (
          <li key={account.email}>
            {onSelect ? (
              <button
                type="button"
                className={styles.seedItemButton}
                onClick={() => onSelect(account)}
              >
                <SeedAccountRow account={account} />
              </button>
            ) : (
              <div className={styles.seedItem}>
                <SeedAccountRow account={account} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}

function SeedAccountRow({ account }: { account: SeedAccount }) {
  return (
    <>
      <span className={styles.seedRole}>{getSeedAccountRoleLabel(account.role)}</span>
      <span className={styles.seedEmail}>{account.email}</span>
      <span className={styles.seedPassword}>{account.password}</span>
    </>
  )
}
