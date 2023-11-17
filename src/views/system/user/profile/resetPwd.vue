<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        placeholder="请输入新密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="user.confirmPassword"
        placeholder="请确认新密码"
        type="password"
        show-password
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        plain
        :loading="loading"
        @click="onSubmit(pwdRef)"
        >保存</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { updateUserPwd } from "@/api/system/user";
import { message } from "@/utils/message";

const pwdRef = ref();
const loading = ref(false);
const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});
const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ]
};

/** 提交按钮 */
const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await updateUserPwd(user.oldPassword, user.newPassword)
        .then(() => {
          message("修改成功", {
            type: "success"
          });
        })
        .catch(() => {
          loading.value = false;
        });
      loading.value = false;
    } else {
      loading.value = false;
      return fields;
    }
  });
};
</script>
