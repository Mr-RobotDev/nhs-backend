import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from './schema/log.schema';
import { CreateLogDto } from './dto/create-log.dto';
import { GetLogsQueryDto } from './dto/get-logs.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private readonly logModel: PaginatedModel<Log>,
  ) {}

  createLog(user: string, createLogDto: CreateLogDto) {
    return this.logModel.create({ user, ...createLogDto });
  }

  getLogs(query: GetLogsQueryDto) {
    const { user, device, from, to, page, limit } = query;

    return this.logModel.paginate(
      {
        ...(user && { user }),
        ...(device && { device }),
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
      {
        page,
        limit,
        populate: [
          {
            path: 'dashboard',
            select: 'name',
          },
          {
            path: 'device',
            select: 'name',
          },
          {
            path: 'user',
            select: 'firstName lastName profile',
          },
        ],
      },
    );
  }
}
