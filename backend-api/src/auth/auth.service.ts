import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { AdminUser } from "../database/entities";
import { RequestUser } from "../common/request-user";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>) {}

  async login(email: string, password: string) {
    const user = await this.admins.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Identifiants invalides");
    }
    const payload: RequestUser = { id: user.id, email: user.email, role: user.role };
    const options: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
    };
    const token = jwt.sign(payload, this.jwtSecret(), options);
    return { accessToken: token, user: payload };
  }

  verifyToken(token: string): RequestUser {
    return jwt.verify(token, this.jwtSecret()) as RequestUser;
  }

  private jwtSecret() {
    return process.env.JWT_SECRET || "change-me-before-production";
  }
}
