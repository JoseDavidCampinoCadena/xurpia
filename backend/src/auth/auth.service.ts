import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log('👤 Intento de registro para el email:', dto.email);

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        console.log('❌ Error de registro: El email ya existe:', dto.email);
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
        },
      });

      const token = this.jwtService.sign({ userId: user.id });
      console.log('✅ Registro exitoso para el usuario:', user.email);
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    } catch (error) {
      console.error('❌ Error durante el registro:', error.message);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    console.log('🔐 Intento de login para el email:', dto.email);

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        console.log('❌ Error de login: Usuario no encontrado:', dto.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        console.log('❌ Error de login: Contraseña incorrecta para:', dto.email);
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({ userId: user.id });
      console.log('✅ Login exitoso para el usuario:', user.email);
      return { token, user: { id: user.id, email: user.email, name: user.name } };
    } catch (error) {
      console.error('❌ Error durante el login:', error.message);
      throw error;
    }
  }
} 