<template>
  <el-form ref="userRef" :model="userForm" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="userForm.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="userForm.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="userForm.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="userForm.sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        plain
        :loading="loading"
        @click="onSubmit(userRef)"
        >保存</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from "@/api/system/user";
import { FormInstance } from "element-plus";
import { message } from "@/utils/message";
import { ref, computed } from "vue";

const props = defineProps({
  user: {
    type: Object
  }
});

const userForm = computed(() => props.user);

const userRef = ref();
const loading = ref(false);

const rules = {
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"]
    }
  ],
  phonenumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ]
};

/** 提交按钮 */
const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await updateUserProfile(userForm.value)
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
