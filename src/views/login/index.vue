<template>
  <div class="select-none">
    <img :src="bg" class="wave" alt="" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  clearable
                  v-model="ruleForm.username"
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                  @keyup.enter="onLogin(ruleFormRef)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item
                prop="password"
                :rules="[
                  {
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                  }
                ]"
              >
                <el-input
                  clearable
                  show-password
                  v-model="ruleForm.password"
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                  @keyup.enter="onLogin(ruleFormRef)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-form-item prop="code">
                <el-input
                  clearable
                  v-model="ruleForm.code"
                  placeholder="验证码"
                  :prefix-icon="useRenderIcon(ShieldKeyholeLine)"
                  @keyup.enter="onLogin(ruleFormRef)"
                >
                  <template v-slot:append>
                    <img
                      :src="codeUrl"
                      @click="getCode"
                      class="cursor-pointer h-[38px]"
                      alt=""
                    />
                  </template>
                </el-input>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
// import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from "vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { initRouter } from "@/router/utils";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";
import ShieldKeyholeLine from "@iconify-icons/ri/shield-keyhole-line";

import { getCodeImg } from "@/api/user";
import { resData } from "@/store/modules/types";

defineOptions({
  name: "Login"
});

const captchaEnabled = ref(true);
const codeUrl = ref("");
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title } = useNav();

const ruleForm = reactive({
  username: "",
  password: "",
  code: "",
  uuid: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername(ruleForm)
        .then(res => {
          if (res.code === 200) {
            // 获取后端路由
            useUserStoreHook()
              .getUserInfo()
              .then(() => {
                initRouter().then(() => {
                  router.push("/");
                  message("登录成功", { type: "success" });
                  loading.value = false;
                });
              });
          }
        })
        .catch(() => {
          retrieveCode();
        });
    } else {
      retrieveCode();
      return fields;
    }
  });
};

const retrieveCode = () => {
  loading.value = false;
  // 重新获取验证码
  if (captchaEnabled.value) {
    ruleForm.code = "";
    getCode();
  }
};

const getCode = async () => {
  getCodeImg().then((res: resData) => {
    captchaEnabled.value =
      res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.data.img;
      ruleForm.uuid = res.data.uuid;
    }
  });
};

/** 使用公共函数，避免`removeEventListener`失效 */
const onkeypress = ({ code }: KeyboardEvent) => {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
};

onMounted(() => {
  getCode();
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>
<style scoped>
@import url("@/style/login.css");

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
