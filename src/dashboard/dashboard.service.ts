import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Dashboard } from './schema/dashboard.schema';
import { LogService } from '../log/log.service';
import { CardService } from '../card/card.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { Action } from '../log/enums/action.enum';
import { Page } from '../log/enums/page.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name)
    private readonly dashboardModel: Model<Dashboard>,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
    private readonly logService: LogService,
  ) {}

  async createDashboard(user: string, createDashboardDto: CreateDashboardDto) {
    const dashboard = await this.dashboardModel.create(createDashboardDto);
    await this.logService.createLog(user, {
      action: Action.CREATED,
      page: Page.DASHBOARD,
      dashboard: dashboard.id,
    });
    return dashboard;
  }

  async getDashboards(user: string) {
    const dashboards = await this.dashboardModel.find({}, '-createdAt');
    await this.logService.createLog(user, {
      action: Action.VIEWED,
      page: Page.DASHBOARD,
    });
    return dashboards;
  }

  async getDashboard(user: string, id: string) {
    const dashboard = await this.dashboardModel.findById(id, '-createdAt');
    if (!dashboard) {
      throw new NotFoundException(`Dashboard #${id} not found`);
    }
    await this.logService.createLog(user, {
      action: Action.VIEWED,
      page: Page.DASHBOARD,
      dashboard: dashboard.id,
    });
    return dashboard;
  }

  async updateDashboard(
    id: string,
    update: UpdateQuery<Dashboard>,
    user?: string,
  ) {
    const dashboard = await this.dashboardModel.findByIdAndUpdate(id, update, {
      new: true,
      projection: '-createdAt',
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard #${id} not found`);
    }
    if (user) {
      await this.logService.createLog(user, {
        action: Action.UPDATED,
        page: Page.DASHBOARD,
        dashboard: dashboard.id,
      });
    }
    return dashboard;
  }

  async removeDashboard(user: string, id: string) {
    const dashboard = await this.dashboardModel.findByIdAndDelete(id, {
      projection: '-createdAt',
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard #${id} not found`);
    }
    await this.cardService.removeCardsByDashboard(id);
    await this.logService.createLog(user, {
      action: Action.DELETED,
      page: Page.DASHBOARD,
      dashboard: dashboard.id,
    });
    return dashboard;
  }
}
