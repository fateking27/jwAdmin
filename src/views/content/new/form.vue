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
          maxlength="30"
        />
      </el-form-item>

      <el-form-item
        style="display: none"
        label="新闻封面Id"
        prop="coverMaterialId"
      >
        <el-input v-model="form.coverMaterialId" placeholder="" />
      </el-form-item>

      <el-form-item label="新闻封面" prop="coverMaterialUrl">
        <!-- 添加筛选 -->
        <el-select
          filterable
          v-model="form.coverMaterialUrl"
          placeholder="请选择新闻封面"
        >
          <el-option-group
            v-for="group in options"
            :key="group.name"
            :label="group.name"
          >
            <el-option
              v-for="item in group.list"
              :key="item.id"
              :label="item.title"
              :value="item.url"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

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

      <el-form-item label="来源" prop="source">
        <el-input
          v-model="form.source"
          placeholder="请输入来源"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="新闻标签" prop="mark">
        <el-input
          v-model="form.mark"
          placeholder="请输入新闻标签"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="新闻摘要" prop="brief">
        <el-input
          v-model="form.brief"
          placeholder="请输入新闻摘要"
          maxlength="50"
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
      <el-form-item label="内容" prop="content">
        <SuperEditor v-model:model-value="form.content" />
      </el-form-item>

      <el-form-item style="margin-top: 20px; margin-left: -110px">
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
import { ref, reactive, toRefs, onMounted } from "vue";
import { message } from "@/utils/message";
import { addNew, updateNew, NewImg } from "@/api/content/new";
import { cloneDeep } from "@pureadmin/utils";
import SuperEditor from "@/components/SuperEditor/index.vue";
let options = [];

//获取新闻封面图片
const getNewImg = async () => {
  const res = await NewImg();
  console.log(res);
  options = res.data;
};

const mode = ref("default");
const newRef = ref();
const loading = ref(false);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    name: [{ required: true, message: "新闻名称不能为空", trigger: "blur" }],
    type: [{ required: true, message: "新闻类别不能为空", trigger: "blur" }],
    coverMaterialUrl: [
      { required: true, message: "新闻封面不能为空", trigger: "blur" }
    ]
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
    source: undefined,
    releaseTime: undefined,
    release_status: undefined,
    coverMaterialId: "",
    coverMaterialUrl: undefined
  };
  if (newRef.value?.resetFields) {
    newRef.value.resetFields();
  }
};

const isUpdate = ref(false);

const handleDrawerClose = () => {
  // reset();
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

onMounted(() => {
  getNewImg();
});

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
