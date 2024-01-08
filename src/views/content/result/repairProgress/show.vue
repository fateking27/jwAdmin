<template>
  <el-dialog
    v-model="dialogVisible"
    v-if="dialogVisible"
    title="文章预览"
    width="70%"
    :before-close="handleClose"
  >
    <el-descriptions :column="1">
      <el-descriptions-item label="文章标题：">{{
        data.value.title
      }}</el-descriptions-item>
      <el-descriptions-item label="文章封面：">
        <el-image :src="data.value.coverMaterialUrl" />
      </el-descriptions-item>
      <el-descriptions-item label="来源：">{{
        data.value.source
      }}</el-descriptions-item>
      <el-descriptions-item label="作者："
        >{{ data.value.author }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间："
        >{{ data.value.releaseTime }}
      </el-descriptions-item>
      <el-descriptions-item label="文章内容：">
        <div v-html="data.value.content" />
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const dialogVisible = ref(false);
const data = ref();
const showProgress = async row => {
  data.value = row;
  dialogVisible.value = true;
  console.log(data.value);
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showProgress });
</script>
