import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { RecommendUsersDto } from './dto/recommend-users.dto';
import axios from 'axios';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id/profile')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (file.fieldname === 'profileImage') {
            cb(null, './uploads/profile-images');
          } else if (file.fieldname === 'cv') {
            cb(null, './uploads/cv');
          } else {
            cb(null, './uploads/other');
          }
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}_${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async updateProfile(
    @Param('id') id: string,
    @UploadedFiles() files: Array<any>,
    @Body() body: any,
  ) {
    console.log('PATCH /users/:id/profile body:', body);
    console.log('PATCH /users/:id/profile files:', files);
    const updateData: any = {
      name: body.name,
      email: body.email,
      description: body.description,
      gender: body.gender,
      profession: body.profession, // <-- Asegúrate de incluir profession aquí
      nationality: body.nationality,
      languages: body.languages ? (Array.isArray(body.languages) ? body.languages : JSON.parse(body.languages)) : undefined,
    };
    if (files && files.length) {
      for (const file of files) {
        if (file.fieldname === 'profileImage') {
          updateData.profileImage = `/uploads/profile-images/${file.filename}`;
        }
        if (file.fieldname === 'cv') {
          updateData.cvUrl = `/uploads/cv/${file.filename}`;
        }
      }
    }
    console.log('PATCH /users/:id/profile updateData:', updateData);
    return this.usersService.update(+id, updateData);
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: ChangePasswordDto
  ) {
    return this.usersService.changePassword(+id, body);
  }

  @Post('recommend')
  async recommendUsers(@Body() body: RecommendUsersDto) {
    // Llama a OpenAI para recomendar usuarios
    const prompt = `Dado el área de interés "${body.interest}", selecciona los IDs de usuario más adecuados de la siguiente lista de usuarios (en formato JSON). Devuelve solo un array de IDs, nada más.\nUsuarios: ${JSON.stringify(body.users)}\nIDs recomendados:`;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY no configurada');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en selección de talento.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 50,
        temperature: 0.2,
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // Extrae el array de IDs del resultado
    const text = response.data.choices[0].message.content;
    let ids: number[] = [];
    try {
      ids = JSON.parse(text);
    } catch {
      // fallback: intenta extraer números
      ids = (text.match(/\d+/g) || []).map(Number);
    }
    return { recommendedUserIds: ids };
  }

  @Get('unique-fields')
  async getUniqueFields() {
    return this.usersService.getUniqueFields();
  }
}