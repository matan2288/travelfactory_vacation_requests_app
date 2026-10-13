import type { NavigationGuardNext, Route } from 'vue-router';
import { authService } from '@/features/auth/auth.service';

export async function authGuard(to: Route, _from: Route, next: NavigationGuardNext): Promise<void> {
  // Ensure auth state is initialized
  if (!authService.currentUser) {
    await authService.init();
  }

  const isAuthenticated = authService.isAuthenticated;
  const user = authService.currentUser;

  // Handle /login access for already logged in users
  if (to.path === '/login') {
    if (isAuthenticated) {
      if (user?.role === 'VALIDATOR') {
        next('/approvals');
      } else {
        next('/my-requests');
      }
      return;
    }
    next();
    return;
  }

  // Check routes requiring authentication
  if (to.matched.some((record) => record.meta?.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Check role authorization for Validator-only routes
    if (to.matched.some((record) => record.meta?.requiredRole === 'VALIDATOR')) {
      if (user?.role !== 'VALIDATOR') {
        // Unauthorized role: redirect to user's permitted portal
        next('/my-requests');
        return;
      }
    }
  }

  next();
}
