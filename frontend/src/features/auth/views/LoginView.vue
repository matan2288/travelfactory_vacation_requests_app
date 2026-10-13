<template>
  <div class="min-h-screen bg-neutral-50/50 flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Typographic section label -->
      <div class="text-xs font-semibold tracking-wider text-slate-400 uppercase text-center mb-2">
        00 / AUTHENTICATION
      </div>
      <h1 class="text-center text-3xl font-bold tracking-tight text-slate-900">
        Vacation Management
      </h1>
      <p class="mt-2 text-center text-xs text-slate-500">
        Web Development Recruitment Test · Frontend First Monorepo
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 sm:px-10 border border-neutral-200/80 rounded-2xl shadow-sm space-y-6">
        <!-- Quick Demo Switch Buttons -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Instant Demo Sign-In
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-start p-3 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-xl transition-all text-left cursor-pointer group"
              @click="demoLogin('alex.requester@company.internal')"
            >
              <span class="text-xs font-bold text-slate-900 group-hover:text-slate-950">Alex Morgan</span>
              <span class="text-xs text-slate-500 mt-0.5">REQUESTER</span>
            </button>

            <button
              type="button"
              class="flex flex-col items-start p-3 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-xl transition-all text-left cursor-pointer group"
              @click="demoLogin('elena.validator@company.internal')"
            >
              <span class="text-xs font-bold text-slate-900 group-hover:text-slate-950">Elena Rostova</span>
              <span class="text-xs text-slate-500 mt-0.5">VALIDATOR</span>
            </button>
          </div>
        </div>

        <div class="relative flex items-center justify-center">
          <div class="border-t border-neutral-200 w-full" />
          <span class="bg-white px-3 text-xs text-slate-400 uppercase font-medium tracking-wider absolute">
            Or Sign In with Email
          </span>
        </div>

        <!-- Email form -->
        <form class="space-y-4" @submit.prevent="handleEmailLogin">
          <AppInput
            id="login-email"
            v-model="email"
            type="email"
            label="Corporate Email"
            placeholder="e.g. alex.requester@company.internal"
            required
            :error="errorMessage"
          />

          <AppButton
            type="submit"
            variant="primary"
            class="w-full"
            :loading="isLoading"
            :disabled="isLoading || !email.trim()"
          >
            Sign In to Portal
          </AppButton>
        </form>

        <!-- Mock Architecture Notice -->
        <div class="pt-2 border-t border-neutral-100 text-[11px] text-slate-400 leading-relaxed text-center">
          Notice: Mock authentication is active for local evaluation. Production token issuance and RBAC will be enforced on the future PostgreSQL / TypeORM backend.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { authService } from '../auth.service';
import { getErrorMessage } from '@/utils/error.utils';

export default Vue.extend({
  name: 'LoginView',
  components: {
    AppInput,
    AppButton,
  },
  data() {
    return {
      email: '',
      errorMessage: '',
      isLoading: false,
    };
  },
  methods: {
    async demoLogin(demoEmail: string) {
      this.email = demoEmail;
      await this.performLogin();
    },
    async handleEmailLogin() {
      await this.performLogin();
    },
    async performLogin() {
      this.errorMessage = '';
      this.isLoading = true;
      try {
        const user = await authService.login({ email: this.email });
        if (user.role === 'VALIDATOR') {
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
