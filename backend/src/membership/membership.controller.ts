import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('membership')
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get('info')
  async getUserMembership(@Request() req) {
    return this.membershipService.getUserMembership(req.user.userId);
  }

  @Get('usage')
  async getEvaluationUsage(@Request() req) {
    return this.membershipService.getEvaluationUsage(req.user.userId);
  }

  @Get('plans')
  async getAvailablePlans() {
    return [
      this.membershipService.getMembershipInfo('FREE'),
      this.membershipService.getMembershipInfo('PRO'),
      this.membershipService.getMembershipInfo('ENTERPRISE')
    ];
  }

  @Post('upgrade')
  async upgradeMembership(
    @Request() req,
    @Body() body: { membershipType: 'PRO' | 'ENTERPRISE' }
  ) {
    await this.membershipService.upgradeMembership(req.user.userId, body.membershipType);
    return { message: 'Membresía actualizada exitosamente' };
  }

  @Post('downgrade')
  async downgradeMembership(@Request() req) {
    await this.membershipService.downgradeMembership(req.user.userId);
    return { message: 'Membresía degradada a FREE exitosamente' };
  }

  @Get('can-evaluate/:projectId/:technology')
  async canCreateEvaluation(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('technology') technology: string
  ) {
    return this.membershipService.canCreateEvaluation(
      req.user.userId,
      parseInt(projectId),
      technology
    );
  }
}
