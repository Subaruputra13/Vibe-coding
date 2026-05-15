import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./routes/user-routes";

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Vibe-coding API Documentation",
          version: "1.0.0",
          description: "API documentation for the Vibe-coding backend application",
        },
      },
    })
  )
  .get("/", () => "Hello Elysia")
  .use(userRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
