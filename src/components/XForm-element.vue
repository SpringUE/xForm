<template>
  <div class="x-form">
    <el-form ref="form" v-bind="formProps" :model="model" :rules="rules">
      <el-row :gutter="gutter">
        <el-col v-for="(item, index) in items" :key="item.field + '.' + index"
          :span="item.hidden(model, item) ? 0 : item.span" :offset="item.offset"
          :class="item.offsetRight ? 'form-col-offset-right-' + item.offsetRight : ''">
          <el-form-item v-if="
            !item.hidden(model, item) &&
            !item.state.hidden &&
            !item.state.hiddenWithHolder" 
            :label="item.label" 
            :prop="item.field" 
            :rules="item.rule" 
            :class="{
              'x-form-flex-item': item.editor.prefix || item.editor.suffix,
            }">
            <!-- 前置组件 -->
            <component v-if="item.editor.prefix" :is="item.editor.prefix" />
            <!-- 文本展示 -->
            <span :ref="item.ref" class="x-form-item-text" v-if="!item.editor || item.editor.component === 'text'">
              {{ model[item.field] }}
            </span>
            <!-- 一般输入组件 -->
            <div class="x-form-item-component" v-else>
              <!-- 单选 -->
              <el-radio-group v-if="item.editor.component === 'el-radio-group'" 
                :ref="item.ref" 
                v-model="model[item.field]"
                v-bind="item.editor.props" 
                v-on="item.editor.events">
                <el-radio v-for="radio in item.editor.props.options" :key="radio.value"
                  :label="radio.value" :disabled="radio.disabled">
                  {{ radio.label }}
                </el-radio>
              </el-radio-group>
              <!-- 复选 -->
              <el-checkbox-group v-else-if="item.editor.component === 'el-checkbox-group'" 
                :ref="item.ref" 
                v-model="model[item.field]"
                v-bind="item.editor.props" 
                v-on="item.editor.events">
                <el-checkbox v-for="checkbox in item.editor.props.options" :key="checkbox.value"
                  :label="checkbox.value" :name="item.field">
                  {{ checkbox.label }}
                </el-checkbox>
              </el-checkbox-group>
              <!-- 下拉 -->
              <el-select v-if="item.editor.component === 'el-select'" 
                :ref="item.ref" 
                v-model="model[item.field]"
                v-bind="item.editor.props" 
                v-on="item.editor.events">
                <el-option v-for="option in item.editor.props.options" :key="option.value" :label="option.label"
                  :value="option.value"></el-option>
              </el-select>
              <!-- 其他所有组件 -->
              <component v-else :is="item.editor.component" 
                :ref="item.ref" 
                v-model="model[item.field]"
                v-bind="item.editor.props" 
                v-on="item.editor.events">
              </component>
            </div>
            <!-- 后置组件 -->
            <component v-if="item.editor.suffix" :is="item.editor.suffix" />
          </el-form-item>
          <div :ref="item.ref" class="x-form-item-holder" v-if="item.state.hiddenWithHolder"></div>
        </el-col>
      </el-row>
      <div class="x-form-submitbar" v-if="showSubmitBar">
        <el-button type="primary" @click="onSubmit">{{
            submitBtnText
        }}</el-button>
        <el-button @click="onReset">{{ resetBtnText }}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
/**
功能清单:
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
 */

const formators = {};

