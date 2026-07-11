import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { BrandLoader } from '@/components/brand/BrandLoader'
import { Card } from '@/components/ui/Card/Card'
import { Input } from '@/components/ui/Input/Input'
import { useEventMessagesQuery } from '@/features/chat/api/useEventMessagesQuery'
import { useEventChatSocket } from '@/features/chat/hooks/useEventChatSocket'
import styles from './EventChat.module.css'

type EventChatProps = {
  eventId: string
  locked?: boolean
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function EventChatLocked() {
  return (
    <Card>
      <div className={styles.root}>
        <h2 className={styles.title}>Чат события</h2>
        <p className={styles.lockedMessage}>
          Чтобы увидеть чат мероприятия нужно записаться
        </p>
      </div>
    </Card>
  )
}

function EventChatContent({ eventId }: { eventId: string }) {
  const listRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError } = useEventMessagesQuery(eventId, true)
  const { connected, sending, error, sendMessage } = useEventChatSocket({
    eventId,
    enabled: true,
  })
  const [text, setText] = useState('')

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [data?.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    try {
      await sendMessage(trimmed)
      setText('')
    } catch {
    }
  }

  return (
    <Card>
      <div className={styles.root}>
        <h2 className={styles.title}>Чат события</h2>
        {isLoading ? (
          <BrandLoader label="Загрузка сообщений…" inline />
        ) : isError ? (
          <p className={styles.text}>Не удалось загрузить чат.</p>
        ) : (
          <div ref={listRef} className={styles.list}>
            {data?.length ? (
              data.map((message) => (
                <div key={message.id} className={styles.message}>
                  <div className={styles.meta}>
                    <span className={styles.username}>{message.username}</span>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p className={styles.text}>{message.text}</p>
                </div>
              ))
            ) : (
              <p className={styles.text}>Сообщений пока нет. Напишите первым.</p>
            )}
          </div>
        )}
        {error ? <p className={styles.error}>{error}</p> : null}
        {!connected && !isLoading && !isError ? (
          <p className={styles.text}>Подключение к чату…</p>
        ) : null}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Input
              placeholder="Написать сообщение…"
              value={text}
              onChange={(event) => setText(event.target.value)}
              aria-label="Сообщение"
              disabled={!connected || isLoading || isError}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className={styles.send}
            disabled={!connected || sending || isLoading || isError || !text.trim()}
            aria-label="Отправить сообщение"
          >
            <Send size={18} aria-hidden />
          </Button>
        </form>
      </div>
    </Card>
  )
}

export function EventChat({ eventId, locked = false }: EventChatProps) {
  if (locked) {
    return <EventChatLocked />
  }

  return <EventChatContent eventId={eventId} />
}
