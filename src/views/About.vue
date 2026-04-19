<script setup lang="ts">
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <n-card title="系统简介">
        <n-space vertical :size="12">
          <n-text>
            本系统是基于GIS的校园导航与POI查询系统，旨在解决新生或访客在大型校园中找路困难的问题。
          </n-text>
          <n-h3>主要功能</n-h3>
          <n-timeline>
            <n-timeline-item type="success" title="校园电子地图" content="基于高德地图API，绘制校园主要建筑、道路的地图，支持深色主题" />
            <n-timeline-item type="info" title="POI标注与查询" content="标注教学楼、食堂、图书馆等兴趣点，支持分类筛选和关键词搜索" />
            <n-timeline-item type="warning" title="路径规划" content="支持两点间步行路径规划，显示距离和预计时间" />
            <n-timeline-item type="success" title="数据统计" content="提供POI类型分布、数量统计、地理分布等可视化图表" />
          </n-timeline>
        </n-space>
      </n-card>

      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-card title="技术栈">
            <n-table :bordered="false" size="small">
              <tbody>
                <tr><td>前端框架</td><td>Vue 3 + TypeScript</td></tr>
                <tr><td>UI组件库</td><td>Naive UI</td></tr>
                <tr><td>地图引擎</td><td>高德地图 JS API 2.0</td></tr>
                <tr><td>数据可视化</td><td>ECharts 5</td></tr>
                <tr><td>构建工具</td><td>Vite</td></tr>
                <tr><td>路由</td><td>Vue Router 4</td></tr>
              </tbody>
            </n-table>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="数据来源">
            <n-table :bordered="false" size="small">
              <tbody>
                <tr><td>地图底图</td><td>高德地图</td></tr>
                <tr><td>POI数据</td><td>高德地图POI搜索API</td></tr>
                <tr><td>坐标系</td><td>GCJ-02（国测局坐标）</td></tr>
                <tr><td>路径规划</td><td>高德步行导航服务</td></tr>
                <tr><td>目标校园</td><td>哈尔滨商业大学（北校区）</td></tr>
              </tbody>
            </n-table>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </div>
</template>
