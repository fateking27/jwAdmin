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
        <el-button @click="listExport()">导出</el-button>
      </el-form-item>
    </el-form>

    <el-tabs
      type="border-card"
      style="height: 770px; background-color: rgb(255 255 255)"
    >
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
              align-whole="left"
              showOverflowTooltip
              :default-expand-all="true"
              :loading="loading"
              :size="size"
              :data="dataList"
              :columns="dynamicColumns"
              :header-cell-style="{
                background: 'var(--el-table-row-hover-bg-color)',
                color: 'var(--el-text-color-primary)'
              }"
              row-key="articleType"
              adaptive
            />
          </template>
        </PureTableBar>
      </el-tab-pane>

      <el-tab-pane label="图表">
        <div
          style="display: flex; justify-content: space-evenly; width: 1630px"
        >
          <el-card class="box-card">
            <div
              id="chart"
              ref="chart"
              :style="[
                {
                  width: width,
                  height: height,
                  display: 'flex',
                  justifyContent: 'center'
                }
              ]"
            />
          </el-card>
          <el-card
            class="box-card"
            :style="[
              {
                display: styleDisplay,
                'align-items': styleAlignItems
              }
            ]"
          >
            <div
              id="titleChart"
              ref="titleChart"
              style="width: 500px; height: 655px"
            />
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    <Form ref="formRef" @reload="onSearch" />
  </div>
</template>

<script setup lang="ts">
import { listBrowse, listArticle, listExport } from "@/api/Browse/browse";
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

const styleTitleChart = reactive({
  display: "flex",
  alignItems: "center"
});

const styleDisplay = ref("flex");
const styleAlignItems = ref("center");
const width = ref("900px");
const height = ref("655px");

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
// const listArticleData = reactive({
//   handlerList: []
// });

// 相同类型数据整合
// const handlerDatas = arr => {
//   const obj = {};
//   arr.forEach((item, index) => {
//     const { articleType } = item; //解构赋值

//     if (!obj[articleType]) {
//       obj[articleType] = {
//         articleType,
//         children: []
//       };
//     }
//     obj[articleType].children.push(item);
//   });
//   listArticleData.handlerList = Object.values(obj);

//   //给分组后的数据添加而外属性
//   // listArticleData.handlerList = listArticleData.handlerList.map(
//   //   (item, index) => {
//   //     let sum = 0;
//   //     item.children.forEach(item => {
//   //       item.articleType =
//   //         item.articleType == "0"
//   //           ? ""
//   //           : item.articleType == "1"
//   //           ? ""
//   //           : item.articleType == "2"
//   //           ? ""
//   //           : "";
//   //       sum += item.viewCount;
//   //     }); //计算总浏览量

//   //     return {
//   //       ...item,
//   //       TypeId: index + 1,
//   //       viewCount: sum,
//   //       title: ". . .",
//   //       articleType:
//   //         item.articleType == "0"
//   //           ? "新闻信息"
//   //           : item.articleType == "1"
//   //           ? "门户及项目介绍"
//   //           : item.articleType == "2"
//   //           ? "成果内容展示"
//   //           : "对外服务"
//   //     };
//   //   }
//   // );
//   // console.log(listArticleData.handlerList);
// };