export default {
  name: "XForm",

  props: {
    // 绑定值
    modelValue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    // 表单项配置
    schema: {
      type: Array,
      required: true,
      default: () => [],
    },
    // 表单项间距
    gutter: {
      type: Number,
      default: 20,
    },
    // 行内表单模式
    inline: {
      type: Boolean,
      default: false,
    },
    // 表单域标签的宽度，例如 '50px'。作为 Form 直接子元素的 form-item 会继承该值。支持 auto。
    labelWidth: {
      type: String,
      default: "auto",
    },
    // 表单域标签的位置，如果值为 left 或者 right 时，则需要设置 label-width
    labelPosition: {
      type: String,
      default: "auto",
    },
    // 表单域标签的后缀
    labelSuffix: {
      type: String,
      default: ":",
    },
    // 是否以行内形式展示校验信息
    inlineMessage: {
      type: Boolean,
      default: false,
    },
    // 是否展示按钮栏
    showSubmitBar: {
      type: Boolean,
      default: true,
    },
    // 查询按钮文案
    submitBtnText: {
      type: String,
      default: "查询",
    },
    // 重置按钮文案
    resetBtnText: {
      type: String,
      default: "重置",
    },
  },

  data() {
    return {
      loading: false,
      items: [],
      model: {},
      rules: {},
      comps: {
        RadioGroup: 'el-radio-group',
        CheckboxGroup: 'el-checkbox-group',
        Select: 'el-select',
      },
      depMap: {},
    };
  },

  computed: {
    formProps() {
      const {
        inline,
        labelWidth,
        labelPosition,
        labelSuffix,
        inlineMessage,
      } = this;
      return { inline, labelWidth, labelPosition, labelSuffix, inlineMessage };
    },
  },

  watch: {
    // 此处勿深度监听，对象的每个字段已分别监听
    modelValue(nv) {
      this.writeBack(nv);
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      const items = (this.items = this.createFormItems(this.schema));
      const model = (this.model = this.createFormModel(items));
      const rules = (this.rules = this.createFormRules(items));
      console.log("items", items);
      console.log("depMap", this.depMap);
      this.writeBack(this.modelValue);
      // 储存初始model
      this.__defaultModelVal = JSON.parse(JSON.stringify(this.modelValue));
    },

    writeBack(nv) {
      this.model = { ...this.model, ...nv };
      this.items.forEach((x) => {
        if (x.effects && x.effects.suggest && x.effects.suggest.load) {
          if (
            nv[x.field] !== null &&
            nv[x.field] !== undefined &&
            nv[x.field] !== ""
          ) {
            x.effects.suggest.load(nv[x.field], this.model, x);
          }
        }
      });
    },

    // 创建表单项
    createFormItems(schema) {
      // 依赖项Map
      const depMap = this.depMap;
      return schema.map((x, i) => {
        const {
          label,
          field,
          dataType,
          span,
          offset,
          offsetRight,
          rule,
          hidden,
          editor,
          effects,
          render,
          formator,
        } = x;
        const item = {
          label,
          field,
          dataType: dataType || "string",
          span: span || 8,
          offset: offset || 0,
          offsetRight: offsetRight || 0,
          ref: "formItem" + field + "" + i,
          rule,
          hidden(model, item) {
            if (!hidden) return false;
            return typeof hidden === "function"
              ? hidden(model, item)
              : !!hidden;
          },
          state: {
            hidden: false,
            disabled: false,
            hiddenWithHolder: false,
          },
          lisenters: {
            change: [],
          },
        };

        item.editor = this.createItemEditor(item, editor);
        item.effects = this.createItemEffects(item, effects, depMap);
        item.watcher = this.createItemWatcher(item);
        item.syntaxNames = this.createSyntaxNames(item.field);
        item.render = render ? this.createItemRender(item, render) : null;
        item.formator = formator
          ? this.createItemFormator(item, formator)
          : null;

        return item;
      });
    },

    // 创建编辑器
    createItemEditor(item, editor) {
      if (!editor) {
        return "text";
      }
      const { component, props, events, prefix, suffix } = editor;
      const _editor = {
        component,
        props,
        events: this.createEditorEvents(item, events),
      };

      if (prefix) {
        _editor.prefix = {
          render(h) {
            return prefix(h);
          },
        };
      }

      if (suffix) {
        _editor.suffix = {
          render(h) {
            return suffix(h);
          },
        };
      }

      return _editor;
    },

    // 创建编辑器事件
    createEditorEvents(item, events = {}) {
      const { focus, change } = events;

      // 重新封装所有事件，并添加执行其他事件
      const _events = Object.entries(events).reduce((total, [name, fn]) => {
        total[name] = ($event) => {
          const model = this.getModel();
          this.runLisenters(item, name, $event);
          fn && fn($event, model, item);
        };
        return total;
      }, {});

      _events.focus = ($event) => {
        const model = this.getModel();
        this.runLisenters(item, "focus", $event);
        focus && focus($event, model, item);
      };

      _events.change = ($event) => {
        this.setModelValue(item, $event);

        if (item.effects.dependedes.size) {
          [...item.effects.dependedes].forEach((x) => {
            const item = this.items.find((y) => y.field === x);
            this.setModelValue(item, null);
            this.model[x] = null;
          });
        }

        const model = this.getModel();
        this.runLisenters(item, "change", $event);
        change && change($event, model, item);
      };

      return _events;
    },

    getDefTypeValue(dataType) {
      const typeMap = {
        string: () => "",
        number: () => 0,
        array: () => [],
        object: () => ({}),
        boolean: () => false,
      };
      return typeMap[dataType];
    },

    // 更新model值
    setModelValue(item, nv) {
      // 赋值时跳过内部监听
      item.watcher.unwatch();
      this.modelValue[item.field] = nv;
      item.watcher.watch();
    },

    // 执行事件监听函数
    runLisenters(item, name, $event) {
      const lisenter = item.lisenters[name];
      if (lisenter) {
        const model = this.getModel();
        [].concat(lisenter || []).forEach((fn) => {
          fn && fn($event, model, item);
        });
      }
    },

    // 创建表单项Watcher
    createItemWatcher(item) {
      const target = {};
      target.watch = () => {
        // 每个表单项单独监听，避免相互影响
        target.$watcher = this.$watch(`modelValue.${item.field}`, (nv) => {
          this.model[item.field] = nv;
        });
      };
      target.unwatch = () => {
        target.$watcher && target.$watcher();
      };

      target.watch();
      return target;
    },

    // 生成解构字段名
    createSyntaxNames(strName) {
      const isValid = /\[|\{[^\[\]\{\}]\}|\}/.test(strName);
      return isValid ? strName.match(/[^\[\]\{\},]/g) : null;
    },

    // 生成自定义渲染器
    createItemRender(item, render) {
      return {
        render(h) {
          return render(h, { item });
        },
      };
    },

    // 生成格式化渲染器
    createItemFormator(item, formator) {
      return formators[formator];
    },

    // 创建表单项关联影响
    createItemEffects(item, effects = {}, depMap = {}) {
      const _effects = {};
      const { suggest, dependency } = effects;

      if (suggest) {
        _effects.suggest = {
          trigger: 'focus',
          times: 'once',
          lazy: true,
          dataPropName: 'options',
          isOnceAlready: false,
          ...suggest,
        };

        if(dependency) {
          _effects.suggest.times = 'every'
        }
        
        const {
          loader,
          trigger,
          lazy,
          times,
          dataPropName,
          isOnceAlready,
        } = _effects.suggest;
        const load = (_effects.suggest.load = async ($event, model, item) => {
          if (times === "once" && _effects.suggest.isOnceAlready) {
            return false;
          }
          const data = loader && (await loader($event, model, item));
          item.editor.props[dataPropName] = data;
          _effects.suggest.isOnceAlready = true;
        });

        // 聚焦时加载
        // if (trigger === "focus") {
          item.lisenters.focus = [].concat(item.lisenters.focus || [], load);
        // }

        // 即时加载
        if (lazy === false) {
          load(null, this.getModel(), item);
        }
      }

      const handleDeps = (name, dependency) => {
        let deps = depMap[name];
        if (!deps) {
          deps = depMap[name] = {
            dependency,
            dependedes: new Set(),
          };
        }
        return deps;
      };

      // 依赖项
      const deps = handleDeps(item.field, dependency);
      if (dependency) {
        _effects.dependency = dependency;
        const loopHandler = (name, childName) => {
          const parentItem = handleDeps(name);
          parentItem.dependedes.add(childName);
          if (parentItem.dependency) {
            loopHandler(parentItem.dependency, childName);
          }
        };
        loopHandler(dependency, item.field);
      }

      // 被依赖项
      _effects.dependedes = deps.dependedes;

      return _effects;
    },

    // 创建表单模型
    createFormModel(items) {
      return items.reduce((total, x) => {
        total[x.field] = null;
        return total;
      }, {});
    },

    // 创建表单规则
    createFormRules(items) {
      return items.reduce((total, x) => {
        total[x.field] = x.rule;
        return total;
      }, {});
    },

    addItemLisenter(item, name, fn) {
      if (!item.lisenters[name]) {
        item.lisenters[name] = [];
      }
      item.lisenters[name].push(fn);
    },

    // [对外开放方法]选择一些表单项并进行操作(英文,分隔)
    selectItems(strFields = "") {
      const vm = this;
      const fields = strFields.split(",");
      const items = this.items.filter((x) => fields.includes(x.field));

      const handler = {
        on(name, fn) {
          items.forEach((x) => {
            vm.addItemLisenter(x, name, fn);
          });
          return handler;
        },
        value(nv) {
          items.forEach((x) => {
            vm.setModelValue(x, nv);
            vm.model[x.field] = nv;
          });
          return handler;
        },
        required(nv) {
          return items.map((x) => {
            const rule = [].concat(x.rule || []).find(y => y.required !== undefined)
            rule && (rule.required = nv)
          });
        },
        getRefs() {
          return items.map((x) => vm.$refs[x.ref]);
        },
        hidden(nv) {
          items.forEach((x) => {
            x.state.hidden = nv;
          });
          return handler;
        },
        hiddenWithHolder(nv) {
          items.forEach((x) => {
            x.state.hiddenWithHolder = nv;
          });
          return handler;
        },
        setEditorProp(prop, nv) {
          items.forEach((x) => {
            x.editor.props[prop] = nv;
          });
          return handler;
        },
      };

      return handler;
    },

    getModel() {
      return this.model;
    },

    onSubmit() {
      this.$emit("submit", this.model);
    },

    onReset() {
      this.$refs.form.resetFields();
      const model = { ...this.__defaultModelVal };
      // this.model = model
      this.$emit("input", model);
    },

    validate(cb) {
      return this.$refs.form.validate(cb);
    },

    formEl() {
      return this.$refs.form;
    },
  },
};
</script>

