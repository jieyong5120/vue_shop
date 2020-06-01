<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <!-- :closable="false"去除叉号 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 表格项 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态属性的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
          >动态参数</el-button>
          <!-- 动态参数 -->
          <el-table :data="manyTableDate" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态页面" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParamsDialogVisible = true"
          >静态页面</el-button>
          <!-- 静态页面 -->
          <el-table :data="onlyTableDate" border stripe>
            <!-- 静态属性也用这列数据模板 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加分类参数 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClosed"
    >
      <el-form
        :model="addParamsForm"
        ref="addParamsFormRef"
        label-width="100px"
        :rules="addParamsFormRules"
        status-icon
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类参数 -->
    <el-dialog
      :title="'修改'+ titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <el-form
        :model="editParamsForm"
        ref="editParamsFormRef"
        label-width="100px"
        :rules="editParamsFormRules"
        status-icon
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 数据列表
      cateList: [],
      // 指定级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedCateKeys: [],
      activeName: 'many',
      manyTableDate: [],
      onlyTableDate: [],
      addParamsDialogVisible: false,
      // 添加分类数据框中显示
      addParamsForm: { attr_name: '' },
      editParamsDialogVisible: false,
      // 修改分类数据框中显示
      editParamsForm: {},
      // 添加表单的验证规则对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则对象
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑隐藏按钮显示
      inputVisible: false,
      // 可移除标签内容的输入
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.$message.success('获取商品分类成功!')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选择发生改变
    handleChanged() {
      // 调用函数
      this.getParamsData()
    },
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数列表2处都有引用，就抽离出来，方便调用
    async getParamsData() {
      // 证明不是3级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableDate = []
        this.sonlyTableDate = []
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败!')
      }
      this.$message.success('获取参数列表成功!')
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        console.log(item.attr_vals)
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    // 添加参数提交
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error(`添加${this.titleText}失败`)
        }
        this.$message.success(`添加${this.titleText}成功`)
        this.getParamsData()
        this.addParamsDialogVisible = false
      })
    },
    // 重置添加参数表单
    addParamsDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 修改显示表单
    async showEditParamsDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(`获取${this.titleText}失败`)
      }
      this.$message.success(`获取${this.titleText}成功`)
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    // 重置修改参数表单
    editParamsDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 修改参数提交表单
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(`提交${this.titleText}失败`)
        }
        this.$message.success(`提交${this.titleText}成功`)
        this.getParamsData()
        this.editParamsDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(attrId) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        `此操作将永久删除该${this.titleText}, 是否继续?`,
        `删除${this.titleText}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 取消通过catch的err输出cancel
      // 确定删除输出confirm
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info(`取消删除${this.titleText}`)
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(`删除${this.titleText}失败`)
      }
      this.$message.success(`删除${this.titleText}成功`)
      this.getParamsData()
    },
    // 动态编辑标签
    handleInputConfirm(row) {
      // console.log('ok')
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
    // 动态编辑标签展示输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick方法在页面加载完才触发
      // input是原生的DOM 元素
      // _这只是一个形参
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 可修改的标签的删除操作
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  // 计算属性
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 5px;
}

.input-new-tag {
  width: 150px;
}
</style>
