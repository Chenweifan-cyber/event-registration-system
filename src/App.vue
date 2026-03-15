<template>
  <div class="app">
    <el-container>
      <el-header height="60px" class="header">
        <h1 class="title">校园活动报名系统</h1>
        <div class="user-info">
          <span v-if="currentUser.name" class="welcome-text">
            欢迎您，{{ currentUser.name }}（{{ currentUser.school }}）
          </span>
          <el-button v-if="currentUser.name" type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
          <template v-else>
            <el-button type="primary" size="small" @click="loginVisible = true">
              登录
            </el-button>
            <el-button type="success" size="small" @click="registerVisible = true">
              注册
            </el-button>
          </template>
        </div>
      </el-header>
      <el-main v-if="currentUser.name">
        <ProgressDisplay :registeredActivities="registeredActivities" />
        <ActivityFilter 
          @register="handleRegister" 
          :registeredActivities="registeredActivities"
        />
        <RegistrationForm
          :visible="registerFormVisible"
          :activity="selectedActivity"
          :currentUser="currentUser"
          @success="handleRegisterSuccess"
        />
      </el-main>
      <el-main v-else class="login-prompt">
        <el-empty description="请先登录或注册以使用系统功能">
          <el-button type="primary" @click="loginVisible = true">立即登录</el-button>
          <el-button type="success" @click="registerVisible = true">立即注册</el-button>
        </el-empty>
      </el-main>
    </el-container>
    
    <LoginForm
      :visible="loginVisible"
      @success="handleLoginSuccess"
      @update:visible="loginVisible = $event"
    />
    
    <RegisterForm
      :visible="registerVisible"
      @success="handleRegisterUserSuccess"
      @update:visible="registerVisible = $event"
    />
  </div>
</template>

<script>
import ActivityFilter from './components/activity/ActivityFilter.vue'
import RegistrationForm from './components/registration/RegistrationForm.vue'
import ProgressDisplay from './components/progress/ProgressDisplay.vue'
import LoginForm from './components/auth/LoginForm.vue'
import RegisterForm from './components/auth/RegisterForm.vue'

export default {
  name: 'App',
  components: {
    ActivityFilter,
    RegistrationForm,
    ProgressDisplay,
    LoginForm,
    RegisterForm
  },
  data() {
    return {
      loginVisible: false,
      registerVisible: false,
      registerFormVisible: false,
      selectedActivity: {},
      registeredActivities: [],
      currentUser: {
        name: '',
        studentId: '',
        school: '',
        contact: '',
        email: ''
      }
    }
  },
  mounted() {
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
        this.fetchRegisteredActivities()
      }
    },
    async fetchRegisteredActivities() {
      try {
        const response = await this.$axios.get('http://localhost:3000/api/registrations')
        this.registeredActivities = response.data
          .filter(reg => reg.studentId === this.currentUser.studentId)
          .map(reg => reg.activityId)
      } catch (error) {
        console.error('获取已报名活动列表失败:', error)
      }
    },
    handleRegister(activity) {
      this.selectedActivity = activity
      this.registerFormVisible = true
    },
    handleRegisterSuccess() {
      this.fetchRegisteredActivities()
      console.log('报名成功，已报名活动:', this.registeredActivities)
    },
    handleLoginSuccess(userData) {
      this.currentUser = userData
      localStorage.setItem('currentUser', JSON.stringify(userData))
      this.loginVisible = false
      this.fetchRegisteredActivities()
      this.$message.success('登录成功')
    },
    handleRegisterUserSuccess(userData) {
      this.currentUser = userData
      localStorage.setItem('currentUser', JSON.stringify(userData))
      this.registerVisible = false
      this.fetchRegisteredActivities()
      this.$message.success('注册成功，已自动登录')
    },
    handleLogout() {
      this.currentUser = {
        name: '',
        studentId: '',
        school: '',
        contact: '',
        email: ''
      }
      this.registeredActivities = []
      localStorage.removeItem('currentUser')
      this.$message.success('已退出登录')
    }
  }
}
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  .header {
    background-color: #409eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    .title {
      font-size: 20px;
      font-weight: 600;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
      .welcome-text {
        font-size: 14px;
        color: white;
      }
    }
  }
  .el-main {
    padding: 20px;
  }
  .login-prompt {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 60px);
  }
}
</style>
