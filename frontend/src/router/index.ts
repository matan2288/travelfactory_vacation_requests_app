import Vue from 'vue';
import VueRouter, { type RouteConfig } from 'vue-router';
import { authGuard } from './guards';

import AppLayout from '@/components/layout/AppLayout.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import MyRequestsView from '@/features/vacation-requests/views/MyRequestsView.vue';
import ApprovalDashboardView from '@/features/approvals/views/ApprovalDashboardView.vue';
import TeamPlanningView from '@/features/team-planning/views/TeamPlanningView.vue';
import { authService } from '@/features/auth/auth.service';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: () => {
          return authService.isValidator ? '/approvals' : '/my-requests';
        },
      },
      {
        path: 'my-requests',
        name: 'MyRequests',
        component: MyRequestsView,
        meta: { requiresAuth: true },
      },
      {
        path: 'approvals',
        name: 'Approvals',
        component: ApprovalDashboardView,
        meta: { requiresAuth: true, requiredRole: 'VALIDATOR' },
      },
      {
        path: 'team-planning',
        name: 'TeamPlanning',
        component: TeamPlanningView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '*',
    redirect: '/my-requests',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.beforeEach(authGuard);

export default router;
