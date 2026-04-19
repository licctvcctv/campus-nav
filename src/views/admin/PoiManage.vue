<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, useDialog, NButton, NTag, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getPois, createPoi, updatePoi, deletePoi } from '../../services/api'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const pois = ref<any[]>([])
const showModal = ref(false)
const editingId = ref<number | null>(null)
const filterType = ref<string | null>(null)

const form = ref({ name: '', type: '', lng: 0, lat: 0, description: '' })

const typeOptions = [
  '教学楼', '教学区', '图书馆', '食堂', '体育设施',
  '宿舍', '行政办公', '生活服务', '出入口', '地标',
].map(t => ({ label: t, value: t }))

const filterOptions = [{ label: '全部类型', value: '' }, ...typeOptions]

const filteredPois = computed(() => {
  if (!filterType.value) return pois.value
  return pois.value.filter(p => p.type === filterType.value)
})

async function fetchPois() {
  loading.value = true
  try {
    const res = await getPois()
    pois.value = Array.isArray(res) ? res : (res.data || [])
  } catch { message.error('获取POI列表失败') }
  loading.value = false
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', type: '教学楼', lng: 0, lat: 0, description: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = { name: row.name, type: row.type, lng: row.lng, lat: row.lat, description: row.description || '' }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name || !form.value.type) {
    return message.warning('请填写名称和类型')
  }
  try {
    if (editingId.value) {
      await updatePoi(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await createPoi(form.value)
      message.success('创建成功')
    }
    showModal.value = false
    fetchPois()
  } catch { message.error('操作失败') }
}

function handleDelete(id: number, name: string) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 "${name}" 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deletePoi(id)
        message.success('已删除')
        fetchPois()
      } catch { message.error('删除失败') }
    },
  })
}

const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60, align: 'center' },
  { title: '名称', key: 'name', width: 200 },
  {
    title: '类型', key: 'type', width: 120,
    render: (row: any) => h(NTag, { size: 'small', bordered: false }, { default: () => row.type }),
  },
  { title: '经度', key: 'lng', width: 120, render: (row: any) => Number(row.lng).toFixed(6) },
  { title: '纬度', key: 'lat', width: 120, render: (row: any) => Number(row.lat).toFixed(6) },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 140,
    render: (row: any) => h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row.id, row.name) }, { default: () => '删除' }),
      ],
    }),
  },
]

onMounted(fetchPois)
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="16">
      <n-space justify="space-between" align="center">
        <n-space :size="12" align="center">
          <n-select v-model:value="filterType" :options="filterOptions" style="width: 160px" size="small" placeholder="筛选类型" clearable />
          <n-tag size="small" :bordered="false">共 {{ filteredPois.length }} 条</n-tag>
        </n-space>
        <n-button type="primary" size="small" @click="openAdd">添加POI</n-button>
      </n-space>

      <n-card title="POI管理">
        <n-data-table :columns="columns" :data="filteredPois" :loading="loading" :bordered="false" striped :pagination="{ pageSize: 15 }" size="small" />
      </n-card>
    </n-space>

    <n-modal v-model:show="showModal" preset="card" :title="editingId ? '编辑POI' : '添加POI'" style="width: 500px">
      <n-form label-placement="left" label-width="60">
        <n-form-item label="名称">
          <n-input v-model:value="form.name" placeholder="POI名称" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="form.type" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="经度">
          <n-input-number v-model:value="form.lng" :precision="6" style="width: 100%" />
        </n-form-item>
        <n-form-item label="纬度">
          <n-input-number v-model:value="form.lat" :precision="6" style="width: 100%" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.description" type="textarea" placeholder="描述信息" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">{{ editingId ? '更新' : '创建' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
