/**
 * Dijkstra 最短路径算法
 * 基于校园道路网络进行路径规划
 */

import {
  roadNodes,
  roadEdges,
  haversine,
  type RoadNode,
} from '../data/roadNetwork'

interface GraphEdge {
  to: string
  weight: number
}

// 构建邻接表（双向图）
function buildGraph(): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>()

  // 初始化所有节点
  for (const node of roadNodes) {
    graph.set(node.id, [])
  }

  const nodeMap = new Map(roadNodes.map(n => [n.id, n]))

  for (const edge of roadEdges) {
    const fromNode = nodeMap.get(edge.from)
    const toNode = nodeMap.get(edge.to)
    if (!fromNode || !toNode) continue

    const weight =
      edge.weight ??
      haversine(fromNode.lng, fromNode.lat, toNode.lng, toNode.lat)

    // 双向
    graph.get(edge.from)!.push({ to: edge.to, weight })
    graph.get(edge.to)!.push({ to: edge.from, weight })
  }

  return graph
}

const graph = buildGraph()

/** Dijkstra 求最短路径 */
export function dijkstra(
  startId: string,
  endId: string,
): { path: RoadNode[]; distance: number } | null {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  for (const node of roadNodes) {
    dist.set(node.id, Infinity)
    prev.set(node.id, null)
  }
  dist.set(startId, 0)

  while (true) {
    // 找未访问中距离最小的节点
    let minDist = Infinity
    let current: string | null = null
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < minDist) {
        minDist = d
        current = id
      }
    }
    if (current === null || current === endId) break

    visited.add(current)
    const edges = graph.get(current) ?? []
    for (const edge of edges) {
      if (visited.has(edge.to)) continue
      const newDist = minDist + edge.weight
      if (newDist < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, newDist)
        prev.set(edge.to, current)
      }
    }
  }

  // 回溯路径
  const totalDist = dist.get(endId) ?? Infinity
  if (totalDist === Infinity) return null

  const pathIds: string[] = []
  let cur: string | null = endId
  while (cur) {
    pathIds.unshift(cur)
    cur = prev.get(cur) ?? null
  }

  const nodeMap = new Map(roadNodes.map(n => [n.id, n]))
  const path = pathIds.map(id => nodeMap.get(id)!).filter(Boolean)

  return { path, distance: Math.round(totalDist) }
}

/** 根据 POI ID 找到对应的路网节点 */
export function findNodeByPoiId(poiId: number): RoadNode | undefined {
  return roadNodes.find(n => n.poiId === poiId)
}
