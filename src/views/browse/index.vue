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
              :default-expand-all="true"
              :loading="loading"
              :size="size"
              :data="listArticleData.handlerList"
              :columns="dynamicColumns"
              :header-cell-style="{
                background: 'var(--el-table-row-hover-bg-color)',
                color: 'var(--el-text-color-primary)'
              }"
              row-key="TypeId"
              adaptive
            />
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane label="图表">
        <div style="display: flex">
          <div id="chart" ref="chart" style="width: 1150px; height: 400px" />
          <div
            id="titleChart"
            ref="titleChart"
            style="width: 550px; height: 400px"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    <Form ref="formRef" @reload="onSearch" />
  </div>
</template>

<script setup lang="ts">
import { listBrowse, listArticle } from "@/api/Browse/browse";
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import * as echarts from "echarts";
import dayjs from "dayjs";
import Tree from "./tree.vue";

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
    width: 160,
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

//按类型分组后的数据
const listArticleData = reactive({
  handlerList: []
});

// 相同类型数据整合
const handlerDatas = arr => {
  const obj = {};
  arr.forEach((item, index) => {
    const { articleType } = item; //解构赋值

    if (!obj[articleType]) {
      obj[articleType] = {
        articleType,
        children: []
      };
    }
    obj[articleType].children.push(item);
  });
  listArticleData.handlerList = Object.values(obj);

  //给分组后的数据添加而外属性
  listArticleData.handlerList = listArticleData.handlerList.map(
    (item, index) => {
      let sum = 0;
      item.children.forEach(item => {
        item.articleType =
          item.articleType == "0"
            ? ""
            : item.articleType == "1"
            ? ""
            : item.articleType == "2"
            ? ""
            : "";
        sum += item.viewCount;
      }); //计算总浏览量

      return {
        ...item,
        TypeId: index + 1,
        viewCount: sum,
        title: ". . .",
        articleType:
          item.articleType == "0"
            ? "新闻信息"
            : item.articleType == "1"
            ? "门户及项目介绍"
            : item.articleType == "2"
            ? "成果内容展示"
            : "未分类"
      };
    }
  );
  // console.log(listArticleData.handlerList);
};

async function onSearch() {
  loading.value = true;
  //获取近一个月的新闻信息
  const { rows } = await listArticle();

  dataList.value = rows;
  loading.value = false;
  console.log(rows);
  handlerDatas(dataList.value); //调用数据分组方法
  renderChart();
  titleChart();
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
  const res = await listArticle({
    beginDay: dateRange[0],
    endDay: dateRange[1]
  });
  dataList.value = res.rows;
  handlerDatas(dataList.value); //调用数据分组方法
  loading.value = false;
  console.log("rows", res);
};

function renderChart() {
  // 创建柱形图
  const chartDom = document.getElementById("chart");
  const myChart = echarts.init(chartDom);
  // let option: EChartsOption;

  interface DataItem {
    value: number;
    groupId: string;
  }

  //数据处理
  const arr = listArticleData.handlerList.map(item => {
    const data = item.children.map(({ title, viewCount }) => ({
      title,
      viewCount
    }));
    data.forEach((item, index) => (data[index] = Object.values(item)));
    return {
      ...item,
      data: data,
      dataGroupId: item.articleType,
      value: item.viewCount,
      groupId: item.articleType
    };
  });

  const newData = arr.map(({ value, groupId }) => ({ value, groupId }));
  console.log(newData);

  const option = {
    xAxis: {
      type: "category",
      data: ["新闻信息", "门户及项目介绍", "成果内容展示"],
      axisLabel: {
        fontSize: 11,
        interval: 0,
        rotate: 70,
        formatter: function (value) {
          const len = value.length;
          if (len > 4) {
            return value.substring(0, 4) + "...";
          } else {
            return value;
          }
        }
      }
    },
    triggerEvent: true,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    yAxis: {},
    dataGroupId: "",
    animationDurationUpdate: 500,
    series: {
      type: "bar",
      id: "sales",
      data: newData as DataItem[],
      universalTransition: {
        enabled: true,
        divideShape: "clone"
      }
    }
  };

  // const drilldownData = [
  //   {
  //     dataGroupId: "animals",
  //     data: [
  //       ["Cats", 4],
  //       ["Dogs", 2],
  //       ["Cows", 1],
  //       ["Sheep", 2],
  //       ["Pigs", 3]
  //     ]
  //   },
  //   {
  //     dataGroupId: "fruits",
  //     data: [
  //       ["Apples", 4],
  //       ["Oranges", 2]
  //     ]
  //   },
  //   {
  //     dataGroupId: "cars",
  //     data: [
  //       ["Toyota", 4],
  //       ["Opel", 2],
  //       ["Volkswagen", 2]
  //     ]
  //   }
  // ];

  console.log(arr);
  const drilldownData = arr;

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

  const arr = listArticleData.handlerList.map(({ articleType, viewCount }) => ({
    articleType,
    viewCount
  }));
  const data = arr.map(item => {
    return {
      value: item.viewCount,
      name: item.articleType
    };
  });

  console.log(data);

  const options = {
    title: {
      text: "新闻栏目文章",
      subtext: "浏览量统计",
      left: "center"
    },
    tooltip: {
      trigger: "item"
    },
    legend: {
      orient: "vertical",
      left: "left"
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };

  options && titleChart.setOption(options);
}

onMounted(() => {
  form.endDay = dayjs().format("YYYY-MM-DD");
  form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  onSearch();
});
</script>
