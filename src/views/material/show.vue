<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="Tips"
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
          <audio-player ref="audioRef" :fileurl="data.file.url" />
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
import { onUnmounted, ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";
import AudioPlayer from "./audio.vue";
const dialogVisible = ref(false);
const data = ref();
const audioRef = ref();
const showMaterial = async row => {
  data.value = row;
  dialogVisible.value = true;
  console.log(data.value);
};

defineExpose({ showMaterial });
</script>
