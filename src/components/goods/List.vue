<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图  -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <!-- 在全局main.js里面注册了全局时间过滤器 -->
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="addDialogVisable = true"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeListById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20, 50]"
        :page-size="queryInfo. pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的数据的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败!')
      }
      this.$message.success('获取商品列表数据成功!')
      console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听newSize大小的变化值
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听newPage页码的变化值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除分类的函数
    async removeListById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品列表, 是否继续?',
        '删除商品列表',
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
        return this.$message.info('取消删除商品列表')
      }
      // console.log('确认删除用户，用户已删除')
      // console.log(id)
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品列表失败')
      }
      this.$message.success('删除商品列表成功')
      const num = this.total % this.queryInfo.pagesize
      if (num === 1) {
        this.handleCurrentChange(this.queryInfo.pagenum - 1)
      }
      this.getGoodsList()
    },
    // 通过添加按钮编程式导航跳转到商品添加页面
    goAddpage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
