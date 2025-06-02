import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        description: true,
        profileImage: true,
        cvUrl: true,
        gender: true,
        profession: true,
        nationality: true,
        age: true,
        languages: true,
        projectsCount: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        description: true,
        profileImage: true,
        cvUrl: true,
        gender: true,
        profession: true,
        nationality: true,
        age: true,
        languages: true,
        projectsCount: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        description: true,
        profileImage: true,
        cvUrl: true,
        gender: true,
        profession: true,
        nationality: true,
        age: true,
        languages: true,
        projectsCount: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        description: true,
        profileImage: true,
        cvUrl: true,
        gender: true,
        profession: true,
        nationality: true,
        age: true,
        languages: true,
        projectsCount: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        description: true,
        profileImage: true,
        cvUrl: true,
        gender: true,
        profession: true,
        nationality: true,
        age: true,
        languages: true,
        projectsCount: true,
      },
    });
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('Usuario no encontrado');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new Error('La contraseña actual es incorrecta');
    if (dto.newPassword !== dto.confirmPassword) throw new Error('Las contraseñas nuevas no coinciden');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    return { message: 'Contraseña cambiada con éxito.' };
  }

  async getUniqueFields() {
    const users = await this.prisma.user.findMany({
      select: {
        profession: true,
        nationality: true,
        gender: true,
        languages: true,
      },
    });
    const professions = Array.from(new Set(users.map(u => u.profession).filter(Boolean)));
    const nationalities = Array.from(new Set(users.map(u => u.nationality).filter(Boolean)));
    const genders = Array.from(new Set(users.map(u => u.gender).filter(Boolean)));
    const languages = Array.from(new Set(users.flatMap(u => (u.languages || [])).filter(Boolean)));
    return { professions, nationalities, genders, languages };
  }
}