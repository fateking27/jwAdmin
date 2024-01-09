<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? `新增${typeName}信息` : `编辑${typeName}信息`"
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
      <el-form-item label="分类" prop="type">
        <el-select v-model="form.type" disabled>
          <el-option label="图片" value="0" />
          <el-option label="视频" value="1" />
          <el-option label="音频" value="2" />
        </el-select>
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
      <el-form-item label="排序" prop="orderNo">
        <el-input-number
          :min="0"
          :max="100"
          v-model="form.orderNo"
          placeholder="请输入排序"
        />
      </el-form-item>

      <el-form-item label="是否显示图片" prop="isShow">
        <el-radio-group v-model="form.isShow">
          <el-radio
            v-for="dict of sys_cover_status"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="`上传${typeName}`" prop="fileId">
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
          <img
            v-if="form.type && form.type === '0' && form.imageUrl"
            :src="form.imageUrl"
            class="avatar"
          />
          <el-icon v-else class="file-uploader">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item
        label="图片尺寸"
        prop="imageSize"
        v-if="form.type && form.type == '0'"
      >
        <el-input
          v-model="form.imageSize"
          placeholder="请输入图片尺寸例如(23*34)"
        />
      </el-form-item>
      <el-form-item
        label="视频分辨率"
        prop="videoSize"
        v-if="form.type && form.type == '1'"
      >
        <el-input
          v-model="form.videoSize"
          placeholder="请输入视频分辨率例如(1023*512)"
        />
      </el-form-item>
      <el-form-item
        label="时长"
        prop="time"
        v-if="form.type && (form.type == '2' || form.type == '1')"
      >
        <el-input v-model="form.time" placeholder="请输入时长秒" />
      </el-form-item>
      <el-form-item label="存储位置" prop="url">
        <el-input v-model="form.url" disabled />
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select v-model="form.state" disabled>
          <el-option label="被引用" value="1" />
          <el-option label="未被引用" value="0" />
        </el-select>
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
import { getFileInfo, uploadFile } from "@/api/wjx/file";
import { addMaterial, updateMaterial } from "@/api/wjx/material";
import { useDict } from "@/utils/useDict";
import { Plus } from "@element-plus/icons-vue";
import { cloneDeep } from "@pureadmin/utils";

const { VITE_API_PATH } = import.meta.env;
const { sys_cover_status } = useDict("sys_cover_status");

const newRef = ref();
const loading = ref(false);
//const deptOptions = ref([]);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    fileId: [{ required: true, message: "文件不能为空", trigger: "blur" }],
    title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
    isShow: [
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
    fileId: undefined,
    description: undefined,
    author: undefined,
    orderNo: 0,
    isShow: "1",
    imageUrl: undefined,
    type: undefined,
    imageSize: undefined,
    videoSize: undefined,
    time: undefined
  };
  fileList.value = [];
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
        // alert(form.value.author);
        await addMaterial(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateMaterial(form.value)
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

const setData = async (row, type) => {
  reset();
  form.value.type = type;
  if (!row) {
    isUpdate.value = false;
  } else {
    isUpdate.value = true;
    form.value = cloneDeep(row);
    const res = await getFileInfo(form.value.fileId);
    fileList.value.push({
      id: res.data.id,
      name: res.data.fileName
    });
    if (form.value.type == "0") {
      form.value.imageUrl = `${VITE_API_PATH}/static/${res.data.staticPath}`;
      console.log(res.data.staticPath);
    }
  }
};

const fileList = ref([]);
// succuss 、error 在手动上传模式下不能触发钩子
const handleBeforeUpload = file => {
  loading.value = true;
  return true;
};
const dialogVisible = ref(false);
const handleFileUpload = param => {
  const formData = new FormData();
  formData.append("file", param.file);
  uploadFile(formData)
    .then(res => {
      if (res.code === 200) {
        form.value.imageUrl = `${VITE_API_PATH}/static/${res.data.staticPath}`;
        form.value.fileId = res.data.id;
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

const typeName = computed(() => {
  if (form.value.type == "0") {
    return "图片";
  } else if (form.value.type == "1") {
    return "视频";
  } else if (form.value.type == "2") {
    return "音频";
  } else {
    return "";
  }
});

defineExpose({ showDrawer, isUpdate, setData });
</script>
<style lang="scss" scoped>
.file-uploader {
  width: 150px;
  height: 150px;
  padding: 0;
}
</style>
