import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-repsonse';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel( User.name ) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async create(CreateUserDto: CreateUserDto):Promise<User> {

    try{

      const { password, ...userData } = CreateUserDto;
      
      const newUser = new this.userModel({
        password: bcrypt.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save();

      const { password:_,...user} = newUser.toObject();

      return user;

    }catch(error){
      
      if(error.code === 11000){
        throw new BadRequestException(`${ CreateUserDto.email } already exists`);
      }

      throw new InternalServerErrorException('Something terrible happened!')

    }

  }

  async register( registerDto:RegisterDto ):Promise<LoginResponse> {
    const user = await this.create(registerDto);

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    };
  }

  async login(loginDto: LoginDto):Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if(!user){
      throw new UnauthorizedException('Invalid credentials');
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: await this.getJwtToken({ id: user.id })
    };
  }

  getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findUserById(id: string){
    const user =  await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findAll():Promise<User[]> {
    return this.userModel.find();
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
