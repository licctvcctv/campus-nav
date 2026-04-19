/**
 * 基于 Visibility Graph 的避障最短路径算法
 *
 * 原理：将建筑多边形顶点构成可见性图，只连接互相"看得见"
 * （连线不穿过任何建筑内部）的顶点对，然后在图上跑最短路径。
 *
 * 关键处理：如果起终点在建筑内部，先投影到建筑外围再寻路。
 */

// @ts-ignore
import VisibilityGraph from 'visibility-graph.js'
// @ts-ignore
import pathFinder from 'ngraph.path'
import realBuildingsData from '../data/real_buildings.json'

const BUFFER = 0.00008 // 约6-7米缓冲
const EPSILON = 1e-7

// 缓存原始多边形（用于点在建筑内检测）和缓冲多边形（用于寻路）
let rawPolygons: number[][][] = []
let bufferedGeometry: any = null
let vg: any = null

function init() {
  rawPolygons = []
  const bufferedPolygons: number[][][] = []

  for (const feature of (realBuildingsData as any).features) {
    const coords: number[][] = feature.geometry.coordinates[0]
    if (coords.length < 4) continue
    rawPolygons.push(coords)
    bufferedPolygons.push(bufferPolygon(coords, BUFFER))
  }

  bufferedGeometry = {
    type: 'MultiPolygon' as const,
    coordinates: bufferedPolygons.map(p => [p]),
  }
  vg = new VisibilityGraph(bufferedGeometry)
}

function ringArea(coords: number[][]): number {
  let sum = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i]
    const [x2, y2] = coords[i + 1]
    sum += x1 * y2 - x2 * y1
  }
  return sum / 2
}

// 简单的多边形外扩
function bufferPolygon(coords: number[][], offset: number): number[][] {
  const n = coords.length
  if (n < 4) return coords
  const orientation = ringArea(coords)
  const outwardSign = orientation >= 0 ? -1 : 1
  const result: number[][] = []
  for (let i = 0; i < n - 1; i++) {
    const prev = coords[(i - 1 + n - 1) % (n - 1)]
    const curr = coords[i]
    const next = coords[(i + 1) % (n - 1)]
    const dx1 = curr[0] - prev[0], dy1 = curr[1] - prev[1]
    const dx2 = next[0] - curr[0], dy2 = next[1] - curr[1]
    const nx1 = -dy1 * outwardSign, ny1 = dx1 * outwardSign
    const nx2 = -dy2 * outwardSign, ny2 = dx2 * outwardSign
    const l1 = Math.hypot(nx1, ny1) || 1, l2 = Math.hypot(nx2, ny2) || 1
    const nx = (nx1 / l1 + nx2 / l2) / 2, ny = (ny1 / l1 + ny2 / l2) / 2
    const l = Math.hypot(nx, ny) || 1
    result.push([curr[0] + (nx / l) * offset, curr[1] + (ny / l) * offset])
  }
  result.push(result[0])
  return result
}

// ======= 点在多边形内检测（射线法）=======
function pointInPolygon(px: number, py: number, polygon: number[][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

// 找到点所在的建筑索引（-1表示不在任何建筑内）
function findContainingBuilding(lng: number, lat: number): number {
  for (let i = 0; i < rawPolygons.length; i++) {
    if (pointInPolygon(lng, lat, rawPolygons[i])) return i
  }
  return -1
}

// 将建筑内部的点投影到建筑外围最近的点（缓冲边界上）
function projectOutside(lng: number, lat: number, buildingIdx: number): [number, number] {
  const buffered = bufferPolygon(rawPolygons[buildingIdx], BUFFER * 1.5)
  let bestDist = Infinity
  let bestPoint: [number, number] = [lng, lat]

  // 找缓冲多边形边界上最近的点
  for (let i = 0; i < buffered.length - 1; i++) {
    const [x1, y1] = buffered[i]
    const [x2, y2] = buffered[i + 1]
    const proj = projectToSegment(lng, lat, x1, y1, x2, y2)
    const d = (proj[0] - lng) ** 2 + (proj[1] - lat) ** 2
    if (d < bestDist) {
      bestDist = d
      bestPoint = proj
    }
  }
  return bestPoint
}

// 点到线段的投影
function projectToSegment(
  px: number, py: number,
  x1: number, y1: number, x2: number, y2: number,
): [number, number] {
  const dx = x2 - x1, dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return [x1, y1]
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return [x1 + t * dx, y1 + t * dy]
}

export interface PathResult {
  coordinates: [number, number][]
  distance: number
  start: [number, number]
  end: [number, number]
  adjustedStart: boolean
  adjustedEnd: boolean
}

function distanceSq(a: [number, number], b: [number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

function samePoint(a: [number, number], b: [number, number]): boolean {
  return distanceSq(a, b) <= EPSILON * EPSILON
}

/**
 * 计算避障最短路径
 */
export function findShortestPath(
  start: [number, number],
  end: [number, number],
): PathResult | null {
  try {
    if (!vg) init()

    // 检查起终点是否在建筑内部，如果是则投影到外围
    let actualStart = start
    let actualEnd = end
    const startBuilding = findContainingBuilding(start[0], start[1])
    const endBuilding = findContainingBuilding(end[0], end[1])
    if (startBuilding >= 0) actualStart = projectOutside(start[0], start[1], startBuilding)
    if (endBuilding >= 0) actualEnd = projectOutside(end[0], end[1], endBuilding)

    const graph = new VisibilityGraph(bufferedGeometry)
    const nodes = graph.addStartAndEndPointsToGraph(
      { type: 'Feature', geometry: { type: 'Point', coordinates: actualStart }, properties: {} },
      { type: 'Feature', geometry: { type: 'Point', coordinates: actualEnd }, properties: {} },
    )

    const finder = pathFinder.nba(graph.graph, {
      distance(fromNode: any, toNode: any) {
        const dx = fromNode.data.x - toNode.data.x
        const dy = fromNode.data.y - toNode.data.y
        return Math.sqrt(dx * dx + dy * dy)
      },
    })

    const result = finder.find(nodes.startNode.nodeId, nodes.endNode.nodeId)
    if (!result || result.length === 0) return null

    const coordinates: [number, number][] = []
    for (const node of result) {
      coordinates.push([node.data.x, node.data.y])
    }

    const directOrderCost = distanceSq(coordinates[0], actualStart) + distanceSq(coordinates[coordinates.length - 1], actualEnd)
    const reversedOrderCost = distanceSq(coordinates[0], actualEnd) + distanceSq(coordinates[coordinates.length - 1], actualStart)
    if (reversedOrderCost < directOrderCost) {
      coordinates.reverse()
    }

    if (!samePoint(coordinates[0], actualStart)) {
      coordinates.unshift(actualStart)
    }
    if (!samePoint(coordinates[coordinates.length - 1], actualEnd)) {
      coordinates.push(actualEnd)
    }

    let distance = 0
    for (let i = 1; i < coordinates.length; i++) {
      distance += haversine(coordinates[i - 1][0], coordinates[i - 1][1], coordinates[i][0], coordinates[i][1])
    }

    return {
      coordinates,
      distance: Math.round(distance),
      start: actualStart,
      end: actualEnd,
      adjustedStart: startBuilding >= 0,
      adjustedEnd: endBuilding >= 0,
    }
  } catch (e) {
    console.warn('Visibility graph pathfinding failed:', e)
    return null
  }
}

function haversine(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function resetVisibilityGraph() { vg = null; bufferedGeometry = null; rawPolygons = [] }
