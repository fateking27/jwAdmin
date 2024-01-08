<template>
  <el-dialog
    v-model="dialogVisible"
    v-if="dialogVisible"
    title="新闻预览"
    width="70%"
    :before-close="handleClose"
  >
    <el-descriptions :column="1">
      <el-descriptions-item label="新闻标题：">{{
        data.value.name
      }}</el-descriptions-item>
      <el-descriptions-item label="新闻封面：">
        <el-image :src="data.value.coverMaterialUrl" />
      </el-descriptions-item>
      <el-descriptions-item label="新闻类别：">{{
        data.value.type
      }}</el-descriptions-item>
      <el-descriptions-item label="来源：">{{
        data.value.source
      }}</el-descriptions-item>
      <el-descriptions-item label="新闻标签：">{{
        data.value.mark
      }}</el-descriptions-item>
      <el-descriptions-item label="新闻摘要：">{{
        data.value.brief
      }}</el-descriptions-item>
      <el-descriptions-item label="作者："
        >{{ data.value.author }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间："
        >{{ data.value.releaseTime }}
      </el-descriptions-item>
      <el-descriptions-item label="新闻内容：">
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
const showNew = async row => {
  data.value = row;
  dialogVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showNew });
</script>
