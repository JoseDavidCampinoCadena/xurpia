import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { DistributeTasksDto } from './dto/distribute-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }
  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.id);
  }
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, +id);
  }
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.id, +id, updateTaskDto);
  }  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.id, +id);
  }

  @Post('distribute')
  distributeTasksWithAI(@Request() req, @Body() distributeTasksDto: DistributeTasksDto) {    return this.tasksService.distributeTasksWithAI(
      req.user.id,
      distributeTasksDto.projectId,
      distributeTasksDto.criteria,
    );
  }
}