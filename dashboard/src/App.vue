<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import Entry from './Entry.vue'
import EntryEdit from './EntryEdit.vue'

const items = ref([])
const hasMore = ref(true)
const loading = ref(false)
const loadingEdit = ref(false)
const editing = ref('')
const editName = ref('')
const editValue = ref('')
const creating = ref(false)
const list = ref(null)
let cursor = null
let observer

const fetchMore = async () => {
  if (!hasMore.value || loading.value) {
    return
  }

  loading.value = true

  const cursorQuery = cursor ? ('?cursor=' + cursor) : ''
  const response = await fetch('/urls' + cursorQuery, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const data = await response.json()

  if (data['list_complete'] === true) {
    hasMore.value = false
    cursor = null
    observer.disconnect()
  } else {
    cursor = data['cursor']
  }

  items.value = [...items.value, ...data['keys']]

  loading.value = false
}

const observeList = () => {
  if (!list.value) return

  // Create the intersection observer
  observer = new IntersectionObserver((entries) => {
    // Check if the bottom of the list element is intersecting with the viewport
    if (entries[0].isIntersecting) {
      // Fetch more items
      fetchMore()
    }
  })

  // Observe the list element
  observer.observe(list.value)
}

const reloadList = () => {
  items.value = []
  hasMore.value = true
  cursor = null
  observeList()
}

const editEntry = (name) => {
  creating.value = false
  editing.value = name
  editName.value = name
  for (const entry of items.value) {
    if (entry['name'] === name) {
      editValue.value = entry['value']
    }
  }
}

const createEntry = () => {
  creating.value = true
  editing.value = ''
  editName.value = ''
  editValue.value = ''
}

const cancelEdit = () => {
  loadingEdit.value = false
  creating.value = false
  editing.value = ''
  editName.value = ''
  editValue.value = ''
}

const deleteEntry = async () => {
  if (
    !editing.value ||
    !confirm('Are you sure you want to delete this entry?') ||
    loadingEdit.value
  ) {
    return
  }

  loadingEdit.value = true
  await fetch('/urls/' + editing.value, {
    method: 'DELETE'
  })

  items.value = items.value.filter((entry) => entry['name'] !== editing.value)
  cancelEdit()
}

const saveEntry = async () => {
  editName.value = editName.value.trim()
  editValue.value = editValue.value.trim()

  if (
    !editName.value ||
    !editValue.value ||
    loadingEdit.value
  ) {
    return
  }

  loadingEdit.value = true

  if (!creating.value && editName.value !== editing.value) {
    await fetch('/urls/' + editing.value, {
      method: 'DELETE'
    })
    items.value = items.value.filter((entry) => entry['name'] !== editing.value)
  }
  await fetch('/urls/' + editName.value, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: editValue.value
  })

  const newEntry = {
    name: editName.value,
    value: editValue.value,
    metadata: {
      created: Math.round(new Date().getTime()),
      hits: 0
    }
  }
  const iInsert = items.value.findIndex((entry) => entry['name'] > editName.value)
  if (iInsert >= 0) {
    items.value = [
      ...items.value.slice(0, iInsert),
      newEntry,
      ...items.value.slice(iInsert)
    ]
  } else {
    items.value.push(newEntry)
  }

  cancelEdit()
}

onMounted(() => {
  reloadList()
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<template>
  <div
    ref="list"
    class="list-group"
  >
    <template
      v-for="item of items"
      :key="item.name"
    >
      <entry
        v-if="editing !== item.name"
        :item="item"
        :editable="!(editing || creating)"
        @edit="editEntry(item.name)"
      />
      <entry-edit
        v-else
        :loading="loadingEdit"
        v-model:name="editName"
        v-model:value="editValue"
        @cancel="cancelEdit"
        @delete="deleteEntry"
        @save="saveEntry"
      />
    </template>
    <div
      v-if="loading"
      class="list-group-item bg-secondary text-center"
    >
      <div
        class="spinner-border spinner-border-sm me-1"
        role="status"
      >
        <span class="visually-hidden">
          Loading...
        </span>
      </div>
      Loading more entries...
    </div>
  </div>

  <div
    v-if="creating"
    class="list-group my-4"
  >
    <entry-edit
      :loading="loadingEdit"
      creating
      v-model:name="editName"
      v-model:value="editValue"
      @cancel="cancelEdit"
      @save="saveEntry"
    />
  </div>
  <button
    v-else-if="!editing"
    type="button"
    class="d-block w-100 my-4 btn btn-lg btn-primary"
    @click="createEntry"
  >
    Create New Entry
  </button>
</template>
