<template>
  <el-drawer
    v-model="dialogVisible"
    title="文章预览"
    size="1050px"
    :before-close="handleClose"
  >
    <el-form label-width="110px" :column="1">
      <el-form-item label="分级">
        <el-text class="textBorder"> {{ data.value.rank }}</el-text>
      </el-form-item>
      <el-form-item label="现状">
        <el-text class="textBorder">
          {{ data.value.ecologicalStatus }}
        </el-text>
      </el-form-item>
      <el-form-item label="功能">
        <el-text class="textBorder">
          {{ data.value.fun }}
        </el-text>
      </el-form-item>
      <el-form-item label="模块">
        <el-text class="textBorder">
          {{ data.value.module }}
        </el-text>
      </el-form-item>
      <el-form-item label="成果图片">
        <el-image
          v-for="(item, index) of data.value.achievementMaterialUrl"
          :key="index"
          :src="item"
        />
      </el-form-item>
    </el-form>
    <el-button @click="handleClose">关闭</el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
// const { VITE_API_PATH } = import.meta.env;
const dialogVisible = ref(false);
const data = ref();

const showCurrent = async row => {
  data.value = row;
  dialogVisible.value = true;
  console.log(data.value.achievementMaterialUrl);
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showCurrent });
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
