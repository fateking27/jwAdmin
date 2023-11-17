<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增字典数据' : '编辑字典数据'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="dataRef" :rules="rules" :model="form">
      <el-form-item label="字典类型">
        <div class="font-medium">{{ form.dictType }}</div>
      </el-form-item>

      <el-form-item label="数据标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
      </el-form-item>

      <el-form-item label="数据键值" prop="dictValue">
        <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
      </el-form-item>

      <el-form-item label="样式属性" prop="cssClass">
        <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
      </el-form-item>

      <el-form-item label="显示排序" prop="dictSort">
        <el-input-number
          v-model="form.dictSort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="回显样式" prop="listClass">
        <el-select v-model="form.listClass">
          <el-option
            v-for="item of listClassOptions"
            :key="item.value"
            :label="item.label + '(' + item.value + ')'"
            :value="item.value"
          />
        </el-select>
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
        <el-button type="primary" :loading="loading" @click="onSubmit(dataRef)"
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
import { addData, getData, updateData } from "@/api/system/dict/data";
import { useDictStoreHook } from "@/store/modules/dict";

const props = defineProps({
  dictType: {
    type: String
  }
});

const { sys_normal_disable } = useDict("sys_normal_disable");

// 数据标签回显样式
const listClassOptions = ref([
  { value: "default", label: "默认" },
  { value: "primary", label: "主要" },
  { value: "success", label: "成功" },
  { value: "info", label: "信息" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" }
]);

const loading = ref(false);
const showDrawer = ref(false);
const dataRef = ref();

const data = reactive({
  form: {} as any,
  rules: {
    dictLabel: [
      { required: true, message: "数据标签不能为空", trigger: "blur" }
    ],
    dictValue: [
      { required: true, message: "数据键值不能为空", trigger: "blur" }
    ],
    dictSort: [{ required: true, message: "数据顺序不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: "default",
    dictSort: 0,
    status: "0",
    remark: undefined
  };
  if (dataRef.value?.resetFields) {
    dataRef.value.resetFields();
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
        await addData(form.value)
          .then(() => {
            useDictStoreHook().removeDict(form.value.dictType);
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateData(form.value)
          .then(() => {
            useDictStoreHook().removeDict(form.value.dictType);
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
    form.value.dictType = props.dictType;
  } else {
    isUpdate.value = true;
    const dictCode = row.dictCode;
    getData(dictCode).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, setData });
</script>
