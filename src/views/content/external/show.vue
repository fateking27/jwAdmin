<template>
  <el-dialog
    v-model="dialogVisible"
    v-if="dialogVisible"
    title="服务预览"
    width="70%"
    :before-close="handleClose"
  >
    <el-descriptions :column="1">
      <el-descriptions-item label="图层名称：">{{
        data.value.title
      }}</el-descriptions-item>
      <el-descriptions-item label="投影类型：">
        {{ data.value.type }}
      </el-descriptions-item>
      <el-descriptions-item label="缩略图：">
        {{ data.value.url }}
      </el-descriptions-item>
      <el-descriptions-item label="来源：">{{
        data.value.source
      }}</el-descriptions-item>
      <el-descriptions-item label="作者：">{{
        data.value.author
      }}</el-descriptions-item>
      <el-descriptions-item label="发布时间：">{{
        data.value.releaseTime
      }}</el-descriptions-item>
      <el-descriptions-item label="服务地址："
        >{{ data.value.content }}
      </el-descriptions-item>
    </el-descriptions>
    <div>
      <div>缩略图预览：</div>
      <el-image :src="`${VITE_API_PATH}/static/` + data.value.url" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const { VITE_API_PATH } = import.meta.env;

const dialogVisible = ref(false);
const data = ref();
const showService = async row => {
  data.value = row;
  dialogVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showService });
</script>
