<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      v-if="dialogVisible"
      title="素材预览"
      width="60%"
      :before-close="handleClose"
    >
      <div>
        <div v-if="data.type === '0'">
          <el-image :src="data.file.url">
            <template #error>
              <div class="image-slot">
                <el-icon>
                  <icon-picture />
                </el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div v-if="data.type === '1'">
          <video :src="data.file.url" autoplay />
        </div>
        <div v-if="data.type === '2'">
          <audio controls autoplay>
            <source :src="data.file.url" />
          </audio>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";

const dialogVisible = ref(false);
const data = ref();
const showMaterial = async row => {
  data.value = row;
  dialogVisible.value = true;
  console.log(data.value);
};

const handleClose = () => {
  dialogVisible.value = false;
};

defineExpose({ showMaterial });
</script>
