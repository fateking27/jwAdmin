<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增新闻' : '编辑新闻'"
    :before-close="handleDrawerClose"
    size="1020px"
  >
    <el-form label-width="110px" ref="newRef" :rules="rules" :model="form">
      <el-form-item label="新闻标题" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入新闻名称"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="新闻摘要" prop="brief">
        <el-input
          v-model="form.brief"
          placeholder="请输入新闻摘要"
          maxlength="50"
        />
      </el-form-item>

      <!-- <el-form-item label="新闻封面" prop="brief">
        <el-select v-model="value" placeholder="Select">
          <el-option-group
            v-for="group in options"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-option-group>
        </el-select>
      </el-form-item> -->

      <el-form-item label="新闻类别" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择新闻类别"
          size="default"
        >
          <el-option label="工作动态" value="工作动态" />
          <el-option label="进展成效" value="进展成效" />
        </el-select>
      </el-form-item>

      <el-form-item label="新闻标签" prop="mark">
        <el-input
          v-model="form.mark"
          placeholder="请输入新闻标签"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input
          v-model="form.author"
          placeholder="请输入作者"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="发布时间" prop="releaseTime">
        <el-date-picker
          v-model="form.releaseTime"
          type="date"
          placeholder="请选择发布时间"
          value-format="YYYY-MM-DD"
          :picker-options="pickerOptions"
        />
      </el-form-item>

      <!--            <el-form-item label="新闻封面" prop="content">-->
      <!--              <el-input-->
      <!--                v-model="form.content"-->
      <!--                placeholder="请输入新闻内容"-->
      <!--                type="textarea"-->
      <!--              />-->
      <!--            </el-form-item>-->

      <div style="border: 1px solid #ccc">
        <Toolbar
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />
        <Editor
          style="height: 500px; overflow-y: hidden"
          v-model="form.content"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
        />
      </div>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(newRef)"
          >提交
        </el-button>
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs, shallowRef } from "vue";
import { message } from "@/utils/message";

import { addNew, updateNew, getNew } from "@/api/content/new";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { cloneDeep } from "@pureadmin/utils";
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

const toolbarConfig = {};
const editorConfig = { placeholder: "请输入内容..." };
const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const mode = ref("default");
const valueHtml = ref("<p>hello</p>");
const newRef = ref();
const loading = ref(false);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    name: [{ required: true, message: "新闻名称不能为空", trigger: "blur" }],
    type: [{ required: true, message: "新闻类别不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    brief: undefined,
    name: undefined,
    type: undefined,
    mark: undefined,
    author: undefined,
    content: "",
    releaseTime: undefined,
    release_status: undefined
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
        await addNew(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateNew(form.value)
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
    form.value = cloneDeep(row);
  }
};

defineExpose({ showDrawer, isUpdate, setData });
</script>

<style>
/* #editor—wrapper { */

/*  border: 1px solid #ccc; */

/*  z-index: 100; !* 按需定义 *! */

/* } */

/* #toolbar-container { */

/*  border-bottom: 1px solid #ccc; */

/* } */

/* #editor-container { */

/*  height: 500px; */

/* } */
</style>
