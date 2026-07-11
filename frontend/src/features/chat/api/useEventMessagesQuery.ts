import { useQuery } from '@tanstack/react-query'
import * as chatApi from '@/features/chat/api/chat.api'

export function useEventMessagesQuery(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: () => chatApi.getEventMessages(eventId),
    enabled: Boolean(eventId) && enabled,
  })
}
