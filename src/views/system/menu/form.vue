<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增菜单' : '编辑菜单'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="130px" ref="menuRef" :rules="rules" :model="form">
      <el-form-item label="上级菜单">
        <el-tree-select
          v-model="form.parentId"
          :data="menuOptions"
          :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
          value-key="menuId"
          placeholder="选择上级菜单"
          check-strictly
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="form.menuType">
          <el-radio-button label="M">目录</el-radio-button>
          <el-radio-button label="C" :disabled="form.parentId === 0"
            >菜单</el-radio-button
          >
          <el-radio-button label="F" :disabled="form.parentId === 0"
            >按钮</el-radio-button
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单图标" prop="icon" v-if="form.menuType != 'F'">
        <!--        <div class="flex-bc">-->
        <!--          <IconSelect v-model="form.icon" />-->
        <!--          <iconifyIconOffline-->
        <!--            :icon="deleteIcon"-->
        <!--            class="text-danger cursor-pointer ml-1.5 text-[18px]"-->
        <!--            @click="form.icon = undefined"-->
        <!--          />-->
        <!--        </div>-->
        <IconSelect v-model="form.icon" />
      </el-form-item>

      <el-form-item v-if="form.menuType != 'F'">
        <template #label>
          <div class="flex-c">
            <el-tooltip content="选择是否新窗口打开外链" placement="top">
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">新窗口</div>
          </div>
        </template>
        <el-radio-group v-model="form.isFrame">
          <el-radio label="0">是</el-radio>
          <el-radio label="1">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="path" v-if="form.menuType != 'F'">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">路由地址</div>
          </div>
        </template>
        <el-input v-model="form.path" placeholder="请输入路由地址" />
      </el-form-item>

      <el-form-item prop="component" v-if="form.menuType == 'C'">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">组件路径</div>
          </div>
        </template>
        <el-input v-model="form.component" placeholder="请输入组件路径" />
      </el-form-item>

      <el-form-item v-if="form.menuType != 'M'">
        <el-input
          v-model="form.perms"
          placeholder="请输入权限标识"
          maxlength="100"
        />
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="控制器中定义的权限字符，如：@SaCheckPermission('system:user:list')"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">权限字符</div>
          </div>
        </template>
      </el-form-item>

      <el-form-item v-if="form.menuType == 'C'">
        <el-input
          v-model="form.queryParam"
          placeholder="请输入路由参数"
          maxlength="255"
        />
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">路由参数</div>
          </div>
        </template>
      </el-form-item>

      <el-form-item v-if="form.menuType == 'C'">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和路由地址最后字母保持一致"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">是否缓存</div>
          </div>
        </template>
        <el-radio-group v-model="form.isCache">
          <el-radio label="0">缓存</el-radio>
          <el-radio label="1">不缓存</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.menuType != 'F'">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">显示状态</div>
          </div>
        </template>
        <el-radio-group v-model="form.visible">
          <el-radio
            v-for="dict of sys_show_hide"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.menuType != 'F'">
        <template #label>
          <div class="flex-c">
            <el-tooltip content="选择隐藏则菜单父级目录不显示" placement="top">
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">显示父级菜单</div>
          </div>
        </template>
        <el-radio-group v-model="form.showParent">
          <el-radio :label="true">显示</el-radio>
          <el-radio :label="false">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.menuType != 'F'">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="选择停用则路由将不会出现在侧边栏，也不能被访问"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="text-[--el-color-warning] cursor-pointer text-[16px]"
              />
            </el-tooltip>
            <div class="ml-0.5">菜单状态</div>
          </div>
        </template>
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict of sys_normal_disable"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item label="显示排序" prop="orderNum">
        <el-input-number
          v-model="form.orderNum"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(menuRef)"
          >提交</el-button
        >
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { listMenu, addMenu, updateMenu, getMenu } from "@/api/system/menu";
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs } from "vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import IconSelect from "@/components/ReIcon/src/iconSelect.vue";
import questionFilled from "@iconify-icons/ep/question-filled";
// import deleteIcon from "@iconify-icons/ep/delete";
import { useDict } from "@/utils/useDict";

const { sys_show_hide, sys_normal_disable } = useDict(
  "sys_show_hide",
  "sys_normal_disable"
);

const loading = ref(false);
const menuRef = ref<FormInstance>();
const showDrawer = ref(false);
const menuOptions = ref([]);

const data = reactive({
  form: {} as any,
  rules: {
    menuName: [
      { required: true, message: "菜单名称不能为空", trigger: "blur" }
    ],
    orderNum: [
      { required: true, message: "菜单顺序不能为空", trigger: "blur" }
    ],
    path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

const getTreeselect = () => {
  menuOptions.value = [];
  listMenu().then(response => {
    const menu = { menuId: 0, menuName: "主类目", children: [] };
    menu.children = handleTree(response.data, "menuId");
    menuOptions.value.push(menu);
  });
};

/** 表单重置 */
const reset = () => {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "1",
    isCache: "1",
    visible: "0",
    status: "0",
    showParent: true
  };
  if (menuRef.value?.resetFields) {
    menuRef.value.resetFields();
  }
};

const isUpdate = ref(false);

const handleDrawerClose = () => {
  reset();
  showDrawer.value = false;
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  if (form.value.menuType === "M") {
    // 目录路径前缀不能出现/
    if (form.value.path.charAt(0) === "/") {
      form.value.path = form.value.path.substring(1);
    }
  }
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (!isUpdate.value) {
        await addMenu(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateMenu(form.value)
          .then(() => {
            message("修改成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      }

      handleDrawerClose();
      emit("reload");
      loading.value = false;
    } else {
      loading.value = false;
      return fields;
    }
  });
};

const emit = defineEmits<{
  (e: "reload"): void;
}>();

const setData = async row => {
  reset();
  await getTreeselect();
  if (!isUpdate.value) {
    if (row != null && row.menuId) {
      form.value.parentId = row.menuId;
    } else {
      form.value.parentId = 0;
    }
  } else {
    getMenu(row.menuId).then(response => {
      form.value = response.data;
    });
  }
};

defineExpose({ showDrawer, isUpdate, setData });
</script>
