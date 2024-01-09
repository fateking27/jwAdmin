<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增阶段内容' : '编辑阶段内容'"
    :before-close="handleDrawerClose"
    size="1020px"
  >
    <el-form label-width="110px" ref="resultRef" :rules="rules" :model="form">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入标题"
          maxlength="40"
        />
      </el-form-item>

      <el-form-item label="来源" prop="source">
        <el-input
          v-model="form.source"
          placeholder="请输入来源"
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

      <el-form-item label="阶段封面" prop="coverMaterialUrl">
        <!-- 添加筛选 -->
        <el-select
          filterable
          v-model="form.coverMaterialUrl"
          placeholder="请选择阶段封面"
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

      <el-form-item label="阶段名称" prop="stageName">
        <el-input
          v-model="form.stageName"
          placeholder="请输入阶段名称"
          maxlength="10"
        />
      </el-form-item>

      <el-form-item label="阶段时间" prop="stageTime">
        <el-date-picker
          v-model="form.stageTime"
          type="monthrange"
          range-separator="-"
          value-format="YYYY-MM"
          :start-placeholder="form.stageBeginTime"
          :end-placeholder="form.stageEndTime"
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
        <!--        <SuperEditor v-model:model-value="form.content" />-->
        <SuperEditor v-if="showDrawer" v-model:model-value="form.content" />
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
import { ref, reactive, toRefs, onMounted } from "vue";
import { message } from "@/utils/message";
import SuperEditor from "@/components/SuperEditor/index.vue";
import { addPage, updateResult, getResult } from "@/api/content/result";
import { NewImg } from "@/api/content/new";

const resultRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);
const data = reactive({
  form: {} as any,
  rules: {
    title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
    content: [{ required: true, message: "内容不能为空", trigger: "blur" }],
    coverMaterialUrl: [
      { required: true, message: "文章封面不能为空", trigger: "blur" }
    ],
    stageTime: [
      { required: true, message: "阶段时间不能为空", trigger: "blur" }
    ],
    stageName: [
      { required: true, message: "阶段名称不能为空", trigger: "blur" }
    ]
  }
});

let options = [];
const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    author: undefined,
    content: undefined,
    source: undefined,
    stageName: undefined,
    releaseTime: undefined,
    release_status: undefined,
    stageTime: undefined,
    stageEndTime: undefined,
    stageBeginTime: undefined
  };
  if (resultRef.value?.resetFields) {
    resultRef.value.resetFields();
  }
};

//获取封面图片
const getNewImg = async () => {
  const res = await NewImg();
  console.log(res);
  options = res.data;
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
        await addPage(form.value)
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
      form.value.stageTime = [
        response.data.stageBeginTime,
        response.data.stageEndTime
      ];
    });
  }
};

onMounted(() => {
  getNewImg();
});

defineExpose({ showDrawer, isUpdate, setData });
</script>
