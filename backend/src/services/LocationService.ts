import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'

type LocationWriteData = {
  name: string
  address: string
  description: string
  phone?: string
  mapUrl?: string
}

type LocationUpdateData = Partial<LocationWriteData>

export class LocationService {
  static async list(includeArchived = false) {
    return prisma.location.findMany({
      where: includeArchived ? undefined : { isArchived: false },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getById(id: string) {
    const location = await prisma.location.findUnique({ where: { id } })
    if (!location) {
      throw new AppError(404, 'Локация не найдена')
    }
    return location
  }

  static async create(adminId: string, data: LocationWriteData) {
    return prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        phone: data.phone ?? null,
        mapUrl: data.mapUrl ?? null,
        createdByAdminId: adminId,
      },
    })
  }

  static async update(id: string, data: LocationUpdateData) {
    await LocationService.getById(id)
    return prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        phone: data.phone,
        mapUrl: data.mapUrl,
      },
    })
  }

  static async archive(id: string) {
    await LocationService.getById(id)
    return prisma.location.update({
      where: { id },
      data: { isArchived: true },
    })
  }
}
