<template>
  <div class="main">
    <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="栏目" name="articleType">
        <TypeArticle v-if="activeName == 'articleType'" ref="typeArTical" />
      </el-tab-pane>
      <el-tab-pane label="文章标题" name="articleTitle">
        <TitleArticle v-if="activeName == 'articleTitle'" ref="titleArticle" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
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
import { listBrowse } from "@/api/Browse/browse";
import { PaginationProps } from "@pureadmin/table";
import TypeArticle from "./typeArticle.vue";
import TitleArticle from "./titleArticle.vue";

defineOptions({
  name: "Browse",
  components: {
    TypeArticle,
    TitleArticle
  }
});

const activeName = ref("articleType");

const tableRef = ref();
const searchFormRef = ref();
const formRef = ref();
const Ids = ref([]);
const multiple = ref(true);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  name: "",
  type: "",
  orderByColumn: undefined,
  isAsc: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});

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
  //获取所有栏目的文章
  const { rows } = await listBrowse(form);
  dataList.value = rows;
  // renderChart();
  // renderPieChart();
  loading.value = false;
}

//获取近一个月的新闻信息
//获取近一个月所有文章信息

const handleClick = tab => {
  activeName.value = tab.name;
  setTimeout(() => {
    onQuery();
  }, 500);
};

const onQuery = () => {
  const activeComponent = ref(activeName).value;
  // this.$refs[activeComponent].onSearch();
};

onMounted(() => {
  // defaultDate.endDay = dayjs().format("YYYY-MM-DD");
  // defaultDate.beginDay = dayjs().subtract(1, "month").format("YYYY-MM-DD");
  onSearch();
});
</script>
