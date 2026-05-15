import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        return result;
      } catch (error: any) {
        set.status = 400;
        return {
          status: "error",
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);
        return { data: token };
      } catch (error: any) {
        set.status = 401;
        return {
          status: "error",
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post("/current", async ({ headers, set }) => {
    try {
      const auth = headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
      }

      const token = auth.substring(7);
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }
  })
  .delete("/logout", async ({ headers, set }) => {
    try {
      const auth = headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
      }

      const token = auth.substring(7);
      const message = await logoutUser(token);
      return { data: message };
    } catch (error: any) {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }
  });
