<template>
  <el-drawer
    v-model="dialogVisible"
    title="新闻预览"
    size="1050px"
    :before-close="handleClose"
  >
    <el-form label-width="110px" :column="1">
      <el-form-item label="新闻标题">
        <el-text class="textBorder"> {{ data.value.name }}</el-text>
      </el-form-item>
      <el-form-item label="新闻封面">
        <el-image
          :src="`${VITE_API_PATH}/static/` + data.value.coverMaterialUrl"
        />
      </el-form-item>
      <el-form-item label="新闻类别">
        <el-text class="textBorder">
          {{ data.value.type }}
        </el-text>
      </el-form-item>
      <el-form-item label="来源">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.source }"
        >
          {{ data.value.source }}
        </el-text>
      </el-form-item>
      <el-form-item label="新闻标签">
        <el-text class="textBorder" :class="{ emptyBorder: !data.value.mark }">
          {{ data.value.mark }}
        </el-text>
      </el-form-item>
      <el-form-item label="新闻摘要">
        <el-text class="textBorder" :class="{ emptyBorder: !data.value.brief }">
          {{ data.value.brief }}
        </el-text>
      </el-form-item>
      <el-form-item label="作者">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.author }"
        >
          {{ data.value.author }}
        </el-text>
      </el-form-item>
      <el-form-item label="发布时间">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.releaseTime }"
          >{{ data.value.releaseTime }}
        </el-text>
      </el-form-item>
      <el-form-item label="新闻内容">
        <el-text class="textBorder">
          <div v-html="data.value.content" />
        </el-text>
      </el-form-item>
    </el-form>
    <el-button @click="handleClose">关闭</el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
const dialogVisible = ref(false);
const data = ref();
const { VITE_API_PATH } = import.meta.env;
const showNew = async row => {
  data.value = row;
  dialogVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
};
defineExpose({ showNew });
</script>

<style scoped>
.textBorder {
  width: 950px;
  padding-left: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.emptyBorder {
  width: 950px;
  height: 33px; /* 调整空白边框的高度 */
  padding-left: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
