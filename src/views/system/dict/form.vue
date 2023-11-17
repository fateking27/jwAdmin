<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增字典类型' : '编辑字典类型'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="dictRef" :rules="rules" :model="form">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" placeholder="请输入字典名称" />
      </el-form-item>

      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.dictType" placeholder="请输入字典类型" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict of sys_normal_disable"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(dictRef)"
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

import { addType, getType, updateType } from "@/api/system/dict/type";
import { useDict } from "@/utils/useDict";

const { sys_normal_disable } = useDict("sys_normal_disable");

const loading = ref(false);
const showDrawer = ref(false);
const dictRef = ref();

const data = reactive({
  form: {} as any,
  rules: {
    dictName: [
      { required: true, message: "字典名称不能为空", trigger: "blur" }
    ],
    dictType: [{ required: true, message: "字典类型不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: "0",
    remark: undefined
  };
  if (dictRef.value?.resetFields) {
    dictRef.value.resetFields();
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
        await addType(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateType(form.value)
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
    const dictId = row.dictId;
    getType(dictId).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, setData });
</script>
