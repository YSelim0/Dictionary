import cookies from "js-cookie";

export default function authGuard(router) {
  return router.beforeEach((to, from, next) => {
    if (!to.meta.authGuard) {
      return next();
    }

    const userId = cookies.get("user-id");

    if (!userId) {
      if (to.name == "login" || to.name == "register") {
        return next();
      }

      return next({ name: "login" });
    }

    if (userId) {
      if (to.name == "login" || to.name == "register") {
        return next({ name: "home" });
      }

      return next();
    }
  });
}
