// 添加日期范围
export const addDateRange = (params, dateRange, propName?) => {
  const search = params;
  search.params =
    typeof search.params === "object" &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (typeof propName === "undefined") {
    search.params["beginTime"] = dateRange[0];
    search.params["endTime"] = dateRange[1];
  } else {
    search.params["begin" + propName] = dateRange[0];
    search.params["end" + propName] = dateRange[1];
  }
  return search;
};

// 转换字符串，undefined,null等转化为""
export const parseStrEmpty = str => {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
};

// 回显数据字典
export const selectDictLabel = (datas, value) => {
  if (value === undefined) {
    return "";
  }
  const actions = [];
  Object.keys(datas).some(key => {
    if (datas[key].value == "" + value) {
      actions.push(datas[key].label);
      return true;
    }
  });
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join("");
};
