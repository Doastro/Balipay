import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { AuthedRequest } from "../common/request-user";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }
}

@Controller()
export class MeController {
  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: AuthedRequest) {
    return request.user;
  }
}
