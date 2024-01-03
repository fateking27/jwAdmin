<template>
  <div>
    <div style="padding: 10px; border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        style="height: 500px; overflow-y: hidden"
        v-model="content"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
    <el-dialog title="素材选择" v-model="materialDialogShow">
      <el-form :model="form">
        <el-form-item label="素材" prop="materialId">
          <el-select
            v-model="form.materialId"
            filterable
            placeholder="请选择素材"
          >
            <el-option-group
              v-for="group in options"
              :key="group.type"
              :label="group.name"
            >
              <el-option
                v-for="item in group.list"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="materialDialogShow = false">取消</el-button>
          <el-button type="primary" @click="submitMaterial">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { Boot, IDomEditor, IToolbarConfig } from "@wangeditor/editor";
import MaterialMenu from "@/components/SuperEditor/MaterialMenu";
import { getMaterialTree } from "@/api/wjx/material";
const { VITE_API_PATH } = import.meta.env;
const editorRef = ref();
const mode = ref("default");
const materialDialogShow = ref(false);
const form = reactive({
  materialId: ""
});
const options = ref([]);
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["group-image", "group-video"]
};
const editorConfig = { placeholder: "请输入内容..." };
const handleCreated = async editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  registerMenu(editorRef.value, toolbarConfig);
  await initMaterialTree();
  initMaterialMenuEvent();
};

const registerMenu = (
  editor: IDomEditor,
  toolbarConfig: Partial<IToolbarConfig>
) => {
  //获取所有已注册的菜单
  const allRegisterMenu = editor.getAllMenuKeys();
  Boot.registerMenu({
    key: "MaterialMenu",
    factory() {
      return new MaterialMenu();
    }
  });
  toolbarConfig.insertKeys = {
    index: 22,
    keys: ["MaterialMenu"]
  };
};

const materialMap = new Map();
const initMaterialTree = async () => {
  const res = await getMaterialTree();
  options.value = res.data;
  for (let i = 0; i < options.value.length; i++) {
    for (let j = 0; j < options.value[i].list.length; j++) {
      materialMap.set(options.value[i].list[j].id, options.value[i].list[j]);
    }
  }
};
const initMaterialMenuEvent = () => {
  editorRef.value.on("MaterialMenuClick", () => {
    materialDialogShow.value = true;
  });
};

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();
const content = computed({
  get: () => props.modelValue,
  set: value => {
    emit("update:modelValue", value);
  }
});
const submitMaterial = () => {
  if (form.materialId) {
    const material = materialMap.get(form.materialId);
    if (material) {
      if (material.type == "0") {
        editorRef.value.insertNode({
          type: "image",
          src: `${VITE_API_PATH}/static/${material.url}`,
          children: [
            {
              text: ""
            }
          ]
        });
      } else if (material.type == "1") {
        editorRef.value.insertNode({
          type: "video",
          src: `${VITE_API_PATH}/static/${material.url}`,
          poster: "",
          children: [
            {
              text: ""
            }
          ]
        });
      }
    }
  }
  materialDialogShow.value = false;
};
</script>
