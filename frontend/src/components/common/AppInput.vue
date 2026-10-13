<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :class="[
          'w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 rounded-xl transition-all',
          'border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
            : 'border-neutral-200 hover:border-neutral-300',
        ]"
        @input="$emit('input', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-red-600 font-medium" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

let idCounter = 0;

export default Vue.extend({
  name: 'AppInput',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    min: {
      type: String,
      default: undefined,
    },
    max: {
      type: String,
      default: undefined,
    },
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      autoId: `app-input-${++idCounter}`,
    };
  },
  computed: {
    inputId(): string {
      return this.id || this.autoId;
    },
  },
});
</script>
