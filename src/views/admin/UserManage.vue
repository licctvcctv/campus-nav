<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, useDialog, NButton, NSelect } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getUsers, updateUser, deleteUser } from '../../services/api'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const users = ref<any[]>([])

const totalUsers = computed(() => users.value.length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const userCount = computed(() => users.value.filter(u => u.role === 'user').length)

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = Array.isArray(res) ? res : (res.data || [])
  } catch { message.error('获取用户列表失败') }
  loading.value = false
}

async function handleRoleChange(id: number, role: string) {
  try {
    await updateUser(id, { role })
    message.success('角色已更新')
    fetchUsers()
  } catch { message.error('更新失败') }
}

function handleDelete(id: number, name: string) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户 "${name}" 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(id)
        message.success('已删除')
        fetchUsers()
      } catch { message.error('删除失败') }
    },
  })
}

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
]

const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 70, align: 'center' },
  { title: '用户名', key: 'username', width: 180 },
  {
    title: '角色', key: 'role', width: 160,
    render: (row: any) => h(NSelect, {
      size: 'small', value: row.role, options: roleOptions, style: 'width:120px',
      onUpdateValue: (v: string) => handleRoleChange(row.id, v),
    }),
  },
  { title: '创建时间', key: 'created_at', width: 200,
    render: (row: any) => row.created_at ? new Date(row.created_at).toLocaleString() : '-',
  },
  {
    title: '操作', key: 'actions', width: 100,
    render: (row: any) => h(NButton, {
      size: 'small', type: 'error', quaternary: true,
      onClick: () => handleDelete(row.id, row.username),
    }, { default: () => '删除' }),
  },
]

onMounted(fetchUsers)
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <n-grid :cols="3" :x-gap="16">
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="用户总数" :value="totalUsers" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="管理员" :value="adminCount" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card size="small">
            <n-statistic label="普通用户" :value="userCount" />
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="用户管理">
        <n-data-table
          :columns="columns"
          :data="users"
          :loading="loading"
          :bordered="false"
          striped
          :pagination="{ pageSize: 15 }"
          size="small"
        />
      </n-card>
    </n-space>
  </div>
</template>
