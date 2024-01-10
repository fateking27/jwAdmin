<template>
  <el-drawer
    v-model="dialogVisible"
    title="文章预览"
    size="1050px"
    :before-close="handleClose"
  >
    <el-form label-width="110px" :column="1">
      <el-form-item label="图层名称">
        <el-text class="textBorder"> {{ data.value.title }}</el-text>
      </el-form-item>
      <el-form-item label="文章缩略图">
        <el-image :src="`${VITE_API_PATH}/static/` + data.value.url" />
      </el-form-item>
      <el-form-item label="来源">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.source }"
        >
          {{ data.value.source }}
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
      <el-form-item label="服务地址">
        <el-text class="textBorder">
          {{ data.value.content }}
        </el-text>
      </el-form-item>
    </el-form>
    <el-button @click="handleClose">关闭</el-button>
  </el-drawer>
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
