<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <!-- active代表被激活的项 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏 -->
      <el-form
        :model="addForm"
        ref="addFormRef"
        label-width="100px"
        :rules="addFormRules"
        status-icon
        :label-position="'top'"
      >
        <!-- :before-leave 切换标签之前的钩子函数 -->
        <!-- tab 被选中时触发 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <!-- options绑定的数据源信息 -->
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChanged"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传商品图片 -->
            <!-- :headers属性设置 upload没有通过axios发送ajax请求，我们必须给upload手动绑定一个请求头，手动设置一个请求头token -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- class="ql-editor"是一个类 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览区域 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 不是全局导入注册lodash
import _ from 'lodash'

export default {
  data() {
    return {
      // activeIndex数值的变化每一项name属性绑定的值的变化
      activeIndex: '0',
      // 添加表单数据信息
      // goods_cat是什么玩意
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 富文本编辑器的双向数据绑定
        goods_introduce: '',
        // 商品的参数，包括静态及动态
        attrs: []
      },
      // 添加表单数据信息的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      // 获取商品分类数据列表
      cateList: [],
      cateProps: { label: 'cat_name', value: 'cat_id', children: 'children' },
      // 接收获取到的商品参数信息，保存在一个数组当中
      manyTableData: [],
      // 接收获取到的商品属性信息，保存在一个数组当中
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // upload没有通过axios发送ajax请求，我们必须给upload手动绑定一个请求头，手动设置一个请求头token
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewVisible: false,
      // 为图片预览的地址信息
      previewPath: ''
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
      console.log(res.data)
    },
    handleChanged() {
      // console.log(this.addForm.goods_cat)
      // 选中的级联必须是三级
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签之前的钩子函数，会阻止一些行为
    // activeName为即将进入的标签页，oldActiveName为将要离开的标签页
    // oldActiveName,activeName分别对应着Tabs 标签页里面的name数值
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请输入基本信息!')
        return false
      }
    },
    // tab 被选中时触发函数
    async tabClicked() {
      // this.activeIndex用来判断监听每一项的索引
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败!')
        }
        this.$message.success('获取商品参数成功!')
        // 接收获取到的商品参数信息，保存在一个数组当中
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败!')
        }
        this.$message.success('获取商品属性成功!')
        // 接收获取到的商品参数信息，保存在一个数组当中
        console.log(res.data)
        // 将res.data里面的attr_vals数据由字符串转化为数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.onlyTableData = res.data
      }
    },
    // 用于图片预浏览文件
    handlePreview(file) {
      console.log(file)
      this.previewVisible = true
      this.previewPath = file.response.data.url
    },
    // 用于处理移除图片
    handleRemove(file) {
      // 通过打印路径的信息，查找到相对应的信息
      console.log(file)
      // filePath为要移除图片的路径地址信息
      const filePath = file.response.data.tem_path
      // this.addForm.pics数组的findIndex方法查找到与要移除图片的路径地址信息的的那一项的数组索引
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 在调用数组的splice切割数组中我们找到的索引的那一项的图片，就是我们要删除的图片信息
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 这个函数就是上传图片虽然保存到服务器端，但也页面加载没有数据，需要把图片的数据保存到addform里面，提交数据pics接口是一个数组，里面保存着一个个对象数据，用push追加到数组里面，用于上传很多张图片
    handleSuccess(response) {
      console.log(response)
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    add() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // this.addForm里面的数据进行一次深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品属性失败!')
        }
        this.$message.success('添加商品属性成功!')
        // 编程式导航
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      // 判断级联选择器选中的是否为第三项
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
