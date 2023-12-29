<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增成果内容' : '编辑成果内容'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="resultRef" :rules="rules" :model="form">
      <el-form-item label="分级" prop="rank">
        <el-input
          v-model="form.rank"
          placeholder="请输入分级"
          maxlength="120"
        />
      </el-form-item>
      <el-form-item label="功能" prop="disasterReduction">
        <el-input
          v-model="form.disasterReduction"
          placeholder="请输入功能"
          maxlength="120"
        />
      </el-form-item>
      <el-form-item label="现状" prop="ecologicalStatus">
        <el-input
          v-model="form.ecologicalStatus"
          placeholder="请输入现状"
          maxlength="120"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="onSubmit(resultRef)"
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

import { addCurrent, updateResult, getResult } from "@/api/content/result";
const resultRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    rank: [{ required: true, message: "分级不能为空", trigger: "blur" }],
    disasterReduction: [
      { required: true, message: "功能不能为空", trigger: "blur" }
    ],
    decologicalStatus: [
      { required: true, message: "现状不能为空", trigger: "blur" }
    ]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    author: undefined,
    content: undefined,
    source: undefined,
    releaseTime: undefined,
    release_status: undefined,
    ecologicalStatus: undefined,
    disasterReduction: undefined,
    rank: undefined
  };
  if (resultRef.value?.resetFields) {
    resultRef.value.resetFields();
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
        await addCurrent(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateResult(form.value)
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
    getResult(id).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, isUpdate, setData });
</script>