async function onSearch() {
  loading.value = true;
  //获取近一个月的新闻信息
  const { data } = await listArticle();

  loading.value = false;
  console.log(data);
  // handlerDatas(dataList.value); //调用数据分组方法

  let arrObj = [];
  for (const key in data) {
    const name =
      key == "0"
        ? "新闻信息"
        : key == "1"
        ? "门户及项目介绍"
        : key == "2"
        ? "成果内容展示"
        : "对外服务";
    const i = { articleType: name, children: data[key] };
    arrObj.push(i);
  }

  arrObj = arrObj.map(item => {
    const children = [];
    for (const key in item.children) {
      const i = item.children[key];
      children.push(i);
    }
    return {
      ...item,
      children: children
    };
  });

  //给分组后的数据添加而外属性
  arrObj = arrObj.map((item, index) => {
    let sum = 0;
    item.children.forEach(item => {
      sum += item.viewCount;
    }); //计算总浏览量

    return {
      ...item,
      TypeId: index + 1,
      viewCount: sum,
      title: ". . ."
    };
  });
  dataList.value = arrObj;
  console.log(dataList.value);
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
  const { data } = await listArticle({
    beginDay: dateRange[0],
    endDay: dateRange[1]
  });
  let arrObj = [];
  for (const key in data) {
    const name =
      key == "0"
        ? "新闻信息"
        : key == "1"
        ? "门户及项目介绍"
        : key == "2"
        ? "成果内容展示"
        : "对外服务";
    const i = { articleType: name, children: data[key] };
    arrObj.push(i);
  }

  arrObj = arrObj.map(item => {
    const children = [];
    for (const key in item.children) {
      const i = item.children[key];
      children.push(i);
    }
    return {
      ...item,
      children: children
    };
  });

  //给分组后的数据添加而外属性
  arrObj = arrObj.map((item, index) => {
    let sum = 0;
    item.children.forEach(item => {
      sum += item.viewCount;
    }); //计算总浏览量

    return {
      ...item,
      TypeId: index + 1,
      viewCount: sum,
      title: ". . ."
    };
  });

  dataList.value = arrObj;
  console.log(dataList.value);
  // dataList.value = data;
  // handlerDatas(dataList.value); //调用数据分组方法
  loading.value = false;
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
  const arr = dataList.value.map(item => {
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
  // console.log(newData);

  const option = {
    // width: 800,
    title: {
      text: "栏目总浏览次数统计",
      subtext: "",
      left: "center"
    },
    dataZoom: [
      {
        type: "inside",
        moveOnMouseWheel: true,
        show: false,
        start: 0,
        end: 100,
        xAxisIndex: [0],
        zoomOnMouseWheel: false
      },
      {
        type: "slider",
        show: false,
        start: 0,
        end: 100,
        xAxisIndex: [0],
        height: 0
      }
    ],
    xAxis: {
      name: "栏目名称",
      type: "category",
      data: ["新闻信息", "门户及项目介绍", "成果内容展示", "对外服务"],
      axisLabel: {
        fontSize: 14,
        interval: 0,
        // rotate: 15,
        formatter: function (value) {
          // const len = value.length;
          // if (len > 4) {
          //   return value.substring(0, 4) + "...";
          // } else {
          return value;
          // }
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
    yAxis: {
      name: "浏览次数",
      nameTextStyle: {
        padding: [0, 0, 0, -100]
      }
      // nameRotate:'90'
    },
    dataGroupId: "",
    animationDurationUpdate: 500,
    series: {
      type: "bar",
      id: "sales",
      barWidth: 35,
      silent: false,
      data: newData as DataItem[],
      universalTransition: {
        enabled: true,
        divideShape: "clone"
      },
      label: {
        show: true,
        position: "top"
      }
    }
    // grid: {
    //   width: "700px"
    // }
  };

  console.log(arr);
  const drilldownData = arr;

  myChart.on("click", function (event) {
    //隐藏饼状图
    styleDisplay.value == "none"
      ? (styleDisplay.value = "flex")
      : (styleDisplay.value = "none");

    width.value == "1400px"
      ? (width.value = "900px")
      : (width.value = "1400px");

    if (event.data) {
      const subData = drilldownData.find(function (data) {
        return data.dataGroupId === (event.data as DataItem).groupId;
      });

      console.log(subData.dataGroupId);

      let dataZoomEnd = 0;
      subData.data.length > 10 ? (dataZoomEnd = 85) : (dataZoomEnd = 100);

      if (!subData) {
        return;
      }
      myChart.setOption<echarts.EChartsOption>({
        title: {
          text: subData.dataGroupId + "：文章浏览次数统计",
          subtext: "栏目下共有" + subData.data.length + "篇文章",
          left: "center"
        },
        // grid: {
        //   width:'1300px',
        //   containLabel: true
        // },
        xAxis: {
          name: "",
          data: subData.data.map(function (item) {
            return item[0];
          }),
          axisLabel: {
            fontSize: 10,
            interval: 0,
            // rotate: 15,
            // formatter: function (value) {
            //   return "";
            // }
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
        series: {
          type: "bar",
          id: "sales",
          barWidth: 30,
          silent: true,
          dataGroupId: subData.dataGroupId,
          label: {
            show: false
          },
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
            left: 0,
            top: 0,
            style: {
              text: "返回",
              fontSize: 18
            },
            onclick: function (e) {
              e.target.style.text = "";
              myChart.setOption(option);
            }
          }
        ],
        dataZoom: [
          {
            type: "inside",
            moveOnMouseWheel: true,
            zoomOnMouseWheel: false,
            show: true,
            start: 0,
            end: dataZoomEnd,
            xAxisIndex: [0]
          },
          {
            type: "slider",
            height: 0,
            show: true,
            start: 0,
            end: dataZoomEnd,
            xAxisIndex: [0]
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
  // console.log(dataList.value)

  const arr = dataList.value.map(({ articleType, viewCount }) => ({
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
      text: "栏目总浏览次数占比",
      left: "center"
      // top: 0
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} {b} : {c} ({d}%)"
    },
    legend: {
      orient: "horizontal",
      y: "bottom"
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["30%", "55%"],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        labelLine: {
          length: 25, // 修改引导线第一段的长度
          length2: 25 // 修改引导线第二段的长度
        }
      }
    ],
    label: {
      formatter: "{b}：{d}%"
    },
    graphic: {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: "总浏览次数：",
        fontSize: 16
      }
    }
  };

  let total = 0;
  options.series[0].data.forEach(item => [(total += item.value)]);

  options.graphic.style.text += total;

  options && titleChart.setOption(options);
}

onMounted(() => {
  form.endDay = dayjs().format("YYYY-MM-DD");
  form.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  onSearch();
});
</script>
