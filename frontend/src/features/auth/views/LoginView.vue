<template>
  <div class="min-h-screen bg-neutral-50/50 flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
      <AppLogo class="mb-4" />
      <h1 class="text-center text-3xl font-bold tracking-tight text-slate-900">
        Vacation Management
      </h1>
      <p class="mt-2 text-center text-sm text-slate-500">
        Request time off and track approvals in one place.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 sm:px-10 border border-neutral-200/80 rounded-2xl shadow-sm space-y-6">
        <!-- Email form -->
        <form class="space-y-4" @submit.prevent="handleEmailLogin">
          <AppInput
            id="login-email"
            v-model="email"
            type="email"
            label="Corporate Email"
            placeholder="e.g. alex.requester@company.internal"
            required
          />

          <AppInput
            id="login-password"
            v-model="password"
            type="password"
            label="Password"
            placeholder="Your password"
            required
            :error="errorMessage"
          />

          <AppButton
            type="submit"
            variant="primary"
            class="w-full"
            :loading="isLoading"
            :disabled="isLoading || !email.trim() || !password"
          >
            Sign In to Portal
          </AppButton>
        </form>

        <div class="pt-2 border-t border-neutral-100 text-[11px] text-slate-400 leading-relaxed text-center">
          <template v-if="isMockMode">
            Notice: Mock authentication is active for local evaluation. Any password is accepted.
          </template>
          <template v-else>
            Demo accounts use the password <span class="font-mono text-slate-500">{{ demoPassword }}</span>.
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppLogo from '@/components/common/AppLogo.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { authService } from '../auth.service';
import { getErrorMessage } from '@/utils/error.utils';
import { isMockMode } from '@/services/api-client';

// Matches DEMO_PASSWORD in backend/src/database/seed.ts.
const DEMO_PASSWORD = 'demo1234';

export default Vue.extend({
  name: 'LoginView',
  components: {
    AppLogo,
    AppInput,
    AppButton,
  },
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false,
      isMockMode,
      demoPassword: DEMO_PASSWORD,
    };
  },
  methods: {
    async handleEmailLogin() {
      await this.performLogin();
    },
    async performLogin() {
      this.errorMessage = '';
      this.isLoading = true;
      try {
        const user = await authService.login({ email: this.email, password: this.password });
        const redirect = this.$route.query.redirect;
        if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
          this.$router.push(redirect);
        } else if (user.role === 'VALIDATOR') {
          this.$router.push('/approvals');
        } else {
          this.$router.push('/my-requests');
        }
      } catch (err: unknown) {
        this.errorMessage = getErrorMessage(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>
