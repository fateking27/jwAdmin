<template>
  <el-text>这是标题</el-text>
  <el-form
    ref="searchFormRef"
    :inline="true"
    :model="form"
    class="bg-bg_color w-[99/100] pl-8 pt-4"
  >
    <el-form-item>
      <el-form-item label="栏目" prop="type">
        <el-select multiple placeholder="Select">
          <el-option
            v-for="item in articleTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标题" prop="title">
        <el-select multiple placeholder="Select">
          <el-option
            v-for="item in titles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          :start-placeholder="form.beginDay"
          :end-placeholder="form.endDay"
          @change="onSearch"
        />
      </el-form-item>
      <el-button
        type="primary"
        :icon="useRenderIcon(Search)"
        :loading="loading"
        @click="onSearch"
      >
        搜索
      </el-button>
      <el-button
        :icon="useRenderIcon(Refresh)"
        @click="resetForm(searchFormRef)"
      >
        重置
      </el-button>
    </el-form-item>
  </el-form>

  <el-tabs type="border-card">
    <el-tab-pane label="表格">
      <PureTableBar
        title="文章列表"
        :tableRef="tableRef?.getTableRef()"
        :columns="columns"
        @refresh="onSearch"
      >
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            border
            align-whole="center"
            showOverflowTooltip
            default-expand-all
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :header-cell-style="{
              background: 'var(--el-table-row-hover-bg-color)',
              color: 'var(--el-text-color-primary)'
            }"
            row-key="id"
            adaptive
          />
        </template>
      </PureTableBar>
    </el-tab-pane>

    <el-tab-pane label="图表" />
  </el-tabs>

  <Form ref="formRef" @reload="onSearch" />
</template>

<script setup lang="ts">
import { newCount, listArticle } from "@/api/Browse/browse";
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Cancel from "@iconify-icons/ep/circle-close";
import { useDict } from "@/utils/useDict";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { PaginationProps } from "@pureadmin/table";

defineOptions({
  name: "TitleArticle",
  watch: {
    selectedArticleType(newValue, oldValue) {
      // 根据选中的栏目类型获取标题选项
      this.getTitlesByArticleType(newValue);
    }
  }
});

const tableRef = ref();
const searchFormRef = ref();
const formRef = ref();
const Ids = ref([]);
const multiple = ref(true);
const form = reactive({
  articleType: [],
  title: [],
  orderByColumn: undefined,
  isAsc: undefined,
  beginDay: "",
  endDay: ""
  // pageNum: pagination.currentPage,
  // pageSize: pagination.pageSize,
});

// const defaultDate = reactive( {
//   endDay:"",
//   beginDay:"",
//   date:""
// });

const dataList = ref([]);
const loading = ref(true);

const columns: TableColumnList = [
  {
    type: "selection",
    width: 55,
    align: "left",
    reserveSelection: true
  },
  {
    label: "栏目类型",
    prop: "articleTypeName",
    width: 120
  },
  {
    label: "文章名称",
    prop: "title",
    align: "left",
    minWidth: 120
  },
  {
    label: "总浏览次数",
    prop: "viewCount",
    width: 120,
    slot: "type"
  }
];

const handleUpdate = row => {
  formRef.value.isUpdate = true;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

function resetForm(formEl) {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
}

async function onSearch() {
  loading.value = true;
  //获取近一个月所有文章信息
  const { rows } = await listArticle(form);
  dataList.value = rows;
  // renderChart();
  // renderPieChart();
  loading.value = false;
}

// async function getTitlesByArticleType(articleType) {
//   // 根据栏目类型获取标题选项
//   const { rows } = await listArticle(articleType);
//   this.titles = rows;
// }

// async function getTitleOptionsByArticleType(articleType) {
//   // 根据栏目类型获取标题选项
//   const { rows } = await getTitleOptionsByArticleType(articleType);
//   return rows;
// }

onMounted(() => {
  form.endDay = dayjs().format("YYYY-MM-DD");
  form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  onSearch();
});
</script>
