<template>
  <div class="main flex justify-between">
    <Tree class="w-[17%]" @nodeClick="handleNodeClick" />
    <div class="w-[81%]">
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
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择"
            clearable
            @change="onSearch"
          >
            <el-option
              v-for="dict of sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onSearch"
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

      <PureTableBar title="用户管理" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            v-if="hasAuth(['system:user:add'])"
            @click="handleAdd"
          >
            新增用户
          </el-button>
          <el-button
            type="primary"
            plain
            :icon="useRenderIcon(Upload)"
            @click="handleImport"
            v-if="hasAuth(['system:user:import'])"
          >
            导入
          </el-button>
          <el-button
            type="warning"
            plain
            :icon="useRenderIcon(Download)"
            @click="handleExport"
            v-if="hasAuth(['system:user:export'])"
          >
            导出
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            border
            align-whole="center"
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
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #status="{ row }">
              <el-switch
                v-model="row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(row)"
                v-if="row.userId !== 1"
              />
              <DictTag
                :options="sys_normal_disable"
                :value="row.status"
                v-if="row.userId === 1"
              />
            </template>

            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="handleUpdate(row)"
                :icon="useRenderIcon(EditPen)"
                v-if="row.userId !== 1 && hasAuth(['system:user:edit'])"
              >
                修改
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                v-if="row.userId !== 1 && hasAuth(['system:user:remove'])"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(Delete)"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-dropdown v-if="row.userId !== 1">
                <el-button
                  class="ml-3 mt-[2px]"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="hasAuth(['system:user:resetPwd'])">
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Password)"
                        @click="handleResetPwd(row)"
                      >
                        重置密码
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="hasAuth(['system:user:edit'])">
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Role)"
                        @click="handleAuthRole(row)"
                      >
                        分配角色
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
    <Form ref="formRef" @reload="getList" />
    <AuthRole ref="authRoleRef" />

    <!-- 用户导入对话框 -->
    <el-dialog title="用户导入" v-model="upload.open" width="400px">
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        action=""
        :on-change="uploadTemplate"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <IconifyIconOffline
          :icon="uploadFilled"
          class="text-gray-400 text-[65px] m-auto mb-4"
        />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip flex-c">
              <el-checkbox v-model="upload.updateSupport" />
              <div class="ml-1.5">是否更新已经存在的用户数据</div>
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" @click="importTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="flex-ec">
          <el-button
            type="primary"
            @click="submitFileForm"
            :loading="upload.isUploading"
            >确 定</el-button
          >
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import Tree from "./tree.vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { type PaginationProps } from "@pureadmin/table";
import { hasAuth } from "@/router/utils";
import Form from "./form.vue";
import AuthRole from "./authRole.vue";

import Role from "@iconify-icons/ri/admin-line";
import Password from "@iconify-icons/ri/lock-password-line";
import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Upload from "@iconify-icons/ep/upload";
import Download from "@iconify-icons/ep/download";
import uploadFilled from "@iconify-icons/ep/upload-filled";

import AddFill from "@iconify-icons/ri/add-circle-line";
import { useDict } from "@/utils/useDict";
import { addDateRange } from "@/utils/ruoyi";
import {
  changeUserStatus,
  delUser,
  exportUser,
  exportUserTemplate,
  importUserData,
  listUser,
  resetUserPwd
} from "@/api/system/user";

defineOptions({
  name: "User"
});

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const formRef = ref();
const authRoleRef = ref();
const dataList = ref([]);
const dateRange = ref();
const loading = ref(true);
const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize,
  userName: undefined,
  phonenumber: undefined,
  status: undefined,
  deptId: undefined
});

const columns: TableColumnList = [
  {
    label: "用户名称",
    prop: "userName",
    minWidth: 130
  },
  {
    label: "用户昵称",
    prop: "nickName",
    minWidth: 130
  },
  {
    label: "部门",
    prop: "dept",
    minWidth: 90,
    formatter: ({ dept }) => dept.deptName
  },
  {
    label: "手机号码",
    prop: "phonenumber",
    minWidth: 90
  },
  {
    label: "状态",
    prop: "status",
    minWidth: 100,
    slot: "status"
  },
  {
    label: "创建时间",
    minWidth: 90,
    prop: "createTime",
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  {
    label: "操作",
    fixed: "right",
    width: 180,
    slot: "operation"
  }
];
const buttonClass = computed(() => {
  return [
    "!h-[20px]",
    "reset-margin",
    "!text-gray-500",
    "dark:!text-white",
    "dark:hover:!text-primary"
  ];
});

/** 用户状态修改 */
const handleStatusChange = row => {
  const text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(
    `确认要${text} <b>${row.userName}</b> 用户吗?`,
    "系统提示",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      return changeUserStatus(row.userId, row.status);
    })
    .then(() => {
      message(`${text}成功`, {
        type: "success"
      });
    })
    .catch(() => {
      row.status = row.status === "0" ? "1" : "0";
    });
};

const handleAdd = () => {
  formRef.value.setData();
  formRef.value.showDrawer = true;
};
const handleUpdate = row => {
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

const handleDelete = row => {
  delUser(row.userId).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
};

/*** 用户导入参数 */
const uploadRef = ref();
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  file: null
});

/** 下载模板操作 */
const importTemplate = () => {
  exportUserTemplate();
};

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = res => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value.handleRemove(upload.file);
  ElMessageBox.alert(res.msg, "导入结果", {
    dangerouslyUseHTMLString: true,
    confirmButtonText: "确定"
  });
  getList();
};

const uploadTemplate = val => {
  upload.file = val.raw;
};

const submitFileForm = () => {
  // uploadRef.value.submit();
  upload.isUploading = true;
  importUserData({ file: upload.file, updateSupport: upload.updateSupport })
    .then(res => {
      handleFileSuccess(res);
    })
    .catch(() => {
      upload.isUploading = false;
      uploadRef.value.handleRemove(upload.file);
    });
};

const handleImport = () => {
  upload.open = true;
};

const handleExport = () => {
  exportUser(form);
};

const handleResetPwd = row => {
  ElMessageBox.prompt(`请输入 ${row.userName} 的新密码`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 5 和 20 之间"
  })
    .then(({ value }) => {
      resetUserPwd(row.userId, value).then(() => {
        // message(`修改成功，新密码是：${value}`, {
        //   type: "success"
        // });
        ElMessageBox.alert(`修改成功，新密码是：${value}`, "提示", {
          confirmButtonText: "确定"
        });
      });
    })
    .catch(() => {});
};

const handleAuthRole = row => {
  authRoleRef.value.setData(row);
  authRoleRef.value.showDrawer = true;
};

const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`);
  pagination.pageSize = val;
  form.pageSize = pagination.pageSize;
  getList();
};

const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`);
  pagination.currentPage = val;
  form.pageNum = pagination.currentPage;
  getList();
};

const onSearch = () => {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
};

const handleNodeClick = row => {
  form.deptId = row.id;
  onSearch();
};

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listUser(addDateRange(form, dateRange.value));
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  dateRange.value = [];
  formEl.resetFields();
  onSearch();
};

onMounted(() => {
  onSearch();
});
</script>
