<template>
  <div v-if="currentUser" class="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-3 text-sm text-slate-600">
    <span>
      Signed in as <span class="font-semibold text-slate-900">{{ currentUser.name }}</span>
    </span>
    <UserAvatar :name="currentUser.name" :email="currentUser.email" photo size="sm" />
    <RolePill :role="currentUser.role" />
    <span class="text-xs text-slate-500">
      {{ currentUser.role === 'VALIDATOR' ? 'Can approve or reject vacation requests' : 'Can submit and track vacation requests' }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import RolePill from './RolePill.vue';
import { authService } from '@/features/auth/auth.service';

export default Vue.extend({
  name: 'SignedInAs',
  components: {
    UserAvatar,
    RolePill,
  },
  computed: {
    currentUser() {
      return authService.currentUser;
    },
  },
});
</script>
