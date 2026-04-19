<script setup lang="ts">
</script>

<template>
  <div style="padding: 24px">
    <n-space vertical :size="20">
      <n-card title="基于GIS的校园导航与POI查询系统">
        <n-space vertical :size="12">
          <n-tag type="info" size="small" :bordered="false">哈尔滨商业大学毕业设计</n-tag>
          <n-text>
            本系统基于WebGIS技术，为校园用户提供地图浏览、兴趣点查询和智能路径规划等功能。
            系统采用Visibility Graph算法进行避障寻路，支持3D建筑可视化，并提供完整的后台管理功能。
          </n-text>
          <n-h3>主要功能</n-h3>
          <n-timeline>
            <n-timeline-item type="success" title="3D校园地图" content="基于MapLibre GL JS渲染矢量瓦片地图，支持3D建筑物可视化、深色主题" />
            <n-timeline-item type="info" title="POI标注与查询" content="标注教学楼、食堂、图书馆等兴趣点，支持分类筛选和关键词搜索" />
            <n-timeline-item type="warning" title="智能路径规划" content="基于Visibility Graph避障算法，自动绕开建筑物，计算步行距离与时间" />
            <n-timeline-item type="success" title="用户与权限管理" content="支持用户注册登录、角色权限控制（管理员/普通用户/游客）" />
            <n-timeline-item type="info" title="数据统计" content="提供POI分布、导航热力、用户行为等多维度可视化图表" />
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
                <tr><td>地图引擎</td><td>MapLibre GL JS</td></tr>
                <tr><td>数据可视化</td><td>ECharts 5</td></tr>
                <tr><td>后端服务</td><td>Express (Node.js)</td></tr>
                <tr><td>数据库</td><td>sql.js (SQLite)</td></tr>
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
                <tr><td>地图底图</td><td>OpenStreetMap 矢量瓦片</td></tr>
                <tr><td>建筑轮廓</td><td>OSM Building Footprints</td></tr>
                <tr><td>POI数据</td><td>高德POI API + 人工标注</td></tr>
                <tr><td>坐标系</td><td>WGS-84 (EPSG:4326)</td></tr>
                <tr><td>寻路算法</td><td>Visibility Graph + Dijkstra</td></tr>
                <tr><td>目标校园</td><td>哈尔滨商业大学（北校区）</td></tr>
              </tbody>
            </n-table>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-card title="系统架构">
        <n-text>
          前端 (Vue3 + MapLibre GL JS) ←→ REST API (Express) ←→ SQLite (sql.js)
        </n-text>
        <n-text depth="3" style="display:block;margin-top:8px;font-size:12px">
          前端通过REST API与后端通信，后端使用sql.js在内存中加载SQLite数据库文件，
          提供用户认证、POI管理、导航日志记录和数据统计等接口。
        </n-text>
      </n-card>
    </n-space>
  </div>
</template>
