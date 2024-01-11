<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增视频信息' : '编辑视频信息'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="newRef" :rules="rules" :model="form">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入标题"
          maxlength="60"
        />
      </el-form-item>

      <el-form-item label="图片路径" prop="imagePath">
        <el-input
          v-model="form.imagePath"
          placeholder="请输入图片路径"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="音频链接" prop="url">
        <el-input
          v-model="form.url"
          placeholder="请输入音频链接"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          placeholder="请输入描述"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input
          v-model="form.author"
          placeholder="请输入作者"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="素材顺序" prop="orderNo">
        <el-input-number
          v-model="form.orderNo"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="是否显示封面" prop="showCoverPic">
        <template #label>
          <div class="flex-c">
            <el-tooltip content="选择列表中是否显示封面" placement="top">
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">显示封面</div>
          </div>
        </template>
        <el-radio-group v-model="form.showCoverPic">
          <el-radio
            v-for="dict of sys_cover_status"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(newRef)"
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
//import { handleTree } from "@pureadmin/utils";

import { getAudio, addAudio, editAudio } from "@/api/material/audio";
import questionFilled from "@iconify-icons/ep/question-filled";
import { useDict } from "@/utils/useDict";
import { number } from "vue-types";

const { sys_cover_status } = useDict("sys_cover_status");

const newRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
    showCoverPic: [
      { required: true, message: "请选择是否在列表中显示封面", trigger: "blur" }
    ]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    imagePath: undefined,
    description: undefined,
    author: undefined,
    orderNo: undefined,
    showCoverPic: "1"
  };
  if (newRef.value?.resetFields) {
    newRef.value.resetFields();
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
        await addAudio(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await editAudio(form.value)
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
  if (!row) {
    isUpdate.value = false;
  } else {
    isUpdate.value = true;
    const id = row.id;
    getAudio(id).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, isUpdate, setData });
</script>
