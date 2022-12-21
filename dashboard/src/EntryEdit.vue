<script setup>
defineProps({
  name: String,
  value: String,
  creating: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:name',
  'update:value',
  'cancel',
  'delete',
  'save'
])
</script>

<template>
  <div class="list-group-item">
    <div class="row align-items-baseline">
      <div class="col-sm-3 col-md-2 col-lg-1 my-2">
        <input
          type="text"
          class="form-control"
          placeholder="Name"
          :value="name"
          @input="$emit('update:name', $event.target.value)"
        >
      </div>
      <div class="col-sm my-2">
        <input
          type="text"
          class="form-control"
          placeholder="URL"
          :value="value"
          @input="$emit('update:value', $event.target.value)"
        >
      </div>
    </div>
    <div class="my-2 d-flex justify-content-end gap-2">
      <button
        v-if="!loading"
        type="button"
        class="btn btn-sm btn-secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        v-if="!creating"
        type="button"
        class="btn btn-sm btn-danger"
        :disabled="loading"
        @click="$emit('delete')"
      >
        Delete
      </button>
      <button
        type="button"
        class="btn btn-sm btn-success"
        :disabled="loading"
        @click="$emit('save')"
      >
        Save
      </button>
    </div>
  </div>
</template>
