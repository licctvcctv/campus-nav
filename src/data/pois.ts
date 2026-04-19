export interface POI {
  id: number
  name: string
  type: string
  lng: number
  lat: number
  description: string
}

export const POI_TYPES = ['全部', '教学楼', '教学区', '图书馆', '食堂', '体育设施', '宿舍', '行政办公', '生活服务', '出入口', '地标'] as const

export const TYPE_COLORS: Record<string, string> = {
  '教学楼': '#3b82f6',
  '教学区': '#6366f1',
  '图书馆': '#f59e0b',
  '食堂': '#ef4444',
  '体育设施': '#22c55e',
  '宿舍': '#8b5cf6',
  '行政办公': '#06b6d4',
  '生活服务': '#f97316',
  '出入口': '#ec4899',
  '地标': '#14b8a6',
}

export const TYPE_ICONS: Record<string, string> = {
  '教学楼': '🏫',
  '教学区': '🏛️',
  '图书馆': '📚',
  '食堂': '🍽️',
  '体育设施': '⚽',
  '宿舍': '🏠',
  '行政办公': '🏢',
  '生活服务': '📮',
  '出入口': '🚪',
  '地标': '📍',
}

export const campusCenter: [number, number] = [126.557574, 45.814973]

export const pois: POI[] = [
  { id: 1, name: '哈尔滨商业大学(北校区)', type: '地标', lng: 126.557574, lat: 45.814973, description: '校园中心' },
  { id: 2, name: 'A区', type: '教学区', lng: 126.55834, lat: 45.818426, description: '北校区A区(北区)' },
  { id: 3, name: 'B区', type: '教学区', lng: 126.557574, lat: 45.810403, description: '北校区B区(东区)' },
  { id: 4, name: 'C区', type: '教学区', lng: 126.553756, lat: 45.808913, description: '北校区C区(西区)' },
  { id: 5, name: 'A区会计学院', type: '教学楼', lng: 126.559693, lat: 45.815675, description: '会计学院教学楼' },
  { id: 6, name: 'A区设计艺术学院', type: '教学楼', lng: 126.559729, lat: 45.816598, description: '设计艺术学院' },
  { id: 7, name: 'A区体育学院', type: '教学楼', lng: 126.558102, lat: 45.819532, description: '体育学院' },
  { id: 8, name: 'B区能源与建筑工程学院', type: '教学楼', lng: 126.556641, lat: 45.810416, description: '能源与建筑工程学院' },
  { id: 9, name: 'B区基础科学学院', type: '教学楼', lng: 126.556236, lat: 45.809636, description: '基础科学学院' },
  { id: 10, name: 'C区轻工学院', type: '教学楼', lng: 126.553998, lat: 45.810732, description: '轻工学院' },
  { id: 11, name: 'C区管理学院', type: '教学楼', lng: 126.553854, lat: 45.809888, description: '管理学院' },
  { id: 12, name: 'A区图书馆', type: '图书馆', lng: 126.558343, lat: 45.817477, description: '北校区A区图书馆' },
  { id: 13, name: 'A区食堂', type: '食堂', lng: 126.559468, lat: 45.820631, description: '北校区A区学生食堂' },
  { id: 14, name: 'A区体育场', type: '体育设施', lng: 126.560325, lat: 45.819262, description: '北校区A区体育场(操场)' },
  { id: 15, name: 'A区体育馆', type: '体育设施', lng: 126.557692, lat: 45.819401, description: '北校区A区室内体育馆' },
  { id: 16, name: '体育馆(丁香大道)', type: '体育设施', lng: 126.560227, lat: 45.819309, description: '体育馆' },
  { id: 17, name: 'A区足球场', type: '体育设施', lng: 126.5572, lat: 45.818724, description: '足球场' },
  { id: 18, name: '体育文化传播发展中心', type: '体育设施', lng: 126.560237, lat: 45.818322, description: '体育文化传播发展中心' },
  { id: 19, name: 'A区研究生宿舍', type: '宿舍', lng: 126.560092, lat: 45.822703, description: '研究生宿舍区' },
  { id: 20, name: '第十四学生宿舍', type: '宿舍', lng: 126.559353, lat: 45.822043, description: '14号学生宿舍' },
  { id: 21, name: 'A区14公寓', type: '宿舍', lng: 126.561613, lat: 45.82064, description: 'A区14号公寓' },
  { id: 22, name: '第十八学生宿舍', type: '宿舍', lng: 126.55691, lat: 45.821922, description: '18号学生宿舍(北区)' },
  { id: 23, name: 'C区学生公寓', type: '宿舍', lng: 126.553542, lat: 45.807524, description: 'C区管理学院学生公寓' },
  { id: 24, name: '行政楼', type: '行政办公', lng: 126.557023, lat: 45.816976, description: '学校行政楼' },
  { id: 25, name: '征兵工作站', type: '行政办公', lng: 126.557736, lat: 45.819497, description: '北区征兵工作站' },
  { id: 26, name: '邮局(商大邮电所)', type: '生活服务', lng: 126.560415, lat: 45.812902, description: '中国邮政商大邮电所' },
  { id: 27, name: '教师公寓', type: '生活服务', lng: 126.553489, lat: 45.812283, description: '商大教师公寓' },
  { id: 28, name: 'B区食堂(美食街)', type: '食堂', lng: 126.557568, lat: 45.811654, description: 'B区食堂区域，含多家餐饮' },
  { id: 29, name: '校门(北门/1号门)', type: '出入口', lng: 126.554732, lat: 45.816248, description: '北校区主入口(学海街)' },
]
