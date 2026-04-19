<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, useDialog, NButton, NTag, NSwitch, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import {
  getAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../../services/api'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const list = ref<any[]>([])
const showModal = ref(false)
const editingId = ref<number | null>(null)

const form = ref({ title: '', content: '', type: 'info', active: true })

const typeOptions = [
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '成功', value: 'success' },
]

const typeColorMap: Record<string, string> = { info: 'info', warning: 'warning', success: 'success' }

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminAnnouncements()
    list.value = Array.isArray(res) ? res : (res.data || [])
  } catch { message.error('获取公告列表失败') }
  loading.value = false
}

function openAdd() {
  editingId.value = null
  form.value = { title: '', content: '', type: 'info', active: true }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = { title: row.title, content: row.content, type: row.type || 'info', active: row.active !== false }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.title) return message.warning('请填写标题')
  try {
    if (editingId.value) {
      await updateAnnouncement(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await createAnnouncement(form.value)
      message.success('创建成功')
    }
    showModal.value = false
    fetchList()
  } catch { message.error('操作失败') }
}

async function toggleActive(row: any) {
  try {
    await updateAnnouncement(row.id, { active: !row.active })
    fetchList()
  } catch { message.error('更新失败') }
}

function handleDelete(id: number, title: string) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 "${title}" 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteAnnouncement(id)
        message.success('已删除')
        fetchList()
      } catch { message.error('删除失败') }
    },
  })
}

const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60, align: 'center' },
  { title: '标题', key: 'title', width: 200 },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
  {
    title: '类型', key: 'type', width: 100,
    render: (row: any) => h(NTag, {
      size: 'small', type: (typeColorMap[row.type] || 'default') as any, bordered: false,
    }, { default: () => row.type || 'info' }),
  },
  {
    title: '状态', key: 'active', width: 80,
    render: (row: any) => h(NSwitch, {
      size: 'small', value: row.active !== false, onUpdateValue: () => toggleActive(row),
    }),
  },
  {
    title: '操作', key: 'actions', width: 140,
    render: (row: any) => h(NSpace, { size: 4 }, {
      default: () => [
        h(NButton, { size: 'small', quaternary: true, type: 'info', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row.id, row.title) }, { default: () => '删除' }),
      ],
    }),
  },
]

onMounted(fetchList)
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="16">
      <n-space justify="space-between" align="center">
        <n-tag size="small" :bordered="false">共 {{ list.length }} 条公告</n-tag>
        <n-button type="primary" size="small" @click="openAdd">发布公告</n-button>
      </n-space>

      <n-card title="公告管理">
        <n-data-table :columns="columns" :data="list" :loading="loading" :bordered="false" striped :pagination="{ pageSize: 10 }" size="small" />
      </n-card>
    </n-space>

    <n-modal v-model:show="showModal" preset="card" :title="editingId ? '编辑公告' : '发布公告'" style="width: 520px">
      <n-form label-placement="left" label-width="60">
        <n-form-item label="标题">
          <n-input v-model:value="form.title" placeholder="公告标题" />
        </n-form-item>
        <n-form-item label="内容">
          <n-input v-model:value="form.content" type="textarea" placeholder="公告内容" :rows="4" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="form.type" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="启用">
          <n-switch v-model:value="form.active" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">{{ editingId ? '更新' : '发布' }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
