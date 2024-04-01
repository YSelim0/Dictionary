import authGuard from "./auth-guard";

export default function middlewareLoader(router) {
  authGuard(router);
}
