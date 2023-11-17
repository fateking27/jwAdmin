<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增岗位' : '编辑岗位'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="postRef" :rules="rules" :model="form">
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="form.postName" placeholder="请输入岗位名称" />
      </el-form-item>
      <el-form-item label="岗位编码" prop="postCode">
        <el-input v-model="form.postCode" placeholder="请输入编码名称" />
      </el-form-item>

      <el-form-item label="岗位状态" prop="status">
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

      <el-form-item label="岗位顺序" prop="postSort">
        <el-input-number
          v-model="form.postSort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(postRef)"
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
import { addPost, getPost, updatePost } from "@/api/system/post";
import { useDict } from "@/utils/useDict";
const { sys_normal_disable } = useDict("sys_normal_disable");

const loading = ref(false);
const showDrawer = ref(false);
const postRef = ref();

const data = reactive({
  form: {} as any,
  rules: {
    postName: [
      { required: true, message: "岗位名称不能为空", trigger: "blur" }
    ],
    postCode: [
      { required: true, message: "岗位编码不能为空", trigger: "blur" }
    ],
    postSort: [{ required: true, message: "岗位顺序不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: "0",
    remark: undefined
  };
  if (postRef.value?.resetFields) {
    postRef.value.resetFields();
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
        await addPost(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updatePost(form.value)
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
    const postId = row.postId;
    getPost(postId).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, setData });
</script>
