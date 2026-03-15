import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// 初始化数据库
const defaultData = {
  users: [
    {
      id: 1,
      name: '张三',
      studentId: '202100100001',
      school: '北京大学',
      contact: '13800138001',
      email: 'zhangsan@example.com',
      password: 'password123',
      createdAt: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 2,
      name: '李四',
      studentId: '202100200002',
      school: '清华大学',
      contact: '13800138002',
      email: 'lisi@example.com',
      password: 'password123',
      createdAt: '2026-03-01T11:00:00.000Z'
    },
    {
      id: 3,
      name: '王五',
      studentId: '202100300003',
      school: '复旦大学',
      contact: '13800138003',
      email: 'wangwu@example.com',
      password: 'password123',
      createdAt: '2026-03-01T12:00:00.000Z'
    }
  ],
  activities: [
    {
      id: 1,
      title: 'Vue3 实战开发讲座',
      type: 'lecture',
      startTime: '2026-03-20 14:00',
      endTime: '2026-03-20 16:00',
      status: 'ongoing'
    },
    {
      id: 2,
      title: '校园编程大赛',
      type: 'competition',
      startTime: '2026-03-25 09:00',
      endTime: '2026-03-25 17:00',
      status: 'ongoing'
    },
    {
      id: 3,
      title: '春季读书会',
      type: 'reading',
      startTime: '2026-03-18 10:00',
      endTime: '2026-03-18 12:00',
      status: 'ended'
    },
    {
      id: 4,
      title: '人工智能入门工作坊',
      type: 'lecture',
      startTime: '2026-03-28 09:00',
      endTime: '2026-03-28 17:00',
      status: 'ongoing'
    },
    {
      id: 5,
      title: '校园摄影比赛',
      type: 'competition',
      startTime: '2026-04-01 00:00',
      endTime: '2026-04-15 23:59',
      status: 'ongoing'
    },
    {
      id: 6,
      title: '创新创业分享会',
      type: 'lecture',
      startTime: '2026-03-15 14:00',
      endTime: '2026-03-15 16:00',
      status: 'ended'
    },
    {
      id: 7,
      title: '英语角交流活动',
      type: 'reading',
      startTime: '2026-03-30 19:00',
      endTime: '2026-03-30 21:00',
      status: 'ongoing'
    },
    {
      id: 8,
      title: '数学建模竞赛培训',
      type: 'competition',
      startTime: '2026-04-05 14:00',
      endTime: '2026-04-05 17:00',
      status: 'ongoing'
    }
  ],
  registrations: [
    // 只保留少量示例报名数据，避免所有活动都显示已报名
    // Vue3讲座的报名数据（3人已报名）
    { id: 1001, activityId: 1, name: '张三', studentId: '2021001', contact: '13800138001', email: 'zhangsan@example.com', createdAt: '2026-03-10T10:00:00.000Z' },
    { id: 1002, activityId: 1, name: '李四', studentId: '2021002', contact: '13800138002', email: 'lisi@example.com', createdAt: '2026-03-10T11:00:00.000Z' },
    { id: 1003, activityId: 1, name: '王五', studentId: '2021003', contact: '13800138003', email: 'wangwu@example.com', createdAt: '2026-03-11T09:00:00.000Z' },
    
    // AI工作坊的报名数据（5人已报名）
    { id: 1004, activityId: 4, name: '赵六', studentId: '2021004', contact: '13800138004', email: 'zhaoliu@example.com', createdAt: '2026-03-13T10:00:00.000Z' },
    { id: 1005, activityId: 4, name: '钱七', studentId: '2021005', contact: '13800138005', email: 'qianqi@example.com', createdAt: '2026-03-13T14:00:00.000Z' },
    { id: 1006, activityId: 4, name: '孙八', studentId: '2021006', contact: '13800138006', email: 'sunba@example.com', createdAt: '2026-03-14T09:00:00.000Z' },
    { id: 1007, activityId: 4, name: '周九', studentId: '2021007', contact: '13800138007', email: 'zhoujiu@example.com', createdAt: '2026-03-14T16:00:00.000Z' },
    { id: 1008, activityId: 4, name: '吴十', studentId: '2021008', contact: '13800138008', email: 'wushi@example.com', createdAt: '2026-03-15T10:00:00.000Z' },
    
    // 英语角的报名数据（2人已报名）
    { id: 1009, activityId: 7, name: '郑一', studentId: '2021009', contact: '13800138009', email: 'zhengyi@example.com', createdAt: '2026-03-22T10:00:00.000Z' },
    { id: 1010, activityId: 7, name: '冯二', studentId: '2021010', contact: '13800138010', email: 'fenger@example.com', createdAt: '2026-03-22T14:00:00.000Z' }
  ]
};

const adapter = new JSONFile('./db.json');
const db = new Low(adapter, defaultData);

// 启动服务器
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 初始化数据库数据
async function initDB() {
  await db.read();
  await db.write();
}

// API路由

// 用户注册
app.post('/api/users/register', async (req, res) => {
  await db.read();
  const { name, studentId, school, contact, email, password } = req.body;
  
  // 检查学号是否已存在
  const existingUser = db.data.users.find(user => user.studentId === studentId);
  if (existingUser) {
    return res.status(400).json({ error: '该学号已注册' });
  }
  
  // 检查邮箱是否已存在
  const existingEmail = db.data.users.find(user => user.email === email);
  if (existingEmail) {
    return res.status(400).json({ error: '该邮箱已注册' });
  }
  
  // 创建新用户
  const newUser = {
    id: Date.now(),
    name,
    studentId,
    school,
    contact,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  db.data.users.push(newUser);
  await db.write();
  
  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, data: userWithoutPassword });
});

// 用户登录
app.post('/api/users/login', async (req, res) => {
  await db.read();
  const { studentId, password } = req.body;
  
  // 查找用户
  const user = db.data.users.find(user => user.studentId === studentId);
  if (!user) {
    return res.status(401).json({ error: '学号不存在' });
  }
  
  // 验证密码
  if (user.password !== password) {
    return res.status(401).json({ error: '密码错误' });
  }
  
  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: userWithoutPassword });
});

// 获取用户信息
app.get('/api/users/:studentId', async (req, res) => {
  await db.read();
  const { studentId } = req.params;
  
  const user = db.data.users.find(user => user.studentId === studentId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: userWithoutPassword });
});

// 获取活动列表
app.get('/api/activities', async (req, res) => {
  await db.read();
  res.json(db.data.activities);
});

// 获取报名列表
app.get('/api/registrations', async (req, res) => {
  await db.read();
  res.json(db.data.registrations);
});

// 提交报名
app.post('/api/registrations', async (req, res) => {
  await db.read();
  const { activityId, name, studentId, contact, email } = req.body;
  
  // 检查是否重复报名
  const isDuplicate = db.data.registrations.some(
    reg => reg.activityId === activityId && reg.studentId === studentId
  );
  
  if (isDuplicate) {
    return res.status(400).json({ error: '您已经报名过该活动' });
  }
  
  // 创建新报名
  const newRegistration = {
    id: Date.now(),
    activityId,
    name,
    studentId,
    contact,
    email,
    createdAt: new Date().toISOString()
  };
  
  db.data.registrations.push(newRegistration);
  await db.write();
  
  res.json({ success: true, data: newRegistration });
});

// 检查是否报名
app.get('/api/registrations/check', async (req, res) => {
  await db.read();
  const { activityId, studentId } = req.query;
  
  const isRegistered = db.data.registrations.some(
    reg => reg.activityId == activityId && reg.studentId === studentId
  );
  
  res.json({ isRegistered });
});

// 启动服务器
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});