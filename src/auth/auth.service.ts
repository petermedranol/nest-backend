import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectModel( User.name ) private userModel: Model<User>) {}

  create(CreateUserDto: CreateUserDto):Promise<User> {
    
    // const newUser = new this.userModel(CreateUserDto);
    // return newUser.save();

    try{

      const newUser = new this.userModel(CreateUserDto);
      return newUser.save();
      
    }catch(error){
      
      if(error.code === 11000){
        throw new BadRequestException(`${ CreateUserDto.email } already exists`);
      }
      throw new InternalServerErrorException('Something terrible happened!')
    }

    //1. Encriptar contraseña
    //2. Guardar el usuario
    //3. Generar el JWT

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
