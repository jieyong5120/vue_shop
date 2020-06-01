<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <!-- treetable是导入第三方依赖自定义的，data表示表格各行的数据 -->
      <!-- selection-type是否展开行-->
      <!-- show-index采用序列 -->
      <!-- index-text自定义表格序列那一列的名称 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showCateDiglog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- 级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类弹框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form :model="editForm" ref="editCateFormRef" label-width="100px" status-icon>
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 数据列表
      cateList: [],
      // 第三方依赖的表格对列的设置
      // prop对应列内容的属性名
      // label每一列的名称
      // type自定义模板列引用模板
      //  template模板列用到什么插槽
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类的规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 编辑分类
      editCateVisible: false,
      // 接收用户修改数据
      editForm: {}
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.$message.success('获取商品分类成功!')
      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听newSize大小的变化值
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听newPage页码的变化值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    // parentCateChanged() {
    //   console.log(this.selectedKeys)
    //   // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
    //   // 反之，就说明没有选中任何父级分类
    //   if (this.selectedKeys.length > 0) {
    //     // 父级分类的Id,选择最后一个
    //     this.addCateForm.cat_pid = this.selectedKeys[
    //       this.selectedKeys.length - 1
    //     ]
    //     // 为当前分类的等级赋值
    //     this.addCateForm.cat_level = this.selectedKeys.length
    //     // return
    //   } else {
    //     // 父级分类的Id
    //     this.addCateForm.cat_pid = 0
    //     // 为当前分类的等级赋值
    //     this.addCateForm.cat_level = 0
    //   }
    //   console.log(this.addCateForm)
    // },
    // // 选择项发生变化触发这个函数(方法二)
    // this.selectedKeys == e
    parentCateChanged(e) {
      this.addCateForm.cat_pid = e.length ? e[e.length - 1] : 0
      this.addCateForm.cat_level = e.length
      console.log(this.addCateForm)
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 修改分类
    async showCateDiglog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('修改分类失败')
      }
      this.editForm = res.data
      this.editCateVisible = true
    },
    // 重置修改分类
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 提交修改分类
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.editCateVisible = false
        this.getCateList()
        this.$message.success('修改分类成功')
      })
    },
    // 删除分类
    async removeCateById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '删除分类',
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
        return this.$message.info('取消删除分类')
      }
      // console.log('确认删除用户，用户已删除')
      // console.log(id)
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      const num = this.total % this.queryInfo.pagesize
      if (num === 1) {
        this.handleCurrentChange(this.queryInfo.pagenum - 1)
      }
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
