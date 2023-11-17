<template>
  <el-drawer
    v-model="showDrawer"
    title="选择用户"
    :before-close="handleDrawerClose"
    size="90%"
  >
    <div class="main">
      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="form"
        class="bg-bg_color w-[99/100] pl-8 pt-4"
      >
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="form.userName"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="form.phonenumber"
            placeholder="请输入手机号码"
            clearable
            @keyup.enter="onSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="useRenderIcon(Search)"
            :loading="loading"
            @click="onSearch"
          >
            搜索
          </el-button>
          <el-button
            :icon="useRenderIcon(Refresh)"
            @click="resetForm(searchFormRef)"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <PureTableBar title="用户列表" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            @click="handleSelectUser"
            v-if="hasAuth(['system:role:add'])"
          >
            确定
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            border
            align-whole="center"
            showOverflowTooltip
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small'"
            :header-cell-style="{
              background: 'var(--el-table-row-hover-bg-color)',
              color: 'var(--el-text-color-primary)'
            }"
            row-key="userId"
            adaptive
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #status="{ row }">
              <DictTag :options="sys_normal_disable" :value="row.status" />
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDict } from "@/utils/useDict";
import { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import { authUserSelectAll, unallocatedUserList } from "@/api/system/role";
import { hasAuth } from "@/router/utils";

import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { message } from "@/utils/message";

const { sys_normal_disable } = useDict("sys_normal_disable");

const showDrawer = ref(false);
const searchFormRef = ref();
const dataList = ref([]);
const loading = ref(true);
const userIds = ref([]);

const handleDrawerClose = () => {
  showDrawer.value = false;
};

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  roleId: "",
  userName: undefined,
  phonenumber: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  {
    type: "selection",
    width: 55,
    align: "left",
    reserveSelection: true
  },
  {
    label: "用户名称",
    prop: "userName"
  },
  {
    label: "用户昵称",
    prop: "nickName"
  },
  {
    label: "邮箱",
    prop: "email"
  },
  {
    label: "手机",
    prop: "phonenumber"
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    slot: "status"
  },
  {
    label: "创建时间",
    width: 180,
    prop: "createTime",
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  }
];

const handleSelectUser = () => {
  const roleId = form.roleId;
  const uIds = userIds.value.join(",");
  if (uIds == "") {
    return message("请选择要分配的用户", {
      type: "warning"
    });
  }
  authUserSelectAll({ roleId: roleId, userIds: uIds }).then(res => {
    message(res.msg, {
      type: "success"
    });
    handleDrawerClose();
    emit("reload");
  });
};

const emit = defineEmits<{
  (e: "reload"): void;
}>();

const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`);
  pagination.pageSize = val;
  form.pageSize = pagination.pageSize;
  onSearch();
};

const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`);
  pagination.currentPage = val;
  form.pageNum = pagination.currentPage;
  onSearch();
};

const handleSelectionChange = val => {
  // console.log("handleSelectionChange", val);
  userIds.value = val.map(item => item.userId);
};

const onSearch = () => {
  pagination.currentPage = 1;
  getList();
};

const getList = async () => {
  loading.value = true;
  const { rows, total } = await unallocatedUserList(form);
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

const setData = row => {
  form.roleId = row.roleId;
  getList();
};

defineExpose({ showDrawer, setData });
</script>
