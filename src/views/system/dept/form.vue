<template>
  <el-drawer
    v-model="showDrawer"
    :title="!isUpdate ? '新增部门' : '编辑部门'"
    :before-close="handleDrawerClose"
    size="520px"
  >
    <el-form label-width="110px" ref="deptRef" :rules="rules" :model="form">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="form.deptName" placeholder="请输入部门名称" />
      </el-form-item>

      <el-form-item label="上级部门" prop="parentId" v-if="form.parentId !== 0">
        <el-tree-select
          v-model="form.parentId"
          :data="deptOptions"
          :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
          value-key="deptId"
          placeholder="选择上级部门"
          check-strictly
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="负责人" prop="leader">
        <el-input
          v-model="form.leader"
          placeholder="请输入负责人"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入联系电话"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="部门状态">
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
        <el-button type="primary" :loading="loading" @click="onSubmit(deptRef)"
          >提交</el-button
        >
        <el-button @click="handleDrawerClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import { ref, reactive, toRefs } from "vue";
import { message } from "@/utils/message";
import { handleTree } from "@pureadmin/utils";
import {
  addDept,
  getDept,
  listDept,
  listDeptExcludeChild,
  updateDept
} from "@/api/system/dept";
import { useDict } from "@/utils/useDict";

const { sys_normal_disable } = useDict("sys_normal_disable");

const deptRef = ref();
const loading = ref(false);
const deptOptions = ref([]);
const showDrawer = ref(false);

const data = reactive({
  form: {} as any,
  rules: {
    parentId: [
      { required: true, message: "上级部门不能为空", trigger: "blur" }
    ],
    deptName: [
      { required: true, message: "部门名称不能为空", trigger: "blur" }
    ],
    orderNum: [
      { required: true, message: "显示排序不能为空", trigger: "blur" }
    ],
    email: [
      {
        type: "email",
        message: "请输入正确的邮箱地址",
        trigger: ["blur", "change"]
      }
    ],
    phone: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur"
      }
    ]
  } as any
});

const { form, rules } = toRefs(data);

/** 表单重置 */
const reset = () => {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  };
  if (deptRef.value?.resetFields) {
    deptRef.value.resetFields();
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
      if (!isUpdate.value) {
        await addDept(form.value)
          .then(() => {
            message("新增成功", {
              type: "success"
            });
          })
          .catch(() => {
            loading.value = false;
          });
      } else {
        await updateDept(form.value)
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

const setData = row => {
  reset();
  if (!isUpdate.value) {
    listDept().then(response => {
      deptOptions.value = handleTree(response.data, "deptId");
    });
    if (row != undefined) {
      form.value.parentId = row.deptId;
    }
  } else {
    getDept(row.deptId).then(response => {
      form.value = response.data;
      listDeptExcludeChild(row.deptId).then(response => {
        deptOptions.value = handleTree(response.data, "deptId");
        if (deptOptions.value.length == 0) {
          const noResultsOptions = {
            deptId: form.value.parentId,
            deptName: form.value.parentName,
            children: []
          };
          deptOptions.value.push(noResultsOptions);
        }
      });
    });
  }
};

defineExpose({ showDrawer, isUpdate, setData });
</script>
