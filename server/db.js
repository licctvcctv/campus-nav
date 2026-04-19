import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data', 'campus.db')

let db = null

export async function initDB() {
  const SQL = await initSqlJs()

  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
    console.log('  Loaded existing database from', DB_PATH)
  } else {
    db = new SQL.Database()
    console.log('  Created new database')
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS pois (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      lng REAL NOT NULL,
      lat REAL NOT NULL,
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      active INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS nav_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      start_poi TEXT,
      end_poi TEXT,
      distance INTEGER,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Seed POIs if table is empty
  const poiCount = db.exec('SELECT COUNT(*) FROM pois')
  if (poiCount[0].values[0][0] === 0) {
    seedPOIs()
    console.log('  Seeded 29 POIs')
  }

  // Save to disk
  saveDB()

  return db
}

function seedPOIs() {
  const pois = [
    { name: '哈尔滨商业大学(北校区)', type: '地标', lng: 126.557574, lat: 45.814973, description: '校园中心' },
    { name: 'A区', type: '教学区', lng: 126.55834, lat: 45.818426, description: '北校区A区(北区)' },
    { name: 'B区', type: '教学区', lng: 126.557574, lat: 45.810403, description: '北校区B区(东区)' },
    { name: 'C区', type: '教学区', lng: 126.553756, lat: 45.808913, description: '北校区C区(西区)' },
    { name: 'A区会计学院', type: '教学楼', lng: 126.559693, lat: 45.815675, description: '会计学院教学楼' },
    { name: 'A区设计艺术学院', type: '教学楼', lng: 126.559729, lat: 45.816598, description: '设计艺术学院' },
    { name: 'A区体育学院', type: '教学楼', lng: 126.558102, lat: 45.819532, description: '体育学院' },
    { name: 'B区能源与建筑工程学院', type: '教学楼', lng: 126.556641, lat: 45.810416, description: '能源与建筑工程学院' },
    { name: 'B区基础科学学院', type: '教学楼', lng: 126.556236, lat: 45.809636, description: '基础科学学院' },
    { name: 'C区轻工学院', type: '教学楼', lng: 126.553998, lat: 45.810732, description: '轻工学院' },
    { name: 'C区管理学院', type: '教学楼', lng: 126.553854, lat: 45.809888, description: '管理学院' },
    { name: 'A区图书馆', type: '图书馆', lng: 126.558343, lat: 45.817477, description: '北校区A区图书馆' },
    { name: 'A区食堂', type: '食堂', lng: 126.559468, lat: 45.820631, description: '北校区A区学生食堂' },
    { name: 'A区体育场', type: '体育设施', lng: 126.560325, lat: 45.819262, description: '北校区A区体育场(操场)' },
    { name: 'A区体育馆', type: '体育设施', lng: 126.557692, lat: 45.819401, description: '北校区A区室内体育馆' },
    { name: '体育馆(丁香大道)', type: '体育设施', lng: 126.560227, lat: 45.819309, description: '体育馆' },
    { name: 'A区足球场', type: '体育设施', lng: 126.5572, lat: 45.818724, description: '足球场' },
    { name: '体育文化传播发展中心', type: '体育设施', lng: 126.560237, lat: 45.818322, description: '体育文化传播发展中心' },
    { name: 'A区研究生宿舍', type: '宿舍', lng: 126.560092, lat: 45.822703, description: '研究生宿舍区' },
    { name: '第十四学生宿舍', type: '宿舍', lng: 126.559353, lat: 45.822043, description: '14号学生宿舍' },
    { name: 'A区14公寓', type: '宿舍', lng: 126.561613, lat: 45.82064, description: 'A区14号公寓' },
    { name: '第十八学生宿舍', type: '宿舍', lng: 126.55691, lat: 45.821922, description: '18号学生宿舍(北区)' },
    { name: 'C区学生公寓', type: '宿舍', lng: 126.553542, lat: 45.807524, description: 'C区管理学院学生公寓' },
    { name: '行政楼', type: '行政办公', lng: 126.557023, lat: 45.816976, description: '学校行政楼' },
    { name: '征兵工作站', type: '行政办公', lng: 126.557736, lat: 45.819497, description: '北区征兵工作站' },
    { name: '邮局(商大邮电所)', type: '生活服务', lng: 126.560415, lat: 45.812902, description: '中国邮政商大邮电所' },
    { name: '教师公寓', type: '生活服务', lng: 126.553489, lat: 45.812283, description: '商大教师公寓' },
    { name: 'B区食堂(美食街)', type: '食堂', lng: 126.557568, lat: 45.811654, description: 'B区食堂区域，含多家餐饮' },
    { name: '校门(北门/1号门)', type: '出入口', lng: 126.554732, lat: 45.816248, description: '北校区主入口(学海街)' },
  ]

  const stmt = db.prepare('INSERT INTO pois (name, type, lng, lat, description) VALUES (?, ?, ?, ?, ?)')
  for (const poi of pois) {
    stmt.run([poi.name, poi.type, poi.lng, poi.lat, poi.description])
  }
  stmt.free()
}

export function saveDB() {
  if (!db) return
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

export function getDB() {
  return db
}

// Helper: run a query and return array of objects
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

// Helper: run a query and return first row as object or null
export function queryOne(sql, params = []) {
  const results = queryAll(sql, params)
  return results.length > 0 ? results[0] : null
}

// Helper: run an INSERT/UPDATE/DELETE and return changes info
export function execute(sql, params = []) {
  db.run(sql, params)
  const changes = db.getRowsModified()
  const lastId = queryOne('SELECT last_insert_rowid() as id')
  return { changes, lastId: lastId ? lastId.id : null }
}
