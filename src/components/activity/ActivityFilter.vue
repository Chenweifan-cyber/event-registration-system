<template>
  <div class="activity-filter">
    <el-card shadow="hover" class="filter-card">
      <template #header>
        <div class="card-header">
          <span>活动筛选</span>
        </div>
      </template>
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="活动类型">
          <el-select v-model="filterForm.type" placeholder="请选择活动类型" @change="handleFilter">
            <el-option label="讲座" value="lecture" />
            <el-option label="比赛" value="competition" />
            <el-option label="读书会" value="reading" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="filterForm.status" placeholder="请选择活动状态" @change="handleFilter">
            <el-option label="报名中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="filter-status" v-if="filterForm.type || filterForm.status">
        <span class="filter-label">当前筛选条件：</span>
        <el-tag v-if="filterForm.type" type="info" closable @close="clearTypeFilter">
          活动类型：{{ getTypeText(filterForm.type) }}
        </el-tag>
        <el-tag v-if="filterForm.status" type="info" closable @close="clearStatusFilter">
          活动状态：{{ filterForm.status === 'ongoing' ? '报名中' : '已结束' }}
        </el-tag>
      </div>
    </el-card>
    <el-card shadow="hover" class="activity-list" v-if="filteredActivities.length > 0">
      <template #header>
        <div class="card-header">
          <span>活动列表</span>
        </div>
      </template>
      <el-table :data="filteredActivities" style="width: 100%">
        <el-table-column prop="id" label="活动ID" width="80" />
        <el-table-column prop="title" label="活动标题" />
        <el-table-column prop="type" label="活动类型" width="100">
          <template #default="scope">
            {{ getTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ongoing' ? 'success' : 'info'">
              {{ scope.row.status === 'ongoing' ? '报名中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button 
              v-if="!isRegistered(scope.row.id)" 
              type="primary" 
              size="small" 
              @click="handleRegister(scope.row)" 
              :disabled="scope.row.status === 'ended'"
            >
              报名
            </el-button>
            <el-button 
              v-else 
              type="success" 
              size="small" 
              disabled
            >
              已报名
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-empty v-else description="暂无活动" class="empty-activity" />
  </div>
</template>

<script>
export default {
  name: 'ActivityFilter',
  props: {
    registeredActivities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filterForm: {
        type: '',
        status: ''
      },
      activities: []
    }
  },
  computed: {
    filteredActivities() {
      return this.activities.filter(activity => {
        const typeMatch = !this.filterForm.type || activity.type === this.filterForm.type
        const statusMatch = !this.filterForm.status || activity.status === this.filterForm.status
        return typeMatch && statusMatch
      })
    }
  },
  mounted() {
    this.fetchActivities()
  },
  watch: {
    registeredActivities() {
      // 当已报名活动列表变化时，重新获取活动列表
      this.fetchActivities()
    }
  },
  methods: {
    getTypeText(type) {
      const typeMap = {
        lecture: '讲座',
        competition: '比赛',
        reading: '读书会',
        other: '其他'
      }
      return typeMap[type] || type
    },
    async fetchActivities() {
      try {
        const response = await this.$axios.get('http://localhost:3000/api/activities')
        this.activities = response.data
      } catch (error) {
        console.error('获取活动列表失败:', error)
      }
    },
    handleFilter() {
      console.log('筛选条件:', this.filterForm)
    },
    resetFilter() {
      this.filterForm = {
        type: '',
        status: ''
      }
    },
    clearTypeFilter() {
      this.filterForm.type = ''
    },
    clearStatusFilter() {
      this.filterForm.status = ''
    },
    handleRegister(activity) {
      this.$emit('register', activity)
    },
    isRegistered(activityId) {
      return this.registeredActivities.includes(activityId)
    }
  }
}
</script>

<style lang="less" scoped>
.activity-filter {
  padding: 20px;
  .filter-card {
    margin-bottom: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .filter-form {
    margin-top: 10px;
  }
  .activity-list {
    margin-top: 20px;
  }
  .empty-activity {
    margin-top: 40px;
  }
}
</style>