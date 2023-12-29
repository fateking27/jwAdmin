<template>
  <el-text>这是栏目</el-text>
  <el-form
    ref="searchFormRef"
    :inline="true"
    :model="form"
    class="bg-bg_color w-[99/100] pl-8 pt-4"
  >
    <el-form-item>
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          :start-placeholder="form.beginDay"
          :end-placeholder="form.endDay"
          @change="SearchData(dateRange)"
        />
      </el-form-item>
      <el-button
        type="primary"
        :icon="useRenderIcon(Search)"
        :loading="loading"
        @click="SearchData(dateRange)"
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
        name="文章列表"
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
    <div id="chart" ref="chart" style="width: 600px; height: 400px" />
  </el-tabs>
  <Form ref="formRef" @reload="onSearch" />
</template>

<script setup lang="ts">
import { listBrowse, listArticle } from "@/api/Browse/browse";
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
  name: "TypeArticle"
});

const dateRange = ref();

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
  //获取近一个月的新闻信息
  const { rows } = await listArticle();
  dataList.value = rows;
  // renderChart();
  // renderPieChart();
  loading.value = false;
}

const SearchData = async (dateRange?) => {
  if (!dateRange) {
    message("请选择时间范围", {
      type: "warning"
    });
    return;
  }
  loading.value = true;
  console.log("beginDay:", dateRange[0], "endDay:", dateRange[1]);
  const res = await listBrowse({
    beginDay: dateRange[0],
    endDay: dateRange[1]
  });

  dataList.value = res.rows;
  loading.value = false;

  console.log("rows", res);
};

//获取近一个月的新闻信息
//获取近一个月所有文章信息
onMounted(() => {
  form.endDay = dayjs().format("YYYY-MM-DD");
  form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  onSearch();

  // 创建柱形图
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: "bar"
      }
    ]
  };
  myChart.setOption(option);
});
</script>
