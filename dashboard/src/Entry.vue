<script setup>
import moment from 'moment'

defineProps({
  item: Object,
  editable: {
    type: Boolean,
    default: true
  }
})

defineEmits([
  'edit'
])
</script>

<template>
  <div class="list-group-item list-group-item-action">
    <div class="row align-items-center">
      <div class="col">
        <div class="row align-items-baseline">
          <div
            class="col-auto col-sm-3 col-md-2 col-lg-1 mb-2 fs-4"
            v-text="item.name"
          />
          <div class="col d-sm-none mb-2">
            <div class="row justify-content-end">
              <div
                v-if="item.metadata?.created"
                class="col-auto opacity-75 small"
              >
                Created {{ moment.unix(item.metadata.created).fromNow() }}
              </div>
              <div
                v-if="item.metadata?.hits"
                class="col-auto opacity-75 small"
              >
                {{ item.metadata.hits }} hits
              </div>
            </div>
          </div>
          <div
            class="col-12 col-sm mb-2 text-break"
            v-text="item.value"
          />
        </div>
        <div class="row d-none d-sm-flex">
          <div
            v-if="item.metadata?.created"
            class="col-auto opacity-75 small"
          >
            Created {{ moment.unix(item.metadata.created).fromNow() }}
          </div>
          <div
            v-if="item.metadata?.hits"
            class="col-auto opacity-75 small"
          >
            {{ item.metadata.hits }} hits
          </div>
        </div>
      </div>
      <div
        v-if="editable"
        class="col-12 col-sm-auto d-grid gap-2 my-2 my-sm-0"
      >
        <button
          type="button"
          class="btn btn-sm btn-success"
          @click="$emit('edit')"
        >
          Edit
        </button>
      </div>
    </div>
  </div>
</template>
