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
    <div id="chart" style="width: 600px; height: 400px" />
    <div id="pie-chart" style="width: 400px; height: 400px" />
  </el-tabs>
  <Form ref="formRef" @reload="onSearch" />
</template>

<script setup lang="ts">
import { listArticle, listBrowse } from "@/api/Browse/browse";
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
import * as echarts from "echarts";

defineOptions({
  name: "TypeArticle"
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
  beginDay: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
  endDay: dayjs().format("YYYY-MM-DD")
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
const dateRange = ref();

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

function renderChart() {
  // 获取后台数据，假设数据为articles
  console.log(dataList.value);
  const articles = [
    { title: "文章1", views: 100 },
    { title: "文章2", views: 200 },
    { title: "文章3", views: 150 }
    // ...
  ];
  // 获取文章标题和浏览量
  const titles = dataList.value.map(item => item.title);
  const views = dataList.value.map(item => item.viewCount);
  // console.log(titles,views)
  // const titles = articles.map((item) => item.title);
  // const views =  articles.map((item) => item.views);
  // 创建柱形图实例
  const chart = echarts.init(document.getElementById("chart"));

  // 配置柱形图的选项
  const options = {
    title: {
      text: "文章浏览量统计"
    },
    xAxis: {
      type: "category",
      data: titles
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: views,
        type: "bar"
      }
    ]
  };

  // 使用配置项渲染柱形图
  chart.setOption(options);
}

function renderPieChart() {
  // 获取后台数据，假设数据为articles
  const articles = [
    { title: "文章1", views: 100 },
    { title: "文章2", views: 200 },
    { title: "文章3", views: 150 }
    // ...
  ];

  // 创建饼状图实例
  const pieChart = echarts.init(document.getElementById("pie-chart"));

  // 配置饼状图的选项
  const options = {
    title: {
      text: "文章浏览量占比"
    },
    series: [
      {
        name: "访问量",
        type: "pie",
        radius: "50%",
        data: articles.map(article => ({
          name: article.title,
          value: article.views
        }))
      }
    ]
  };
  // 使用配置项渲染饼状图
  pieChart.setOption(options);
}

async function onSearch() {
  loading.value = true;
  //获取近一个月的新闻信息
  console.log(form.endDay);
  const { rows } = await listArticle(form);
  dataList.value = rows;
  console.log(dataList.value);
  loading.value = false;
  renderChart();
  renderPieChart();
}

//获取近一个月的新闻信息
//获取近一个月所有文章信息

onMounted(() => {
  // form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  // form.endDay = dayjs().format("YYYY-MM-DD")
  onSearch();
});
</script>
