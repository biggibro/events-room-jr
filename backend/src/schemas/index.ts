import { z } from 'zod'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const EVENT_TIME_REGEX = /^\d{2}:\d{2}$/

export const imageUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/uploads\/(avatars|events)\/.+\.(png|jpe?g)$/i),
])

function isValidIsoDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

function isValidEventTime(value: string): boolean {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return false

  const hours = Number(match[1])
  const minutes = Number(match[2])

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export const eventDateSchema = z
  .string()
  .regex(ISO_DATE_REGEX, 'Формат: YYYY-MM-DD')
  .refine(isValidIsoDate, 'Некорректная дата')

export const eventTimeSchema = z
  .string()
  .regex(EVENT_TIME_REGEX, 'Формат: HH:mm')
  .refine(isValidEventTime, 'Некорректное время')

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const locationCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(1),
  phone: z.string().min(1).optional(),
  mapUrl: z.string().url().optional(),
})

export const locationUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    mapUrl: z.string().url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Нужно передать хотя бы одно поле',
  })

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventDate: eventDateSchema,
  eventTime: eventTimeSchema,
  locationId: z.string().uuid(),
  maxParticipants: z.number().int().positive(),
  seatingType: z.enum(['random', 'free']).optional(),
  durationHours: z.number().int().positive().optional(),
  imageUrl: imageUrlSchema.optional(),
})

export const eventUpdateSchema = eventCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Нужно передать хотя бы одно поле',
  })

export const eventStatusSchema = z.object({
  status: z.enum(['registration_open', 'registration_closed', 'completed']),
})

export const joinSchema = z.object({
  guestNames: z.array(z.string()).default([]),
})

export const removeParticipantsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
})

const winnerEntrySchema = z
  .object({
    userId: z.string().uuid().optional(),
    guestId: z.string().uuid().optional(),
    count: z.number().int().positive(),
  })
  .refine((data) => Boolean(data.userId) !== Boolean(data.guestId), {
    message: 'Укажите userId или guestId, но не оба',
  })

export const winnersSchema = z.object({
  winners: z.array(winnerEntrySchema),
})

export const assignRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
})

export const adminUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ALL', 'user', 'admin', 'superadmin']).optional(),
  blocked: z.enum(['ALL', 'blocked']).optional(),
})

export const eventsQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['ALL', 'registration_open', 'registration_closed', 'completed', 'archived'])
    .optional(),
  sort: z.enum(['newest', 'date']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

export const profileUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    tagline: z.string().max(80).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: imageUrlSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Нужно передать хотя бы одно поле',
  })

export const credentialsUpdateSchema = z
  .object({
    email: z.string().email().optional(),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).optional(),
  })
  .refine((data) => data.email !== undefined || data.newPassword !== undefined, {
    message: 'Нужно изменить email или пароль',
  })

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Сообщение не может быть пустым').max(2000),
})

export const joinEventSocketSchema = z.object({
  eventId: z.string().uuid(),
})

export const sendMessageSocketSchema = z.object({
  eventId: z.string().uuid(),
  message: chatMessageSchema.shape.message,
})
