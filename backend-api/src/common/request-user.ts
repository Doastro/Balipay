import { Request } from "express";
import { AdminRole } from "../database/entities";

export type RequestUser = {
  id: string;
  email: string;
  role: AdminRole;
};

export type AuthedRequest = Request & {
  user: RequestUser;
};
