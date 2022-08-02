
# XForm表单

## 背景

复杂型表单组件逻辑处理繁琐  
element-ui没有功能强大的表单组件

## 核心功能

*基于element-ui的el-form封装，使用json配置生成表单  
*支持栅格化布局，支持向右排斥槽位(例如一个为span=4的表单项独占一行)  
*支持表单项前置&后置插槽  
*支持任意组件，以及props|events传参  
*内置依赖联动功能  
*支持选择任意表单项进行事件监听或者操作赋值等  
*支持动态插入表单项  
*支持跨表单项联动  
*记忆重置功能  

## 典型表单

通过json来配置表单项

:::demo 典型表单
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>
```
:::

## 布局

采用栅格化布局  
labelWidth属性设置所有表单项label的宽度  
span属性设置表单项的局部栅格，默认为8，也就是三列一行  
若要行内表单请根据栅格调整

:::demo 布局
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            span: 8,
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>
```
:::

## 独占一行

表单项中设置offsetRight属性向右排斥槽位即可(栅格)，例如：offsetRight: 16，向右排斥16个栅格

:::demo 独占一行
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            span: 8,
            offsetRight: 16,
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>
```
:::

## 按钮栏

隐藏按钮栏

:::demo 按钮栏
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>
```
:::

## 插槽

表单项内容区前置, 后置插槽

:::demo 插槽
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input',
              prefix(h) {
                return <span>前置插槽</span>;
              },
              suffix(h) {
                return <span>后置插槽</span>;
              },
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>
```
:::

## 组件输入

支持任意形式组件，以及props|events传参
+ Antd组件
+ 自定义组件
+ 第三方组件
+ Object对象组件

```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
import { Select } from "ant-design-vue";
import { PopSelector } from "@/src/components/PopSelector.vue";
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "审批人",
            field: "approver",
            editor: {
              component: PopSelector,
            }
          },
          {
            label: "活动区域",
            field: "area",
            editor: {
              component: Select,
              props: {
                options: [],
              }
            }
          },
          {
            label: "活动主题",
            field: "theme",
            editor: {
              component: {
                template: `<a-textarea
      v-model:value="value2"
      placeholder="主题内容..."
      @change="e => $emit('input', e)"
      :auto-size="{ minRows: 2, maxRows: 5 }"
    />`,
                props: ['value'],
                data() {
                  return {
                    value2: ''
                  }
                }
              }
            }
          },
        ],
        model: {
          approver: "",
          area: "man",
          theme: '',
        },
      },
    };
  }
}
</script>

<style lang="less" scoped>
.page-container {}
</style>
```
:::

## 事件与监听

支持选择任意表单项进行事件监听或者操作赋值等

:::demo 插槽
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            span: 8,
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              },
              events: {
                change($event) {
                  vm.test.model.age = 20;
                  debugger
                },
              },
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  }
}
</script>

<style lang="less" scoped>
.page-container {}
</style>
```
:::

## ref操作

:::demo ref操作
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "姓名",
            field: "name",
            editor: {
              component: 'a-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'a-select',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              }
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'a-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "man",
          age: null,
        },
      },
    };
  },

  mounted() {
    const $namesex = this.$refs.test.selectItems('name,sex')
    const $age = this.$refs.test.selectItems('age')
    $namesex.on('change', ($event, model, item) => {
      $age.value(20)
    })
  }
}
</script>
```
:::

## 依赖联动

:::demo 依赖联动
```html
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "地区部",
            field: "region",
            editor: {
              component: 'a-select',
              props: {
                options: [],
              },
            },
            effects: {
              suggest: {
                loader($event, model, item) {
                  return Promise.resolve([
                    { label: "亚太", value: "yt" },
                    { label: "欧洲", value: "oz" },
                    { label: "美洲", value: "mz" },
                  ]);
                },
                trigger: 'focus',
                times: 'once',
                lazy: true,
              },
            },
          },
          {
            label: "代表处",
            field: "regRegion",
            editor: {
              component: 'a-select',
              props: {
                options: [],
              },
            },
            effects: {
              dependency: 'region',
              suggest: {
                loader($event, model, item) {
                  return Promise.resolve([
                    { label: "中国代表处", value: "zgdbc" },
                    { label: "日本代表处", value: "rbdbc" },
                    { label: "韩国代表处", value: "hgdbc" },
                  ]);
                },
              },
            },
          },
          {
            label: "国家/地区",
            field: "country",
            offset: 0,
            editor: {
              component: 'a-select',
              props: {
                options: [],
              },
            },
            effects: {
              dependency: 'regRegion',
              suggest: {
                loader($event, model, item) {
                  return Promise.resolve([
                    { label: "日本", value: "rb" },
                  ]);
                },
              },
            },
          },
        ],
        model: {
          region: "",
          regRegion: "",
          country: "",
        },
      },
    };
  }
}
</script>
```
:::