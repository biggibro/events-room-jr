import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { queryClient } from '@/api/query-client'
import type { ChatMessage } from '@/features/chat/types/chat.types'
import { useAuthStore } from '@/stores/authStore'

type UseEventChatSocketOptions = {
  eventId: string
  enabled: boolean
}

type SendMessageAck =
  | { ok: true; message: ChatMessage }
  | { ok: false; message: string }

export function useEventChatSocket({ eventId, enabled }: UseEventChatSocketOptions) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !eventId || !accessToken) {
      setConnected(false)
      return undefined
    }

    const socket = io({
      path: '/socket.io',
      auth: { token: accessToken },
    })

    socketRef.current = socket

    const handleConnect = () => {
      setConnected(true)
      setError(null)
      socket.emit('joinEvent', { eventId })
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    const handleNewMessage = (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(['event-messages', eventId], (current) => {
        const list = current ?? []
        if (list.some((item) => item.id === message.id)) {
          return list
        }
        return [...list, message]
      })
    }

    const handleError = (payload: { message?: string }) => {
      setError(payload.message ?? 'Ошибка чата')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('newMessage', handleNewMessage)
    socket.on('error', handleError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('newMessage', handleNewMessage)
      socket.off('error', handleError)
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [accessToken, enabled, eventId])

  const sendMessage = useCallback(
    (text: string) =>
      new Promise<void>((resolve, reject) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          reject(new Error('Нет соединения с чатом'))
          return
        }

        setSending(true)
        setError(null)

        socket.emit(
          'sendMessage',
          { eventId, message: text },
          (ack: SendMessageAck | undefined) => {
            setSending(false)
            if (ack?.ok) {
              resolve()
              return
            }
            const message =
              typeof ack?.message === 'string'
                ? ack.message
                : 'Не удалось отправить сообщение'
            setError(message)
            reject(new Error(message))
          },
        )
      }),
    [eventId],
  )

  return {
    connected,
    sending,
    error,
    sendMessage,
  }
}
