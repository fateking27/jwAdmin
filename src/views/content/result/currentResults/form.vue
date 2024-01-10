<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增成果内容' : '编辑成果内容'"
    :before-close="handleDrawerClose"
    size="620px"
  >
    <el-form label-width="110px" ref="resultRef" :rules="rules" :model="form">
      <el-form-item label="分级" prop="rank">
        <el-input
          v-model="form.rank"
          placeholder="请输入分级"
          maxlength="120"
        />
      </el-form-item>

      <el-form-item label="功能" prop="fun">
        <el-input v-model="form.fun" placeholder="请输入功能" maxlength="120" />
      </el-form-item>

      <el-form-item label="现状" prop="ecologicalStatus">
        <el-input
          v-model="form.ecologicalStatus"
          placeholder="请输入现状"
          maxlength="120"
        />
      </el-form-item>

      <el-form-item label="模块" prop="module">
        <!-- <el-input
          v-model="form.module"
          placeholder="请输入模块"
          maxlength="120"
        /> -->
        <el-select
          filterable
          clearable
          v-model="form.module"
          placeholder="请选择模块"
        >
          <el-option label="红树林-盐沼" value="红树林-盐沼" />
          <el-option label="入海污染物" value="入海污染物" />
          <el-option label="仿岩质潮间带" value="仿岩质潮间带" />
          <el-option label="海岸带生态" value="海岸带生态" />
          <el-option label="海洋防灾减灾" value="海洋防灾减灾" />
        </el-select>
      </el-form-item>

      <el-form-item label="图片选择" prop="achievementMaterialUrlArr">
        <!-- 添加筛选 -->
        <el-select
          filterable
          clearable
          multiple
          v-model="form.achievementMaterialUrlArr"
          placeholder="请选择图片"
          @change="
            e => {
              console.log(form);
            }
          "
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

import { addCurrent, updateResult, getResult } from "@/api/content/result";
import { NewImg } from "@/api/content/new";
const resultRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);
let options = [];

//获取素材图片
const getNewImg = async () => {
  const res = await NewImg();
  // console.log(res);
  options = res.data;
};

const data = reactive({
  form: {} as any,
  rules: {
    rank: [{ required: true, message: "分级不能为空", trigger: "blur" }],
    fun: [{ required: true, message: "功能不能为空", trigger: "blur" }],
    ecologicalStatus: [
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
    fun: undefined,
    rank: undefined,
    module: undefined,
    achievementMaterialUrlArr: []
  };
  if (resultRef.value?.resetFields) {
    resultRef.value.resetFields();
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
  // console.log(row)
  reset();
  if (!row) {
    isUpdate.value = false;
  } else {
    isUpdate.value = true;
    const id = row.id;
    // getResult(id).then(response => {
    //   form.value = response.data;
    //   console.log(response.data)
    // });

    //当前成果表单回显
    form.value = row;
  }
};

onMounted(() => {
  getNewImg();
});

defineExpose({ showDrawer, isUpdate, setData });
</script>
