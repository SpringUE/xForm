# XForm表单

## 背景

表单使用场景十分广泛，特别是B端、中后台系统页面。但目前市面上大部分UI组件库特点几乎都是基于实现表单的通用功能，如表单校验，清空重置等，没有强大的逻辑处理能力。   
标签形式的表单组合代码分散，难以复用，实现复杂型逻辑处理繁琐，因此，json配置式表单应运而生。

## 功能清单

- jsonSchema式配置
- 基于element-plus组件库  
- 栅格化布局
- 支持表单项前后插槽  
- 任意形式组件 
- 支持组件prop属性
- 支持组件event监听
- 内置Sugges功能
- 内置依赖联动功能  
- 支持动态插入表单项  
- 跨表单项联动  
- 记忆重置功能  
- 支持解构赋值
- 支持向右排斥栅格布局
- 支持动态多事件监听
- 支持动态操作赋值
- 支持动态ref操作
- 支持动态显隐操作
- 支持动态更新必(非必)填
- 支持动态保留槽位式隐藏  
- 支持动态设置控件属性

## 典型表单

通过json来配置表单项，控制可直接使用elemen-plus输入控件

``` vue:demo
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" label-position="top" :showSubmitBar="false" />
</template>

<script>
// import XForm from 'XForm'
export default {
  // components: {XForm},
  data(vm) {
    return {
      test: {
        schema: [
          {
            label: "First Name",
            field: "Firstname",
            editor: {
              component: 'el-input',
            }
          },
          {
            label: "Last Name",
            field: "LastName",
            editor: {
              component: 'el-input'
            }
          },
        ],
        model: {
          Firstname: "",
          LastName: "",
        },
      },
    };
  }
}
</script>
```

## 布局

采用栅格化布局  
labelWidth属性设置所有表单项label的宽度  
span属性设置表单项的局部栅格，默认为8，也就是一行三列   
若要行内表单请根据栅格调整

``` vue:demo
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" label-position="top" :showSubmitBar="false" />
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
              component: 'el-input',
            }
          },
          {
            label: "性别",
            span: 8,
            field: "sex",
            editor: {
              component: 'el-input'
            }
          },
          {
            label: "年龄",
            span: 8,
            field: "age",
            offset: 0,
            editor: {
              component: 'el-input'
            }
          },
          {
            label: "个人爱好",
            span: 24,
            field: "name",
            editor: {
              component: 'el-input',
              props: {
                type: 'textarea',
                rows: 4
              }
            }
          },
        ],
        model: {
          name: "",
          sex: "",
          age: null,
        },
      },
    };
  }
}
</script>
```

## 独占一行

表单项中设置offsetRight属性向右排斥槽位即可(栅格)，例如：offsetRight: 16，向右排斥16个栅格

``` vue:demo
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
              component: 'el-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'el-input'
            }
          },
          {
            label: "年龄",
            field: "age",
            offset: 0,
            editor: {
              component: 'el-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "男",
          age: null,
        },
      },
    };
  }
}
</script>
```

## 按钮栏

默认隐藏按钮栏，showSubmitBar=true即可显示按钮栏，支持配置按钮text文本

``` vue:demo
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" :showSubmitBar="true" />
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
              component: 'el-input',
            }
          },
          {
            label: "性别",
            field: "sex",
            editor: {
              component: 'el-input'
            }
          },
          {
            label: "年龄",
            field: "age",
            editor: {
              component: 'el-input'
            }
          },
        ],
        model: {
          name: "",
          sex: "",
          age: null,
        },
      },
    };
  }
}
</script>
```

## 插槽

表单项内容区前置, 后置插槽

``` vue:demo
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    const suffixComp = (h) => {
      return <span>后</span>;
    }
    
    return {
      test: {
        schema: [
          {
            label: "前置插槽",
            span: 24,
            field: "slot1",
            editor: {
              component: 'el-input',
              prefix(h) {
                return <span>前</span>;
              },
            }
          },
          {
            label: "后置插槽",
            span: 24,
            field: "slot2",
            editor: {
              component: 'el-input',
              suffix: suffixComp,
            }
          },
          {
            label: "前后插槽",
            span: 24,
            field: "slot3",
            editor: {
              component: 'el-input',
              prefix(h) {
                return <span>前</span>;
              },
              suffix: suffixComp,
            }
          },
        ],
        model: {
          slot1: "",
          slot2: "",
          slot3: "",
        },
      },
    };
  }
}
</script>
```

