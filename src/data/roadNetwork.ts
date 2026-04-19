/**
 * 校园道路网络 — 用于 Dijkstra 最短路径规划
 *
 * nodes: 道路关键节点（交叉口、建筑入口）
 * edges: 节点之间的连接关系（双向）
 *
 * 坐标系：WGS84（与POI和底图一致）
 */

export interface RoadNode {
  id: string
  lng: number
  lat: number
  name?: string        // 可选：对应POI名称
  poiId?: number       // 可选：关联的POI id
}

export interface RoadEdge {
  from: string
  to: string
  weight?: number     // 距离（米），不填则自动计算
}

// 根据两点经纬度计算距离（Haversine公式，单位：米）
export function haversine(
  lng1: number, lat1: number,
  lng2: number, lat2: number,
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ====== 道路节点 ======
// POI节点 + 路口节点，组成完整路网
export const roadNodes: RoadNode[] = [
  // --- POI 节点（对应 pois.ts 中的地点）---
  { id: 'p1',  lng: 126.557574, lat: 45.814973, name: '校园中心', poiId: 1 },
  { id: 'p2',  lng: 126.558340, lat: 45.818426, name: 'A区', poiId: 2 },
  { id: 'p3',  lng: 126.557574, lat: 45.810403, name: 'B区', poiId: 3 },
  { id: 'p4',  lng: 126.553756, lat: 45.808913, name: 'C区', poiId: 4 },
  { id: 'p5',  lng: 126.559693, lat: 45.815675, name: '会计学院', poiId: 5 },
  { id: 'p6',  lng: 126.559729, lat: 45.816598, name: '设计艺术学院', poiId: 6 },
  { id: 'p7',  lng: 126.558102, lat: 45.819532, name: '体育学院', poiId: 7 },
  { id: 'p8',  lng: 126.556641, lat: 45.810416, name: '能源与建筑学院', poiId: 8 },
  { id: 'p9',  lng: 126.556236, lat: 45.809636, name: '基础科学学院', poiId: 9 },
  { id: 'p10', lng: 126.553998, lat: 45.810732, name: '轻工学院', poiId: 10 },
  { id: 'p11', lng: 126.553854, lat: 45.809888, name: '管理学院', poiId: 11 },
  { id: 'p12', lng: 126.558343, lat: 45.817477, name: '图书馆', poiId: 12 },
  { id: 'p13', lng: 126.559468, lat: 45.820631, name: 'A区食堂', poiId: 13 },
  { id: 'p14', lng: 126.560325, lat: 45.819262, name: '体育场', poiId: 14 },
  { id: 'p15', lng: 126.557692, lat: 45.819401, name: '体育馆', poiId: 15 },
  { id: 'p17', lng: 126.557200, lat: 45.818724, name: '足球场', poiId: 17 },
  { id: 'p19', lng: 126.560092, lat: 45.822703, name: '研究生宿舍', poiId: 19 },
  { id: 'p20', lng: 126.559353, lat: 45.822043, name: '14号宿舍', poiId: 20 },
  { id: 'p22', lng: 126.556910, lat: 45.821922, name: '18号宿舍', poiId: 22 },
  { id: 'p23', lng: 126.553542, lat: 45.807524, name: 'C区学生公寓', poiId: 23 },
  { id: 'p24', lng: 126.557023, lat: 45.816976, name: '行政楼', poiId: 24 },
  { id: 'p26', lng: 126.560415, lat: 45.812902, name: '邮局', poiId: 26 },
  { id: 'p27', lng: 126.553489, lat: 45.812283, name: '教师公寓', poiId: 27 },
  { id: 'p28', lng: 126.557568, lat: 45.811654, name: 'B区食堂', poiId: 28 },
  { id: 'p29', lng: 126.554732, lat: 45.816248, name: '校门(北门)', poiId: 29 },

  // --- 路口/道路中间节点（沿实际道路布设，避开建筑）---
  // 中轴线（学海街纵向）
  { id: 'r1',  lng: 126.557570, lat: 45.816400, name: '中心路口' },
  { id: 'r1a', lng: 126.557570, lat: 45.817200, name: '中轴线中段' },
  { id: 'r2',  lng: 126.557570, lat: 45.818000, name: 'A区南路口' },
  { id: 'r2a', lng: 126.557570, lat: 45.819000, name: '体育区路口' },
  { id: 'r3',  lng: 126.557570, lat: 45.820000, name: 'A区北路口' },
  { id: 'r3a', lng: 126.557570, lat: 45.821000, name: '宿舍南路口' },

  // 东侧纵路（丁香大道方向）
  { id: 'r4',  lng: 126.559700, lat: 45.818000, name: '东主路中段' },
  { id: 'r4a', lng: 126.559700, lat: 45.819000, name: '东主路体育段' },
  { id: 'r5',  lng: 126.559700, lat: 45.820000, name: '东主路北段' },
  { id: 'r5a', lng: 126.559700, lat: 45.821000, name: '东主路宿舍段' },
  { id: 'r9',  lng: 126.559700, lat: 45.821500, name: '宿舍区路口' },

  // 西侧纵路
  { id: 'r10', lng: 126.555500, lat: 45.816400, name: '校门路口' },
  { id: 'r10a',lng: 126.555500, lat: 45.815400, name: '西路南段' },
  { id: 'r8',  lng: 126.555500, lat: 45.814500, name: '西主路中段' },
  { id: 'r11', lng: 126.555500, lat: 45.818000, name: '西侧A区入口' },
  { id: 'r12', lng: 126.555500, lat: 45.820000, name: '西侧宿舍路口' },

  // B区内部节点
  { id: 'r6',  lng: 126.557570, lat: 45.812500, name: 'B区路口' },
  { id: 'r6a', lng: 126.557570, lat: 45.811000, name: 'B区南段' },
  { id: 'r7',  lng: 126.555500, lat: 45.810500, name: 'BC区路口' },
  { id: 'r7a', lng: 126.555500, lat: 45.809000, name: 'C区路口' },
]

// ====== 道路边 ======
// 双向通行，weight 自动根据节点距离计算
export const roadEdges: RoadEdge[] = [
  // === 中轴线（南北主干道）===
  { from: 'p1',  to: 'r1' },
  { from: 'r1',  to: 'r1a' },
  { from: 'r1a', to: 'r2' },
  { from: 'r2',  to: 'r2a' },
  { from: 'r2a', to: 'r3' },
  { from: 'r3',  to: 'r3a' },
  { from: 'r2',  to: 'p2' },

  // === 东侧纵向路 ===
  { from: 'r4',  to: 'r4a' },
  { from: 'r4a', to: 'r5' },
  { from: 'r5',  to: 'r5a' },
  { from: 'r5a', to: 'r9' },

  // === 横向连接（中部 — 沿道路绕过建筑）===
  { from: 'r1',  to: 'r10' },   // 中心→西
  { from: 'r1',  to: 'p5' },    // 中心→会计学院
  { from: 'p5',  to: 'r4' },    // 会计学院→东主路
  { from: 'r1a', to: 'p24' },   // 中轴中段→行政楼
  { from: 'p24', to: 'p12' },   // 行政楼→图书馆
  { from: 'p12', to: 'r4' },    // 图书馆→东主路
  { from: 'r4',  to: 'p6' },    // 东主路→设计艺术学院

  // === A区北部（体育区 — 路径绕操场外围）===
  { from: 'r2a', to: 'p15' },   // 体育区路口→体育馆
  { from: 'r2a', to: 'p17' },   // 体育区路口→足球场
  { from: 'p15', to: 'p7' },    // 体育馆→体育学院
  { from: 'r3',  to: 'r5' },    // A区北路口→东主路北段
  { from: 'r4a', to: 'p14' },   // 东主路体育段→体育场
  { from: 'r5',  to: 'p13' },   // 东主路北段→食堂

  // === 宿舍区 ===
  { from: 'r3a', to: 'p22' },   // 宿舍南路口→18号宿舍
  { from: 'r9',  to: 'p19' },   // 宿舍区路口→研究生宿舍
  { from: 'r9',  to: 'p20' },   // 宿舍区路口→14号宿舍
  { from: 'r5a', to: 'r9' },    // 东主路宿舍段→宿舍区

  // === 西侧纵向路 ===
  { from: 'r10', to: 'r10a' },
  { from: 'r10a',to: 'r8' },
  { from: 'r10', to: 'r11' },
  { from: 'r11', to: 'r12' },
  { from: 'r10', to: 'p29' },   // 校门路口→校门

  // === 西侧横向连接 ===
  { from: 'r11', to: 'r2' },    // 西侧A区→A区南路口
  { from: 'r12', to: 'r3' },    // 西侧宿舍→A区北路口
  { from: 'r12', to: 'r3a' },   // 西侧→宿舍南路口

  // === B区道路 ===
  { from: 'r1',  to: 'r6' },    // 中心→B区
  { from: 'r6',  to: 'r6a' },
  { from: 'r6a', to: 'p3' },    // →B区
  { from: 'r6',  to: 'p28' },   // →B区食堂
  { from: 'r6',  to: 'p8' },    // →能源与建筑学院
  { from: 'p8',  to: 'r6a' },
  { from: 'r6a', to: 'p9' },    // →基础科学学院
  { from: 'r6',  to: 'p26' },   // →邮局

  // === B→C区连接 ===
  { from: 'r6a', to: 'r7' },    // B区南段→BC路口
  { from: 'r8',  to: 'r7' },    // 西主路→BC路口
  { from: 'r8',  to: 'p27' },   // →教师公寓
  { from: 'r8',  to: 'p1' },    // →校园中心

  // === C区道路 ===
  { from: 'r7',  to: 'r7a' },
  { from: 'r7',  to: 'p10' },   // →轻工学院
  { from: 'r7',  to: 'p11' },   // →管理学院
  { from: 'r7a', to: 'p4' },    // →C区
  { from: 'p4',  to: 'p23' },   // →C区学生公寓
]
