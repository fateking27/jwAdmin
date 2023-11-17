<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增用户' : '编辑用户'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="userRef" :rules="rules" :model="form">
      <el-form-item label="用户昵称" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
      </el-form-item>

      <el-form-item label="归属部门" prop="deptId">
        <el-tree-select
          v-model="form.deptId"
          :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }"
          value-key="id"
          placeholder="请选择归属部门"
          check-strictly
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="form.phonenumber"
          placeholder="请输入手机号码"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item
        v-if="form.userId == undefined"
        label="用户名称"
        prop="userName"
      >
        <el-input
          v-model="form.userName"
          placeholder="请输入用户名称"
          maxlength="30"
        />
      </el-form-item>

      <el-form-item
        v-if="form.userId == undefined"
        label="用户密码"
        prop="password"
      >
        <el-input
          v-model="form.password"
          placeholder="请输入用户密码"
          type="password"
          maxlength="20"
          show-password
        />
      </el-form-item>

      <el-form-item label="用户性别">
        <el-select v-model="form.sex" placeholder="请选择" class="w-full">
          <el-option
            v-for="dict of sys_user_sex"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select
          v-model="form.roleIds"
          multiple
          placeholder="请选择"
          class="w-full"
        >
          <el-option
            v-for="item of roleOptions"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
            :disabled="item.status == 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位">
        <el-select
          v-model="form.postIds"
          multiple
          placeholder="请选择"
          class="w-full"
        >
          <el-option
            v-for="item of postOptions"
            :key="item.postId"
            :label="item.postName"
            :value="item.postId"
            :disabled="item.status == 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict of sys_normal_disable"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(userRef)"
          >提交</el-button
        >
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs } from "vue";
import { message } from "@/utils/message";
import { useDict } from "@/utils/useDict";
import {
  addUser,
  deptTreeSelect,
  getUser,
  updateUser
} from "@/api/system/user";

const { sys_normal_disable, sys_user_sex } = useDict(
  "sys_normal_disable",
  "sys_user_sex"
);

const userRef = ref();
const loading = ref(false);

const deptOptions = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);

const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    userName: [
      { required: true, message: "用户名称不能为空", trigger: "blur" },
      {
        min: 2,
        max: 20,
        message: "用户名称长度必须介于 2 和 20 之间",
        trigger: "blur"
      }
    ],
    nickName: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "用户密码不能为空", trigger: "blur" },
      {
        min: 5,
        max: 20,
        message: "用户密码长度必须介于 5 和 20 之间",
        trigger: "blur"
      }
    ],
    email: [
      {
        type: "email",
        message: "请输入正确的邮箱地址",
        trigger: ["blur", "change"]
      }
    ],
    phonenumber: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur"
      }
    ]
  } as any
});

const { form, rules } = toRefs(data);

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
}

/** 表单重置 */
const reset = () => {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  };
  if (userRef.value?.resetFields) {
    userRef.value.resetFields();
  }
};

const isUpdate = ref(false);

const handleDrawerClose = () => {
  reset();
  showDrawer.value = false;
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (!isUpdate.value) {
        await addUser(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateUser(form.value)
          .then(() => {
            message("修改成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      }

      handleDrawerClose();
      emit("reload");
      loading.value = false;
    } else {
      loading.value = false;
      return fields;
    }
  });
};

const emit = defineEmits<{
  (e: "reload"): void;
}>();

const setData = async row => {
  reset();
  getDeptTree();
  if (!row) {
    getUser().then(response => {
      postOptions.value = response.data.posts;
      roleOptions.value = response.data.roles;
      form.value.password = "";
    });
    isUpdate.value = false;
  } else {
    const userId = row.userId;
    getUser(userId).then(response => {
      form.value = response.data.user;
      postOptions.value = response.data.posts;
      roleOptions.value = response.data.roles;
      form.value.postIds = response.data.postIds;
      form.value.roleIds = response.data.roleIds;
      form.value.password = "";
    });
    isUpdate.value = true;
  }
};

defineExpose({ showDrawer, setData });
</script>
