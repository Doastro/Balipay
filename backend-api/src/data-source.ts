import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities } from "./database/entities";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgres://balipay:balipay_dev_password@localhost:5432/balipay",
  entities,
  migrations: ["src/migrations/*.ts"],
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});
