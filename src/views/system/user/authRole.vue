<template>
  <el-drawer
    v-model="showDrawer"
    title="分配角色"
    :before-close="handleDrawerClose"
    size="80%"
  >
    <div class="main">
      <div class="p-2">
        <PureDescriptions
          title="基本信息"
          align="left"
          :column="2"
          border
          :data="[form]"
          :columns="infoColumns"
        />
      </div>

      <PureTableBar title="用户列表" :columns="columns" @refresh="getList">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(Select)"
            @click="submitForm"
          >
            提交
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="roleRef"
            border
            align-whole="center"
            showOverflowTooltip
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :header-cell-style="{
              background: 'var(--el-table-row-hover-bg-color)',
              color: 'var(--el-text-color-primary)'
            }"
            row-key="roleId"
            @selection-change="handleSelectionChange"
          />
        </template>
      </PureTableBar>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import Select from "@iconify-icons/ep/select";
import { getAuthRole, updateAuthRole } from "@/api/system/user";
import { message } from "@/utils/message";

const showDrawer = ref(false);
const roleRef = ref();
const dataList = ref([]);
const roleIds = ref([]);
const loading = ref(true);

const handleDrawerClose = () => {
  showDrawer.value = false;
};

const form = ref({
  nickName: undefined,
  userName: undefined,
  userId: undefined
});
const columns: TableColumnList = [
  {
    type: "selection",
    width: 55,
    align: "left",
    reserveSelection: true
  },
  {
    label: "角色编号",
    prop: "roleId"
  },
  {
    label: "角色名称",
    prop: "roleName"
  },
  {
    label: "权限字符",
    prop: "roleKey"
  },
  {
    label: "创建时间",
    width: 180,
    prop: "createTime",
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  }
];

const infoColumns = [
  {
    label: "用户昵称",
    prop: "nickName",
    labelClassName: "descriptions-label"
  },
  {
    label: "登录账号",
    prop: "userName",
    labelClassName: "descriptions-label"
  }
];

const handleSelectionChange = val => {
  roleIds.value = val.map(item => item.roleId);
};

const submitForm = () => {
  const userId = form.value.userId;
  const rIds = roleIds.value.join(",");
  updateAuthRole({ userId: userId, roleIds: rIds }).then(() => {
    message("授权成功", {
      type: "success"
    });
    handleDrawerClose();
  });
};

const getList = async () => {
  loading.value = true;
  const res = await getAuthRole(form.value.userId);
  dataList.value = res.data.roles;
  nextTick(() => {
    dataList.value.forEach(row => {
      if (row.flag && roleRef.value) {
        const { toggleRowSelection } = roleRef.value.getTableRef();
        toggleRowSelection(row);
      }
    });
  });
  loading.value = false;
};

const setData = row => {
  form.value = row;
  getList();
};

defineExpose({ showDrawer, setData });
</script>

<style scoped lang="scss">
:deep(.descriptions-label) {
  width: 15%;
}
</style>
