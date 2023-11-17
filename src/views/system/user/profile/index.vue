<template>
  <div class="main">
    <el-row :gutter="20">
      <el-col :span="10" :xs="24">
        <el-card>
          <template #header> 个人信息 </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label-class-name="labelName">
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="User"
                    class="text-[16px] mr-1 mb-1"
                  />
                  用户名称
                </div>
              </template>
              {{ state.user.userName }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="labelName">
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="Phone"
                    class="text-[16px] mr-1 mb-1"
                  />
                  手机号码
                </div>
              </template>
              {{ state.user.phonenumber }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="labelName">
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="Message"
                    class="text-[16px] mr-1 mb-1"
                  />
                  用户邮箱
                </div>
              </template>
              {{ state.user.email }}
            </el-descriptions-item>
            <el-descriptions-item
              label-class-name="labelName"
              v-if="state.user.dept"
            >
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="NodeTree"
                    class="text-[16px] mr-1 mb-1"
                  />
                  所属部门
                </div>
              </template>
              {{ state.postGroup }} / {{ state.user.dept.deptName }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="labelName">
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="Groupline"
                    class="text-[16px] mr-1 mb-1"
                  />
                  所属角色
                </div>
              </template>
              {{ state.roleGroup }}
            </el-descriptions-item>
            <el-descriptions-item label-class-name="labelName">
              <template #label>
                <div class="flex-s">
                  <iconifyIconOffline
                    :icon="Calendar"
                    class="text-[16px] mr-1 mb-1"
                  />
                  创建日期
                </div>
              </template>
              {{ state.user.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="14" :xs="24">
        <el-card>
          <template #header> 基本信息 </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <ResetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getUserProfile } from "@/api/system/user";
import UserInfo from "./userInfo.vue";
import ResetPwd from "./resetPwd.vue";
import User from "@iconify-icons/ep/user";
import Phone from "@iconify-icons/ep/phone";
import Message from "@iconify-icons/ep/message";
import NodeTree from "@iconify-icons/ri/node-tree";
import Groupline from "@iconify-icons/ri/group-line";
import Calendar from "@iconify-icons/ep/calendar";

defineOptions({
  name: "UserProfile"
});

const activeTab = ref("userinfo");
const state = reactive({
  user: {} as any,
  roleGroup: {},
  postGroup: {}
});

const getUser = () => {
  getUserProfile().then(response => {
    state.user = response.data.user;
    state.roleGroup = response.data.roleGroup;
    state.postGroup = response.data.postGroup;
  });
};

onMounted(() => {
  getUser();
});
</script>

<style scoped lang="scss">
:deep(.labelName) {
  width: 120px;
}
</style>
