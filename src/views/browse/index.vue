<template>
  <div class="main">
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
          title="文章列表"
          :tableRef="tableRef?.getTableRef()"
          :columns="columns"
          @refresh="SearchData(dateRange)"
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

      <el-tab-pane label="图表">
        <div id="chart" ref="chart" style="width: 600px; height: 400px" />
        <div
          id="titleChart"
          ref="titleChart"
          style="width: 600px; height: 400px"
        />
      </el-tab-pane>
    </el-tabs>
    <Form ref="formRef" @reload="SearchData(dateRange)" />
  </div>
</template>

<script setup lang="ts">
import { listBrowse, listArticle } from "@/api/Browse/browse";
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import * as echarts from "echarts";
import dayjs from "dayjs";
import Tree from "./tree.vue";

defineOptions({
  name: "TypeArticle"
});

const dateRange = ref();
const progressNews = ref([]);
const workNews = ref([]);
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
    label: "栏目类型",
    prop: "articleType",
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
  dateRange.value = [];
  formEl.resetFields();
  SearchData(dateRange);
}

// async function onSearch() {
//   loading.value = true;
//   //获取近一个月的新闻信息
//   const { rows } = await listArticle();
//   // renderChart();
//   dataList.value = rows;
//   loading.value = false;
// }

const SearchData = async (dateRange?) => {
  loading.value = true;
  // console.log("beginDay:", dateRange[0], "endDay:", dateRange[1]);
  const res = await listArticle({
    beginDay: dateRange[0],
    endDay: dateRange[1]
  });
  dataList.value = res.rows;
  // workNews.value = classifyNews("0");
  // progressNews.value = classifyNews("1");
  console.log(dataList.value);
  renderChart();
  titleChart();
  loading.value = false;
  // console.log("rows", res);
};

// const classifyNews = newType => {
//   return dataList.value.filter(news => news.articleType === newType);
// };

function renderChart() {
  // 创建柱形图
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);
  // let option: EChartsOption;
  // const titles = dataList.value.map(item => item.title);
  // const views = dataList.value.map(item => item.viewCount);
  // const articalType = dataList.value.map(item => item.arcticalType);

  interface DataItem {
    value: number;
    groupId: string;
  }
  const option = {
    xAxis: {
      data: ["Animals", "Fruits", "Cars"]
    },
    yAxis: {},
    dataGroupId: "",
    animationDurationUpdate: 500,
    series: {
      type: "bar",
      id: "sales",
      data: [
        {
          value: 5,
          groupId: "animals"
        },
        {
          value: 2,
          groupId: "fruits"
        },
        {
          value: 4,
          groupId: "cars"
        }
      ] as DataItem[],
      universalTransition: {
        enabled: true,
        divideShape: "clone"
      }
    }
  };

  const drilldownData = [
    {
      dataGroupId: "animals",
      data: [
        ["Cats", 4],
        ["Dogs", 2],
        ["Cows", 1],
        ["Sheep", 2],
        ["Pigs", 1]
      ]
    },
    {
      dataGroupId: "fruits",
      data: [
        ["Apples", 4],
        ["Oranges", 2]
      ]
    },
    {
      dataGroupId: "cars",
      data: [
        ["Toyota", 4],
        ["Opel", 2],
        ["Volkswagen", 2]
      ]
    }
  ];

  myChart.on("click", function (event) {
    if (event.data) {
      const subData = drilldownData.find(function (data) {
        return data.dataGroupId === (event.data as DataItem).groupId;
      });
      if (!subData) {
        return;
      }
      myChart.setOption<echarts.EChartsOption>({
        xAxis: {
          data: subData.data.map(function (item) {
            return item[0];
          })
        },
        series: {
          type: "bar",
          id: "sales",
          dataGroupId: subData.dataGroupId,
          data: subData.data.map(function (item) {
            return item[1];
          }),
          universalTransition: {
            enabled: true,
            divideShape: "clone"
          }
        },
        graphic: [
          {
            type: "text",
            left: 50,
            top: 20,
            style: {
              text: "Back",
              fontSize: 18
            },
            onclick: function () {
              myChart.setOption(option);
            }
          }
        ]
      });
    }
  });
  option && myChart.setOption(option);
}

function titleChart() {
  const chart = document.getElementById("titleChart");
  const titleChart = echarts.init(chart);
  console.log(dataList.value);
  const options = {
    title: {
      text: "文章浏览量统计"
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ["Email", "Union Ads", "Video Ads", "Direct", "Search Engine"]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "Email",
        type: "line",
        stack: "Total",
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: "Union Ads",
        type: "line",
        stack: "Total",
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: "Video Ads",
        type: "line",
        stack: "Total",
        data: [150, 232, 201, 154, 190, 330, 410]
      },
      {
        name: "Direct",
        type: "line",
        stack: "Total",
        data: [320, 332, 301, 334, 390, 330, 320]
      },
      {
        name: "Search Engine",
        type: "line",
        stack: "Total",
        data: [820, 932, 901, 934, 1290, 1330, 1320]
      }
    ]
  };
  options && titleChart.setOption(options);
}

onMounted(() => {
  form.endDay = dayjs().format("YYYY-MM-DD");
  form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  SearchData(dateRange);
});
</script>
