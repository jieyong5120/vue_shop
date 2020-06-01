<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolseDialogVisable = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1==0 ? 'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级标签 -->
              <el-col :span="5">
                <el-tag closable @close="removeRolseById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级标签 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter',i2==0 ? '':'bdtop']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRolseById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRolseById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色操作" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRolseDiglog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRolseById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >权限分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 权限分配 -->
    <el-dialog
      title="用户权限分配"
      :visible.sync="setRightDialogVisable"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="dcfKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolseDialogVisable"
      width="50%"
      @close="addRolseDialogClosed"
    >
      <el-form
        :model="addRolseForm"
        ref="addRolseFormRef"
        label-width="100px"
        :rules="addRolseFormRules"
        status-icon
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolseForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolseForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolseDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addRolse">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑提交角色 -->
    <el-dialog
      title="编辑提交角色"
      :visible.sync="editRolseVisible"
      width="50%"
      @close="editRolseDialogClosed"
    >
      <el-form
        :model="editRolseForm"
        ref="editRolseFormRef"
        label-width="100px"
        :rules="editRolseFormRules"
        status-icon
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolseForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色操作" prop="roleDesc">
          <el-input v-model="editRolseForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolseVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolseInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 添加角色
      addRolseDialogVisable: false,
      rolesList: [],
      // 修改权限分配
      setRightDialogVisable: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      addRolseForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色
      editRolseVisible: false,
      editRolseForm: {},
      dcfKeys: [],
      roleId: '',
      // 添加角色的验证规则对象
      addRolseFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑提交角色的验证规则对象
      editRolseFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表错误!')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 权限管理移除
    async removeRolseById(roleId, rightId) {
      // console.log(roleId.id)
      // console.log(rightId)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '删除用户权限',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除用户权限')
      }
      const { data: res } = await this.$http.delete(
        `roles/${roleId.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户权限失败')
      }
      this.$message.success('删除用户权限成功')
      // this.getUserList()
      // 把服务器的最新数据返回给页面里面
      roleId.children = res.data
    },
    // 权限分配
    async showSetRightDialog(role) {
      // console.log(role)
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.getLeafKeys(role, this.dcfKeys)
      this.setRightDialogVisable = true
      this.rightsList = res.data
      console.log(this.rightsList)
    },
    // 添加角色
    addRolse() {
      this.$refs.addRolseFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolseForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addRolseDialogVisable = false
        this.getRolesList()
      })
    },
    // 添加角色重置表单
    addRolseDialogClosed() {
      this.$refs.addRolseFormRef.resetFields()
    },
    //  编辑角色
    async showEditRolseDiglog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('修改用户信息失败')
      }
      console.log(res.data)
      this.editRolseForm = res.data
      this.editRolseVisible = true
    },
    editRolseDialogClosed() {
      this.$refs.editRolseFormRef.resetFields()
    },
    // 提交修改角色
    editRolseInfo() {
      this.$refs.editRolseFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolseForm.roleId,
          {
            roleName: this.editRolseForm.roleName,
            roleDesc: this.editRolseForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('提交角色失败')
        }
        this.editRolseVisible = false
        this.getRolesList()
        this.$message.success('提交角色成功')
      })
    },
    // 删除角色
    async deleteRolseById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '删除角色',
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
        return this.$message.info('取消删除用户')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // const num = this.total % this.queryInfo.pagesize
      // if (num === 1) {
      //   this.handleCurrentChange(this.queryInfo.pagenum - 1)
      // }
      this.getRolesList()
    },
    // 定义一个递归函数
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.$message.success('角色授权成功')
      this.getRolesList()
      this.setRightDialogVisable = false
    },
    // 关闭重置权限清空
    setRightDialogClosed() {
      this.dcfKeys = []
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
