import { http } from '@/api/http'
import type { ChatMessage } from '@/features/chat/types/chat.types'

export async function getEventMessages(eventId: string): Promise<ChatMessage[]> {
  const { data } = await http.get<ChatMessage[]>(`/events/${eventId}/messages`)
  return data
}
