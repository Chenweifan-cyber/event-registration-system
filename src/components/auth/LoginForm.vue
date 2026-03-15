<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户登录"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          登录
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'LoginForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      isSubmitting: false,
      form: {
        studentId: '',
        password: ''
      },
      rules: {
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d{12}$/, message: '学号必须为12位数字', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      formRef: null
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.resetForm()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    resetForm() {
      this.form = {
        studentId: '',
        password: ''
      }
      if (this.formRef) {
        this.formRef.resetFields()
      }
    },
    async handleSubmit() {
      if (this.isSubmitting) return
      
      const formRef = this.$refs.formRef
      if (!formRef) return
      
      try {
        await formRef.validate()
        this.isSubmitting = true
        
        const response = await this.$axios.post('http://localhost:3000/api/users/login', {
          studentId: this.form.studentId,
          password: this.form.password
        })
        
        if (response.data.success) {
          this.dialogVisible = false
          this.isSubmitting = false
          this.$emit('success', response.data.data)
        } else {
          this.$message.error('登录失败')
          this.isSubmitting = false
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          this.$message.error(error.response.data.error)
        } else {
          this.$message.error('登录失败，请稍后重试')
        }
        this.isSubmitting = false
        console.error('登录失败:', error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>