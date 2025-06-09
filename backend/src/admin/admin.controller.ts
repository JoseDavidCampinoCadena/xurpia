import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Delete('users/all')
  async deleteAllUsers() {
    return this.adminService.deleteAllUsers();
  }

  @Post('reset-database')
  async resetDatabase() {
    return this.adminService.resetDatabase();
  }
}
