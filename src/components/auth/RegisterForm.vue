<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户注册"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="学校" prop="school">
        <el-input v-model="form.school" placeholder="请输入学校名称" />
      </el-form-item>
      <el-form-item label="手机号" prop="contact">
        <el-input v-model="form.contact" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          注册
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'RegisterForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.formRef.validateField('confirmPassword')
        }
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      dialogVisible: false,
      isSubmitting: false,
      form: {
        name: '',
        studentId: '',
        school: '',
        contact: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
        ],
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d{12}$/, message: '学号必须为12位数字', trigger: 'blur' }
        ],
        school: [
          { required: true, message: '请输入学校名称', trigger: 'blur' },
          { min: 2, max: 50, message: '学校名称长度在2到50个字符', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
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
        name: '',
        studentId: '',
        school: '',
        contact: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        
        const response = await this.$axios.post('http://localhost:3000/api/users/register', {
          name: this.form.name,
          studentId: this.form.studentId,
          school: this.form.school,
          contact: this.form.contact,
          email: this.form.email,
          password: this.form.password
        })
        
        if (response.data.success) {
          this.dialogVisible = false
          this.isSubmitting = false
          this.$emit('success', response.data.data)
        } else {
          this.$message.error('注册失败')
          this.isSubmitting = false
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          this.$message.error(error.response.data.error)
        } else {
          this.$message.error('注册失败，请稍后重试')
        }
        this.isSubmitting = false
        console.error('注册失败:', error)
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