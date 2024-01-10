<template>
  <el-drawer
    v-model="dialogVisible"
    title="文章预览"
    size="1050px"
    :before-close="handleClose"
  >
    <el-form label-width="110px" :column="1">
      <el-form-item label="文章标题">
        <el-text class="textBorder"> {{ data.value.title }}</el-text>
      </el-form-item>
      <el-form-item label="文章封面">
        <el-image
          :src="`${VITE_API_PATH}/static/` + data.value.coverMaterialUrl"
        />
      </el-form-item>
      <el-form-item label="索引号">
        <el-text class="textBorder">
          {{ data.value.code }}
        </el-text>
      </el-form-item>
      <el-form-item label="分类">
        <el-text class="textBorder">
          {{ data.value.type }}
        </el-text>
      </el-form-item>
      <el-form-item label="文号">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.article_no }"
        >
          {{ data.value.article_no }}
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
      <el-form-item label="发布机构">
        <el-text
          class="textBorder"
          :class="{ emptyBorder: !data.value.promulgator }"
        >
          {{ data.value.promulgator }}
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
      <el-form-item label="文章内容">
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
const showIntroduce = async row => {
  data.value = row;
  dialogVisible.value = true;
  console.log(data.value);
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showIntroduce });
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
