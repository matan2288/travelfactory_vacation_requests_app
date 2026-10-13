<template>
  <img
    v-if="src"
    :src="src"
    alt=""
    :class="['rounded-full object-cover shrink-0 ring-1 ring-neutral-200', sizeClasses]"
  />
  <span
    v-else
    :class="['rounded-full font-semibold flex items-center justify-center shrink-0', sizeClasses, colorClasses]"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
import { avatarFor } from '@/utils/avatar.utils';

// Order chosen so the seeded users match the mockup: Alex blue, Marcus orange, Sarah green.
const PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
];

export default Vue.extend({
  name: 'UserAvatar',
  props: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    photo: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string) => ['sm', 'md'].includes(val),
    },
  },
  computed: {
    src(): string | undefined {
      return this.photo ? avatarFor(this.email) : undefined;
    },
    initials(): string {
      return this.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
    },
    colorClasses(): string {
      const hash = [...this.name].reduce((acc, ch) => (acc * 7 + ch.charCodeAt(0)) >>> 0, 0);
      return PALETTE[hash % PALETTE.length];
    },
    sizeClasses(): string {
      return this.size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-xs';
    },
  },
});
</script>