## 组件输入

支持任意形式组件，以及props属性传参
+ element-plus组件
+ 自定义组件
+ 第三方组件
+ Object对象组件

```vue:demo
<template>
  <XForm ref="test" :schema="test.schema" v-model="test.model" labelWidth="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    const LocationEditor = {
      template: `<el-select v-model="location" @change="e => $emit('input', e)"><el-option label="上海" value="shanghai" /><el-option label="北京" value="beijing" /></el-select>`,
      props: ['value'],
      data() {
        return {
          location: ''
        }
      }
    }

    return {
      test: {
        schema: [
          {
            label: "活动名称",
            field: "name",
            editor: {
              component: 'el-input',
              props: {
                placeholder: '中文名称',
              }
            }
          },
          {
            label: "活动地点",
            field: "location",
            editor: {
              component: LocationEditor
            }
          },
          {
            label: "活动主题",
            span: 24,
            field: "theme",
            editor: {
              component: 'el-input',
              props: {
                type: 'textarea',
                rows: 4
              }
            }
          },
        ],
        model: {
          name: "",
          location: "shanghai",
          theme: '',
        },
      },
    };
  }
}
</script>
```

## 事件与监听

支持选择任意表单项进行事件监听

``` vue:demo
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
            label: "退休性别",
            span: 12,
            field: "sex",
            editor: {
              component: 'el-radio-group',
              props: {
                options: [
                    { label: "男", value: "man" },
                    { label: "女", value: "women" },
                  ],
              },
              events: {
                change($event) {
                  vm.test.model.age = $event === 'man' ? 60 : 55;
                },
              },
            }
          },
          {
            label: "退休年龄",
            span: 12,
            field: "age",
            editor: {
              component: 'el-input',
              props: {
                disabled: true
              }
            }
          }
        ],
        model: {
          sex: "man",
          age: 60,
        },
      },
    };
  }
}
</script>
```

## ref操作

在组件内可通过ref对表单实例进行操作，如：赋值、添加监听、置灰、隐藏、设置组件props等

``` vue:demo
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
            label: "币种",
            span: 12,
            field: "currency",
            editor: {
              component: 'el-select',
              props: {
                options: [
                  { label: "人民币", value: "rmb" },
                  { label: "美元", value: "dolar" },
                ],
              }
            }
          },
          {
            label: "币种符号",
            span: 12,
            field: "currencySymbol",
            editor: {
              component: 'el-input',
              props: {
                disabled: true
              }
            }
          },
          {
            label: "支付方式",
            span: 24,
            field: "payment",
            editor: {
              component: 'el-radio-group',
              props: {
                options: [
                  { label: "现金", value: "cash" },
                  { label: "银行卡", value: "bank" },
                  { label: "支付宝", value: "Alipay" },
                ],
              }
            }
          },
        ],
        model: {
          currency: "rmb",
          currencySymbol: "rmb",
          payment: 'cash',
        },
      },
    };
  },

  mounted() {
    const $currency = this.$refs.test.selectItems('currency')
    const $currencySymbol = this.$refs.test.selectItems('currencySymbol')
    const $payment = this.$refs.test.selectItems('payment')

    const options1 = [
      { label: "现金", value: "cash" },
      { label: "银行卡", value: "bank" },
      { label: "支付宝", value: "Alipay" },
    ]
    const options2 = [
      { label: "现金", value: "cash" },
      { label: "银行卡", value: "bank" },
    ]

    $currency.on('change', ($event, model, item) => {
      $currencySymbol.value($event)
      
      const options = $event === 'rmb' ? options1 : options2
      $payment.value($event === 'rmb' ? 'cash' : 'bank')
      $payment.setEditorProp('options', options)
    })
  }
}
</script>
```

## 动态显隐控制

hidden函数里通过当前数据返回计算值是否隐藏

``` vue:demo
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
            label: "无需说明",
            span: 4,
            field: "isHiddenDesc",
            editor: {
              component: 'el-checkbox',
              events: {
                change($event, model, item) {
                  
                },
              },
            }
          },
          {
            label: "退休说明",
            span: 12,
            field: "desc",
            editor: {
              component: 'el-input'
            },
            hidden(model, item) {
              return model.isHiddenDesc
            }
          },
        ],
        model: {
          isHiddenDesc: false,
          desc: '',
        },
      },
    };
  }
}
</script>
```

## Suggest功能

