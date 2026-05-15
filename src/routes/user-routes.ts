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
  .group("", (app) =>
    app
      .derive(({ headers }) => {
        const auth = headers.authorization;
        return {
          token: auth?.startsWith("Bearer ") ? auth.substring(7) : null,
        };
      })
      .post("/current", async ({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          const user = await getCurrentUser(token);
          return { data: user };
        } catch (error: any) {
          if (error.message === "Unauthorized") {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          set.status = 500;
          return { error: "Internal Server Error" };
        }
      })
      .delete("/logout", async ({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        try {
          const message = await logoutUser(token);
          return { data: message };
        } catch (error: any) {
          if (error.message === "Unauthorized") {
            set.status = 401;
            return { error: "Unauthorized" };
          }

          set.status = 500;
          return { error: "Internal Server Error" };
        }
      })
  );
