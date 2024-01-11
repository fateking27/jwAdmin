<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增图片信息' : '编辑图片信息'"
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

      <el-form-item label="是否显示图片" prop="showCoverPic">
        <template #label>
          <div class="flex-c">
            <el-tooltip content="选择列表中是否显示图片" placement="top">
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">显示图片</div>
          </div>
        </template>

        <el-radio-group v-model="form.showCoverPic">
          <el-radio
            v-for="dict of sys_cover_status"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="上传图片" prop="picture">
        <el-upload
          v-loading="loading"
          element-loading-text="上传中..."
          action=""
          ref="upload"
          drag
          :http-request="handleFileUpload"
          :before-upload="handleBeforeUpload"
          :file-list="fileList"
        >
          <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(newRef)"
          >提交
        </el-button>
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts" setup>
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs } from "vue";
import { message } from "@/utils/message";
import { uploadstaticImage, getStaticImage } from "@/api/material/picture";

import { getPicture, addPicture, editPicture } from "@/api/material/picture";
import { useDict } from "@/utils/useDict";

const { VITE_API_PATH } = import.meta.env;
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
      { required: true, message: "请选择是否在列表中显示图片", trigger: "blur" }
    ]
  }
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    fileName: "",
    description: undefined,
    author: undefined,
    orderNo: undefined,
    showCoverPic: "1",
    imageUrl: undefined
  };
  if (newRef.value?.resetFields) {
    newRef.value.resetFields();
  }
};

const isUpdate = ref(false);
const res = ref();
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
        await addPicture(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await editPicture(form.value)
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
    getPicture(id).then(response => {
      form.value = response.data;
    });
  }
};

const fileList = ref([]);
// succuss 、error 在手动上传模式下不能触发钩子
const handleBeforeUpload = file => {
  loading.value = true;
  fileList.value = [file];
  let fileState = false;

  const idx = file.name.lastIndexOf(".");
  const type = file.name.substr(idx + 1);
  if (["emf", "jpg", "jpeg", "png"].indexOf(type) > -1) {
    fileState = true;
  } else {
    message("请上传emf/jpg/jpeg/png格式类型文件", {
      type: "error"
    });
    fileState = false;
    loading.value = false;
    return false;
  }
  return fileState;
};
const dialogVisible = ref(false);
const handleFileUpload = param => {
  debugger;
  const formData = new FormData();
  formData.append("file", param.file);
  uploadstaticImage(formData)
    .then(res => {
      if (res.code === 200) {
        form.value.imageUrl = `${VITE_API_PATH}/static/${res.data.staticPath}`;
        dialogVisible.value = true;
        message("资源上传成功！", {
          type: "success"
        });
        loading.value = false;
      }
    })
    .catch(err => {
      console.error(err);
    });
};

// const imgUrl = ref("");
const srcList = ref([]);

defineExpose({ showDrawer, isUpdate, setData });
</script>
