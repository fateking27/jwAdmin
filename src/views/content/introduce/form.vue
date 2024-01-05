<!--suppress ALL -->
<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增文章' : '编辑文章'"
    :before-close="handleDrawerClose"
    size="1020px"
  >
    <el-form label-width="110px" ref="portalRef" :rules="rules" :model="form">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入文章标题"
          maxlength="40"
        />
      </el-form-item>

      <el-form-item
        style="display: none"
        label="文章封面Id"
        prop="coverMaterialId"
      >
        <el-input v-model="form.coverMaterialId" placeholder="" />
      </el-form-item>

      <el-form-item label="文章封面" prop="coverMaterialUrl">
        <!-- 添加筛选 -->
        <el-select
          filterable
          v-model="form.coverMaterialUrl"
          placeholder="请选择文章封面"
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

      <el-form-item label="索引号" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入索引号"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="分类" prop="type">
        <el-select v-model="form.type" placeholder="请选择分类" size="default">
          <el-option label="项目来源" value="项目来源" />
          <el-option label="建设意义" value="建设意义" />
          <el-option label="预期成果" value="预期成果" />
        </el-select>
      </el-form-item>

      <el-form-item label="文号" prop="article_no">
        <el-input
          v-model="form.article_no"
          placeholder="请输入文号"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input
          v-model="form.author"
          placeholder="请输入作者"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="来源" prop="source">
        <el-input
          v-model="form.source"
          placeholder="请输入来源"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="发布机构" prop="promulgator">
        <el-input
          v-model="form.promulgator"
          placeholder="请输入发布机构"
          maxlength="20"
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

      <el-form-item label="文章内容" prop="content">
        <SuperEditor v-if="showDrawer" v-model:model-value="form.content" />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="onSubmit(portalRef)"
          >提交</el-button
        >
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs, onMounted } from "vue";
import { message } from "@/utils/message";
import { addPortal, updatePortal, getPortal } from "@/api/content/portal";
import { useDict } from "@/utils/useDict";
import { cloneDeep } from "@pureadmin/utils";
import SuperEditor from "@/components/SuperEditor/index.vue";
import { NewImg } from "@/api/content/new";

let options = [];
const portalRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    title: [{ required: true, message: "文章标题不能为空", trigger: "blur" }],
    code: [{ required: true, message: "索引号不能为空", trigger: "blur" }],
    type: [{ required: true, message: "分类不能为空", trigger: "blur" }],
    content: [{ required: true, message: "内容不能为空", trigger: "blur" }],
    coverMaterialUrl: [
      { required: true, message: "文章封面不能为空", trigger: "blur" }
    ]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    type: undefined,
    code: undefined,
    article_no: undefined,
    author: undefined,
    content: undefined,
    releaseTime: undefined,
    release_status: undefined,
    promulgator: undefined,
    source: undefined,
    coverMaterialUrl: undefined
  };
  if (portalRef.value?.resetFields) {
    portalRef.value.resetFields();
  }
};

const isUpdate = ref(false);

//获取封面图片
const getNewImg = async () => {
  const res = await NewImg();
  console.log(res);
  options = res.data;
};

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
        await addPortal(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updatePortal(form.value)
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
    getPortal(id).then(response => {
      form.value = response.data;
    });
  }
};

onMounted(() => {
  getNewImg();
});

defineExpose({ showDrawer, isUpdate, setData });
</script>