<style lang="less" scoped>
.x-form {
  ::v-deep .el-form {
    .form-col-offset-right {
      &-24 {
        margin-right: 100%;
      }

      &-23 {
        margin-right: 95.83333333%;
      }

      &-22 {
        margin-right: 91.66666667%;
      }

      &-21 {
        margin-right: 87.5%;
      }

      &-20 {
        margin-right: 83.33333333%;
      }

      &-19 {
        margin-right: 79.16666667%;
      }

      &-18 {
        margin-right: 75%;
      }

      &-17 {
        margin-right: 70.83333333%;
      }

      &-16 {
        margin-right: 66.66666667%;
      }

      &-15 {
        margin-right: 62.5%;
      }

      &-14 {
        margin-right: 58.33333333%;
      }

      &-13 {
        margin-right: 54.16666667%;
      }

      &-12 {
        margin-right: 50%;
      }

      &-11 {
        margin-right: 45.83333333%;
      }

      &-10 {
        margin-right: 41.66666667%;
      }

      &-9 {
        margin-right: 37.5%;
      }

      &-8 {
        margin-right: 33.33333333%;
      }

      &-7 {
        margin-right: 29.16666667%;
      }

      &-6 {
        margin-right: 25%;
      }

      &-5 {
        margin-right: 20.83333333%;
      }

      &-4 {
        margin-right: 16.66666667%;
      }

      &-3 {
        margin-right: 12.5%;
      }

      &-2 {
        margin-right: 8.33333333%;
      }

      &-1 {
        margin-right: 4.16666667%;
      }

      &-0 {
        margin-right: 0;
      }
    }
  }

  &-flex-item {
    ::v-deep .el-form-item__content {
      display: flex;

      >.x-form-item-component {
        flex: 1;
      }
    }
  }

  &-item-component {
    width: 100%;

    >.el-select {
      width: 100%;
    }
  }

  &-submitbar {
    text-align: center;

    >button {
      margin: 0 5px;
    }
  }
}
</style>