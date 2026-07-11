import styles from './EventWinsTable.module.css'
import type { EventWinner } from '@/features/events/types/event.types'
import { formatWinnerLabel } from '@/features/events/utils/eventWinners'

type EventWinsTableProps = {
  winners: EventWinner[]
}

export function EventWinsTable({ winners }: EventWinsTableProps) {
  if (winners.length === 0) {
    return (
      <div className={styles.empty}>Победители ещё не назначены.</div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Победы</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Игрок</th>
            <th scope="col">Побед</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr key={winner.type === 'user' ? winner.userId : winner.guestId}>
              <td>{formatWinnerLabel(winner)}</td>
              <td>{winner.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