内置Suggest下拉联想功能，主要针对需要选项数据的组件，例如：Select、远程搜索、自动完成等   
可设置加载接口，控制触发时机、触发次数，已达到更精细的性能优化

::: tip
Tips:   
suggest.trigger: 触发时机('focus:聚焦时加载|click:点击时加载|hover:经过时加载')   
suggest.lazy: 是否懒加载   
suggest.times: 加载次数(once:一次|every:每次)
:::

``` vue:demo
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
            span: 24,
            field: "region",
            editor: {
              component: 'el-select',
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
            span: 24,
            field: "regRegion",
            editor: {
              component: 'el-select',
              props: {
                options: [],
              },
            },
            effects: {
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
            span: 24,
            field: "country",
            editor: {
              component: 'el-select',
              props: {
                options: [],
              },
            },
            effects: {
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

## 依赖联动

``` vue:demo
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
            label: "省份",
            span: 24,
            field: "province",
            editor: {
              component: 'el-select',
              props: {
                options: [],
              },
            },
            effects: {
              suggest: {
                loader($event, model, item) {
                  return Promise.resolve([
                    { label: "广东", value: "gd" },
                    { label: "广西", value: "gx" },
                    { label: "湖南", value: "hn" },
                  ]);
                },
                trigger: 'focus',
                times: 'once',
                lazy: true,
              },
            },
          },
          {
            label: "城市",
            span: 24,
            field: "city",
            editor: {
              component: 'el-select',
              props: {
                options: [],
              },
            },
            effects: {
              dependency: 'province',
              suggest: {
                loader($event, model, item) {
                  const cityMap = {
                    gd: [{label:'深圳',value:'sz'},{label:'广州',value:'gz'},{label:'东莞',value:'dg'}],
                    gx: [{label:'南宁',value:'nn'},{label:'桂林',value:'gl'},{label:'梧州',value:'wz'}],
                    hn: [{label:'长沙',value:'cs'},{label:'湘潭',value:'xt'},{label:'株洲',value:'zhz'}],
                  }
                  
                  return Promise.resolve(cityMap[model.province]);
                },
              },
            },
          },
          {
            label: "区/县",
            span: 24,
            field: "area",
            editor: {
              component: 'el-select',
              props: {
                options: [],
              },
            },
            effects: {
              dependency: 'city',
              suggest: {
                loader($event, model, item) {
                  const areaMap = {
                    sz: [{label:'龙岗区',value:'longgang'},{label:'福田',value:'b'},{label:'南山',value:'c'}],
                    gz: [{label:'海珠区',value:'nn'},{label:'天河区',value:'gl'},{label:'白云区',value:'wz'}],
                    dg: [{label:'东城区',value:'cs'},{label:'西城区',value:'xt'}],
                    nn: [{label:'西乡塘区',value:'cs'}],
                    gl: [{label:'象山区',value:'cs'}],
                    wz: [{label:'长洲区',value:'cs'}],
                    cs: [{label:'芙蓉区',value:'cs'}],
                    xt: [{label:'A区',value:'cs'}],
                    zhz: [{label:'B区',value:'cs'}],
                  }
                  
                  return Promise.resolve(areaMap[model.city]);
                },
              },
            },
          },
        ],
        model: {
          province: "gd",
          city: "sz",
          area: "longgang",
        },
      },
    };
  }
}
</script>
```

## 跨表单联动

``` vue:demo
<template>
  <h3>基本信息</h3>
  <XForm ref="form1" :schema="form1.schema" v-model="form1.model" label-width="120px" :showSubmitBar="false" />
  <h3>拓展信息</h3>
  <XForm ref="form2" :schema="form2.schema" v-model="form2.model" label-width="120px" :showSubmitBar="false" />
</template>

<script>
export default {
  data(vm) {
    return {
      form1: {
        schema: [
          {
            label: "是否急单",
            field: "urgent",
            editor: {
              component: 'el-checkbox',
              props: {},
              events: {
                change($event) {
                  vm.$refs.form2.selectItems('urgentReason').required($event)
                }
              }
            },
          },
        ],
        model: {
          urgent: false,
        },
      },
      form2: {
        schema: [
          {
            label: "急单原因",
            span: 12,
            field: "urgentReason",
            rule: [{required: false}],
            editor: {
              component: 'el-input',
              props: {
                type: 'textarea',
                rows: 4
              }
            }
          },
        ]
      }
    };
  }
}
</script>
```