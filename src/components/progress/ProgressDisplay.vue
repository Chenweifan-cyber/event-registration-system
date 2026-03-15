<template>
  <div class="progress-display">
    <el-card shadow="hover" class="progress-card">
      <template #header>
        <div class="card-header">
          <span>报名进度</span>
        </div>
      </template>
      <div class="progress-stats">
        <div class="stat-item" title="系统中所有活动的总数量">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <el-statistic :value="totalActivities" title="活动总数">
            <template #title>
              <span class="stat-label">活动总数</span>
            </template>
          </el-statistic>
        </div>
        <div class="stat-item" title="当前可以报名的活动数量">
          <div class="stat-icon ongoing">
            <el-icon><Timer /></el-icon>
          </div>
          <el-statistic :value="ongoingActivities">
            <template #title>
              <span class="stat-label">报名中活动</span>
            </template>
          </el-statistic>
        </div>
        <div class="stat-item" title="所有活动的报名总人数">
          <div class="stat-icon total">
            <el-icon><User /></el-icon>
          </div>
          <el-statistic :value="totalRegistrations">
            <template #title>
              <span class="stat-label">总报名人数</span>
            </template>
          </el-statistic>
        </div>
        <div class="stat-item" title="您已报名的活动数量">
          <div class="stat-icon mine">
            <el-icon><Star /></el-icon>
          </div>
          <el-statistic :value="myRegistrations">
            <template #title>
              <span class="stat-label">我已报名</span>
            </template>
          </el-statistic>
        </div>
      </div>
      <div class="progress-list" v-if="progressData.length > 0">
        <h3>活动报名进度</h3>
        <div class="progress-item" v-for="item in progressData" :key="item.activityId">
          <div class="progress-info">
            <span class="activity-title">{{ item.activityName }}</span>
            <span class="activity-count">{{ item.current }} / {{ item.total }}</span>
          </div>
          <el-progress :percentage="item.percentage" :color="getProgressColor(item.percentage)" />
        </div>
      </div>
      <el-empty v-else description="暂无进度数据" class="empty-progress" />
    </el-card>
  </div>
</template>

<script>
import { Calendar, Timer, User, Star } from '@element-plus/icons-vue'

export default {
  name: 'ProgressDisplay',
  components: {
    Calendar,
    Timer,
    User,
    Star
  },
  props: {
    registeredActivities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      totalActivities: 0,
      ongoingActivities: 0,
      totalRegistrations: 0,
      myRegistrations: 0,
      progressData: [],
      activities: [],
      registrations: []
    }
  },
  mounted() {
    this.fetchData()
  },
  watch: {
    registeredActivities() {
      this.myRegistrations = this.registeredActivities.length
      this.fetchData()
    }
  },
  methods: {
    async fetchData() {
      try {
        const [activitiesResponse, registrationsResponse] = await Promise.all([
          this.$axios.get('http://localhost:3000/api/activities'),
          this.$axios.get('http://localhost:3000/api/registrations')
        ])
        
        this.activities = activitiesResponse.data
        this.registrations = registrationsResponse.data
        
        this.calculateStats()
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    },
    calculateStats() {
      this.totalActivities = this.activities.length
      this.ongoingActivities = this.activities.filter(a => a.status === 'ongoing').length
      this.totalRegistrations = this.registrations.length
      this.myRegistrations = this.registeredActivities.length
      
      // 计算每个活动的报名进度
      this.progressData = this.activities.map(activity => {
        const activityRegistrations = this.registrations.filter(r => r.activityId === activity.id)
        const current = activityRegistrations.length
        // 假设每个活动的最大报名人数为50
        const total = 50
        const percentage = Math.min((current / total) * 100, 100)
        
        return {
          activityId: activity.id,
          activityName: activity.title,
          current: current,
          total: total,
          percentage: percentage.toFixed(2)
        }
      })
    },
    getProgressColor(percentage) {
      if (percentage < 50) {
        return '#67C23A'
      } else if (percentage < 80) {
        return '#E6A23C'
      } else {
        return '#F56C6C'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.progress-display {
  padding: 20px;
  .progress-card {
    width: 100%;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .progress-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
    .stat-item {
      text-align: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      min-width: 120px;
      cursor: help;
      transition: all 0.3s;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .stat-icon {
        font-size: 32px;
        color: #409eff;
        margin-bottom: 10px;
        &.ongoing {
          color: #67c23a;
        }
        &.total {
          color: #e6a23c;
        }
        &.mine {
          color: #f56c6c;
        }
      }
      .stat-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
  .progress-list {
    margin-top: 20px;
    h3 {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 600;
    }
    .progress-item {
      margin-bottom: 20px;
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        .activity-title {
          font-weight: 500;
        }
        .activity-count {
          color: #909399;
        }
      }
    }
  }
  .empty-progress {
    margin-top: 40px;
  }
}
</style>