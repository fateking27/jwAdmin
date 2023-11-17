<template>
  <el-drawer
    v-model="showDrawer"
    title="分配数据权限"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="roleRef" :model="form">
      <el-form-item label="角色名称" prop="roleName">
        <div class="font-medium">{{ form.roleName }}</div>
      </el-form-item>

      <el-form-item label="权限字符">
        <div class="font-medium">{{ form.roleKey }}</div>
      </el-form-item>

      <el-form-item label="权限范围">
        <el-select
          v-model="form.dataScope"
          @change="dataScopeSelectChange"
          class="w-full"
        >
          <el-option
            v-for="item of dataScopeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数据权限" v-show="form.dataScope == 2">
        <el-checkbox
          v-model="deptExpand"
          @change="handleCheckedTreeExpand($event, 'dept')"
          >展开/折叠</el-checkbox
        >
        <el-checkbox
          v-model="deptNodeAll"
          @change="handleCheckedTreeNodeAll($event, 'dept')"
          >全选/全不选</el-checkbox
        >
        <el-checkbox
          v-model="form.deptCheckStrictly"
          @change="handleCheckedTreeConnect($event, 'dept')"
          >父子联动</el-checkbox
        >
        <el-tree
          class="tree-border"
          :data="deptOptions"
          show-checkbox
          default-expand-all
          ref="deptRef"
          node-key="id"
          :check-strictly="!form.deptCheckStrictly"
          empty-text="加载中，请稍候"
          :props="{ label: 'label', children: 'children' }"
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
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs, nextTick } from "vue";

import { dataScope, deptTreeSelect, getRole } from "@/api/system/role";
import { message } from "@/utils/message";

const roleRef = ref();
const loading = ref(false);
const showDrawer = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const deptRef = ref();

const data = reactive({
  form: {} as any
});

const { form } = toRefs(data);

/** 数据范围选项*/
const dataScopeOptions = ref([
  { value: "1", label: "全部数据权限" },
  { value: "2", label: "自定数据权限" },
  { value: "3", label: "本部门数据权限" },
  { value: "4", label: "本部门及以下数据权限" },
  { value: "5", label: "仅本人数据权限" }
]);

/** 选择角色权限范围触发 */
const dataScopeSelectChange = value => {
  if (value !== "2") {
    deptRef.value.setCheckedKeys([]);
  }
};

/** 根据角色ID查询部门树结构 */
const getDeptTree = roleId => {
  return deptTreeSelect(roleId).then(response => {
    deptOptions.value = response.data.depts;
    return response;
  });
};

/** 树权限（展开/折叠）*/
const handleCheckedTreeExpand = (value, type) => {
  if (type == "dept") {
    const treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
};
/** 树权限（全选/全不选） */
const handleCheckedTreeNodeAll = (value, type) => {
  if (type == "dept") {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
};

/** 树权限（父子联动） */
const handleCheckedTreeConnect = (value, type) => {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  } else if (type == "dept") {
    form.value.deptCheckStrictly = value ? true : false;
  }
};

/** 所有部门节点数据 */
const getDeptAllCheckedKeys = () => {
  // 目前被选中的部门节点
  const checkedKeys = deptRef.value.getCheckedKeys();
  // 半选中的部门节点
  const halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  // eslint-disable-next-line prefer-spread
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
};

/** 表单重置 */
const reset = () => {
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = {
    roleName: undefined,
    roleKey: undefined,
    deptIds: [],
    deptCheckStrictly: true
  };
  if (roleRef.value?.resetFields) {
    roleRef.value.resetFields();
  }
};

const handleDrawerClose = () => {
  reset();
  showDrawer.value = false;
};

const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (form.value.roleId != undefined) {
        form.value.deptIds = getDeptAllCheckedKeys();
        await dataScope(form.value)
          .then(() => {
            message("修改成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
        handleDrawerClose();
        emit("reload");
        loading.value = false;
      }
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
  const deptTreeSelect = getDeptTree(row.roleId);
  getRole(row.roleId).then(response => {
    form.value = response.data;
    openDataScope.value = true;
    nextTick(() => {
      deptTreeSelect.then(res => {
        nextTick(() => {
          if (deptRef.value) {
            deptRef.value.setCheckedKeys(res.data.checkedKeys);
          }
        });
      });
    });
  });
};

defineExpose({ showDrawer, setData });
</script>
