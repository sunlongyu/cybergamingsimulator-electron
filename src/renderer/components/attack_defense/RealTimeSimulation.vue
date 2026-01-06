<template>
  <div class="module-page">
    <div class="module-header">
      <div>
        <h2>攻防实时推演</h2>
        <p>回合制“探测-伪装-信念更新-攻击决策”流程的实时推演与日志记录。</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :disabled="isPlaying" @click="startSimulation">开始</el-button>
        <el-button :disabled="!isPlaying" @click="pauseSimulation">暂停</el-button>
        <el-button @click="stepSimulation">单步</el-button>
        <el-button type="warning" @click="resetSimulation">重置</el-button>
      </div>
    </div>
    <div class="module-body">
      <section class="topology-panel">
        <NetworkTopo />
      </section>
      <section class="control-panel">
        <el-card shadow="never" class="status-card">
          <template #header>
            <div class="card-header">
              <span>推演状态</span>
              <el-tag :type="isPlaying ? 'success' : 'info'" effect="plain">
                {{ isPlaying ? '运行中' : '暂停' }}
              </el-tag>
            </div>
          </template>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">当前回合</div>
              <div class="status-value">{{ currentRound.round }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">阶段</div>
              <div class="status-value">{{ phaseLabel(currentRound.phase) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">攻击者信念</div>
              <div class="status-value">{{ currentRound.attackerBelief }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">本回合收益</div>
              <div class="status-value">
                A {{ currentRound.payoff.attacker }} / D {{ currentRound.payoff.defender }}
              </div>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="status-card">
          <template #header>
            <div class="card-header">
              <span>动作摘要</span>
              <el-tag type="warning" effect="plain">Mock</el-tag>
            </div>
          </template>
          <div class="action-summary">
            <div class="action-row">
              <span class="label">攻击动作：</span>
              <span class="value">{{ currentRound.attackerAction }}</span>
            </div>
            <div class="action-row">
              <span class="label">防御动作：</span>
              <span class="value">{{ currentRound.defenderAction }}</span>
            </div>
            <div class="action-row">
              <span class="label">观测信号：</span>
              <span class="value">{{ currentRound.signal }}</span>
            </div>
          </div>
        </el-card>
        <el-card shadow="never" class="status-card log-card">
          <template #header>
            <div class="card-header">
              <span>对抗日志流</span>
              <el-tag type="info" effect="plain">滚动</el-tag>
            </div>
          </template>
          <div class="log-list">
            <div v-for="(log, index) in logStream" :key="`${log.time}-${index}`" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-actor">{{ log.actor }}</span>
              <span class="log-message" :class="`log-${log.level}`">{{ log.message }}</span>
            </div>
          </div>
        </el-card>
      </section>
    </div>
  </div>
</template>

<script>
import NetworkTopo from '@/components/network_components/NetworkTopo.vue'
import { getMockSimulationRounds } from '@/core/mockData'

export default {
  name: 'RealTimeSimulation',
  components: {
    NetworkTopo
  },
  data() {
    return {
      rounds: getMockSimulationRounds(),
      currentRoundIndex: 0,
      isPlaying: false,
      timer: null,
      logStream: []
    }
  },
  computed: {
    currentRound() {
      return this.rounds[this.currentRoundIndex]
    }
  },
  mounted() {
    this.resetSimulation()
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    phaseLabel(phase) {
      const map = {
        probe: '探测',
        deception: '伪装',
        belief_update: '信念更新',
        attack: '攻击'
      }
      return map[phase] || phase
    },
    startSimulation() {
      if (this.isPlaying) return
      this.isPlaying = true
      this.timer = setInterval(() => {
        this.stepSimulation()
      }, 1500)
    },
    pauseSimulation() {
      this.isPlaying = false
      this.clearTimer()
    },
    stepSimulation() {
      if (this.currentRoundIndex < this.rounds.length - 1) {
        this.currentRoundIndex += 1
      } else {
        this.isPlaying = false
        this.clearTimer()
      }
      this.appendLogs()
    },
    resetSimulation() {
      this.pauseSimulation()
      this.currentRoundIndex = 0
      this.logStream = []
      this.appendLogs()
    },
    appendLogs() {
      const currentEvents = this.currentRound.events || []
      this.logStream = [...this.logStream, ...currentEvents]
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
.module-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 16px;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 6px rgba(15, 44, 76, 0.06);
}

.module-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.module-header p {
  margin: 0;
  color: #6b7a90;
  font-size: 13px;
}

.module-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  min-height: 0;
}

.topology-panel {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(15, 44, 76, 0.06);
  overflow: hidden;
  min-height: 520px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-card {
  border-radius: 12px;
  border: 1px solid #eef1f6;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  background: #f5f7fb;
  border-radius: 10px;
  padding: 12px;
}

.status-label {
  color: #6b7a90;
  font-size: 12px;
}

.status-value {
  font-size: 16px;
  margin-top: 6px;
  font-weight: 600;
}

.action-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
}

.action-row .label {
  color: #6b7a90;
}

.action-row .value {
  margin-left: 4px;
  font-weight: 600;
}

.log-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-list {
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 8px;
  background: #f9fbff;
  border-radius: 6px;
}

.log-time {
  color: #97a3b6;
  min-width: 60px;
}

.log-actor {
  font-weight: 600;
  color: #2f6ed6;
  min-width: 60px;
}

.log-message {
  flex: 1;
}

.log-info {
  color: #2f6ed6;
}

.log-warning {
  color: #d97706;
}

.log-success {
  color: #16a34a;
}

.log-danger {
  color: #dc2626;
}

@media (max-width: 1200px) {
  .module-body {
    grid-template-columns: 1fr;
  }
  .topology-panel {
    min-height: 420px;
  }
}
</style>
