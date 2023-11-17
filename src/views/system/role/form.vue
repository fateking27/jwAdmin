<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增角色' : '编辑角色'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="roleRef" :rules="rules" :model="form">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item prop="roleKey">
        <template #label>
          <div class="flex-c">
            <el-tooltip
              content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
              placement="top"
            >
              <iconifyIconOffline
                :icon="questionFilled"
                class="cursor-pointer text-[16px] text-[--el-color-warning]"
              />
            </el-tooltip>
            <div class="ml-0.5">权限字符</div>
          </div>
        </template>
        <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
      </el-form-item>

      <el-form-item label="角色顺序" prop="roleSort">
        <el-input-number
          v-model="form.roleSort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict of sys_normal_disable"
            :key="dict.value"
            :label="dict.value"
            >{{ dict.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单权限">
        <el-checkbox
          v-model="menuExpand"
          @change="handleCheckedTreeExpand($event, 'menu')"
          >展开/折叠</el-checkbox
        >
        <el-checkbox
          v-model="menuNodeAll"
          @change="handleCheckedTreeNodeAll($event, 'menu')"
          >全选/全不选</el-checkbox
        >
        <el-checkbox
          v-model="form.menuCheckStrictly"
          @change="handleCheckedTreeConnect($event, 'menu')"
          >父子联动</el-checkbox
        >
        <el-tree
          class="tree-border"
          :data="menuOptions"
          show-checkbox
          ref="menuRef"
          node-key="id"
          :check-strictly="!form.menuCheckStrictly"
          empty-text="加载中，请稍候"
          :props="{ label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(roleRef)"
          >提交</el-button
        >
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import {
  roleMenuTreeselect,
  treeselect as menuTreeselect
} from "@/api/system/menu";
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs, nextTick } from "vue";
import { message } from "@/utils/message";

import questionFilled from "@iconify-icons/ep/question-filled";
import { addRole, updateRole, getRole } from "@/api/system/role";
import { useDict } from "@/utils/useDict";

const { sys_normal_disable } = useDict("sys_normal_disable");

const roleRef = ref();
const loading = ref(false);
const showDrawer = ref(false);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuRef = ref();

const data = reactive({
  form: {} as any,
  rules: {
    roleName: [
      { required: true, message: "角色名称不能为空", trigger: "blur" }
    ],
    roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
    roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }]
  }
});

const { form, rules } = toRefs(data);

/** 查询菜单树结构 */
const getMenuTreeselect = () => {
  menuTreeselect().then(response => {
    menuOptions.value = response.data;
  });
};

/** 根据角色ID查询菜单树结构 */
const getRoleMenuTreeselect = roleId => {
  return roleMenuTreeselect(roleId).then(response => {
    menuOptions.value = response.data.menus;
    return response;
  });
};

/** 树权限（展开/折叠）*/
const handleCheckedTreeExpand = (value, type) => {
  if (type == "menu") {
    const treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
};
/** 树权限（全选/全不选） */
const handleCheckedTreeNodeAll = (value, type) => {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  }
};
/** 树权限（父子联动） */
const handleCheckedTreeConnect = (value, type) => {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  }
};
/** 所有菜单节点数据 */
const getMenuAllCheckedKeys = () => {
  // 目前被选中的菜单节点
  const checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  const halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  // eslint-disable-next-line prefer-spread
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
};

/** 表单重置 */
const reset = () => {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: "0",
    menuIds: [],
    menuCheckStrictly: true,
    remark: undefined
  };
  if (roleRef.value?.resetFields) {
    roleRef.value.resetFields();
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
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      form.value.menuIds = getMenuAllCheckedKeys();
      if (!isUpdate.value) {
        await addRole(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateRole(form.value)
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
  if (!row) {
    getMenuTreeselect();
    isUpdate.value = false;
  } else {
    isUpdate.value = true;
    const roleId = row.roleId;
    const roleMenu = getRoleMenuTreeselect(roleId);
    getRole(roleId).then(response => {
      form.value = response.data;
      form.value.roleSort = Number(form.value.roleSort);
      nextTick(() => {
        roleMenu.then(res => {
          const checkedKeys = res.data.checkedKeys;
          checkedKeys.forEach(v => {
            nextTick(() => {
              menuRef.value.setChecked(v, true, false);
            });
          });
        });
      });
    });
  }
};

defineExpose({ showDrawer, setData });
</script>
