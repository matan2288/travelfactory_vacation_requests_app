<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 sm:px-6 border-t border-neutral-200/60 bg-white text-xs sm:text-sm text-slate-600">
    <div class="flex items-center gap-3">
      <span class="tabular-nums">
        Showing <span class="font-semibold text-slate-900">{{ startItem }}</span> to
        <span class="font-semibold text-slate-900">{{ endItem }}</span> of
        <span class="font-semibold text-slate-900">{{ total }}</span> results
      </span>

      <div class="hidden sm:flex items-center gap-1.5 ml-4">
        <label for="page-size-select" class="text-xs text-slate-500">Rows per page:</label>
        <select
          id="page-size-select"
          :value="pageSize"
          class="text-xs py-1 px-2 border border-neutral-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-slate-900"
          @change="$emit('change-page-size', Number($event.target.value))"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs text-slate-500 mr-2 tabular-nums">
        Page <span class="font-medium text-slate-900">{{ page }}</span> of {{ totalPages || 1 }}
      </span>

      <button
        type="button"
        :disabled="page <= 1"
        class="inline-flex items-center justify-center p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Previous page"
        @click="$emit('change-page', page - 1)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        :disabled="page >= totalPages"
        class="inline-flex items-center justify-center p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        aria-label="Next page"
        @click="$emit('change-page', page + 1)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AppPagination',
  props: {
    page: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  computed: {
    startItem(): number {
      if (this.total === 0) return 0;
      return (this.page - 1) * this.pageSize + 1;
    },
    endItem(): number {
      return Math.min(this.page * this.pageSize, this.total);
    },
  },
});
</script>
