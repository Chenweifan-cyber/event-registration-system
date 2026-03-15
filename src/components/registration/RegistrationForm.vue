<template>
  <el-dialog
    v-model="dialogVisible"
    title="活动报名"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="form.activityName" disabled />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="联系方式" prop="contact">
        <el-input v-model="form.contact" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          提交报名
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'RegistrationForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    activity: {
      type: Object,
      default: () => ({})
    },
    currentUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      isSubmitting: false,
      form: {
        activityName: '',
        name: '',
        studentId: '',
        contact: '',
        email: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d+$/, message: '学号必须为数字', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      formRef: null
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.activity) {
        this.form.activityName = this.activity.title
        // 自动填充当前用户信息
        this.form.name = this.currentUser.name || ''
        this.form.studentId = this.currentUser.studentId || ''
        this.form.contact = this.currentUser.contact || ''
        this.form.email = this.currentUser.email || ''
      }
    },
    activity(val) {
      if (this.dialogVisible && val) {
        this.form.activityName = val.title
      }
    }
  },
  methods: {
    async handleSubmit() {
      if (this.isSubmitting) return
      
      const formRef = this.$refs.formRef
      if (!formRef) return
      
      try {
        await formRef.validate()
        this.isSubmitting = true
        
        // 调用后端API提交报名
        const response = await this.$axios.post('http://localhost:3000/api/registrations', {
          activityId: this.activity.id,
          name: this.form.name,
          studentId: this.form.studentId,
          contact: this.form.contact,
          email: this.form.email
        })
        
        if (response.data.success) {
          this.$message.success('报名成功')
          this.dialogVisible = false
          this.isSubmitting = false
          this.$emit('success')
        } else {
          this.$message.error('报名失败')
          this.isSubmitting = false
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          this.$message.error(error.response.data.error)
        } else {
          this.$message.error('报名失败，请稍后重试')
        }
        this.isSubmitting = false
        console.error('报名失败:', error)
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