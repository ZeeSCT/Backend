import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TaskAssignmentBoardService } from './task.service';

@ApiTags('Task Assignment Board')
@Controller('api/v1/projects/task-assignment')
export class TaskAssignmentBoardController {
  constructor(private readonly service: TaskAssignmentBoardService) {}

  @Get('projects')
  @ApiQuery({ name: 'category', required: false })
  getProjects(@Query('category') category = 'all') {    
    return this.service.getProjects(category);
  }

  @Get('summary')
  @ApiQuery({ name: 'projectId', required: true })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'search', required: false })
  getSummary(
    @Query('projectId') projectId: string,
    @Query('filter') filter = 'all',
    @Query('search') search = '',
  ) {
    return this.service.getSummary(projectId, filter, search);
  }

  @Get('tasks')
  @ApiQuery({ name: 'projectId', required: true })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'search', required: false })
  getTasks(
    @Query('projectId') projectId: string,
    @Query('filter') filter = 'all',
    @Query('search') search = '',
  ) {
    return this.service.getTasks(projectId, filter, search);
  }
}