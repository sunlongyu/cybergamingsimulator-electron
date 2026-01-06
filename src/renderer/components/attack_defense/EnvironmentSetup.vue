<template>
  <div class="module-page">
    <div class="module-header">
      <div>
        <h2>攻防环境设置</h2>
        <p>配置网络拓扑与信号博弈参数，生成可复现实验场景。</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openConfigPreview">配置预览</el-button>
        <el-button @click="saveScenario">保存配置</el-button>
      </div>
    </div>
    <div class="module-body">
      <section class="topology-panel">
        <NetworkTopo />
      </section>
      <section class="config-panel">
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>场景参数</span>
              <el-tag type="info" effect="plain">Mock 数据</el-tag>
            </div>
          </template>
          <el-form :model="scenarioConfig" label-width="120px">
            <el-form-item label="场景名称">
              <el-input v-model="scenarioConfig.name" />
            </el-form-item>
            <el-form-item label="场景说明">
              <el-input v-model="scenarioConfig.description" type="textarea" rows="2" />
            </el-form-item>
            <el-form-item label="最大回合数">
              <el-input-number v-model="scenarioConfig.parameters.maxRounds" :min="1" :max="50" />
            </el-form-item>
            <el-form-item label="信号噪声">
              <el-slider v-model="scenarioConfig.parameters.signalNoise" :min="0" :max="1" :step="0.05" />
            </el-form-item>
            <el-form-item label="伪装成本">
              <el-input-number v-model="scenarioConfig.parameters.deceptionCost" :min="0" :max="2" :step="0.05" />
            </el-form-item>
            <el-form-item label="攻击成本">
              <el-input-number v-model="scenarioConfig.parameters.attackCost" :min="0" :max="3" :step="0.05" />
            </el-form-item>
            <el-divider content-position="left">收益矩阵（Mock）</el-divider>
            <el-form-item label="攻击成功收益">
              <el-input-number v-model="scenarioConfig.parameters.rewardMatrix.attackerSuccess" :min="-5" :max="5" />
            </el-form-item>
            <el-form-item label="攻击失败收益">
              <el-input-number v-model="scenarioConfig.parameters.rewardMatrix.attackerFail" :min="-5" :max="5" />
            </el-form-item>
            <el-form-item label="防御成功收益">
              <el-input-number v-model="scenarioConfig.parameters.rewardMatrix.defenderSuccess" :min="-5" :max="5" />
            </el-form-item>
            <el-form-item label="防御失败收益">
              <el-input-number v-model="scenarioConfig.parameters.rewardMatrix.defenderFail" :min="-5" :max="5" />
            </el-form-item>
            <el-divider content-position="left">策略选择</el-divider>
            <el-form-item label="策略类型">
              <el-select v-model="scenarioConfig.strategy.mode" placeholder="请选择策略">
                <el-option label="规则策略" value="rule" />
                <el-option label="随机策略" value="random" />
                <el-option label="SG-MAPPO 模型" value="sg-mappo" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="scenarioConfig.strategy.mode === 'sg-mappo'" label="模型选择">
              <el-select v-model="scenarioConfig.strategy.modelId" placeholder="请选择模型">
                <el-option v-for="model in modelOptions" :key="model.id" :label="model.name" :value="model.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="模型说明">
              <el-input v-model="scenarioConfig.strategy.modelName" disabled />
            </el-form-item>
          </el-form>
        </el-card>
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>拓扑摘要</span>
              <el-tag type="success" effect="plain">可拓展</el-tag>
            </div>
          </template>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">节点数</div>
              <div class="summary-value">{{ scenarioConfig.topology.nodes.length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">链路数</div>
              <div class="summary-value">{{ scenarioConfig.topology.links.length }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">关键区域</div>
              <div class="summary-value">核心区 / 现场区 / DMZ</div>
            </div>
          </div>
        </el-card>
      </section>
    </div>
    <el-dialog v-model="showConfigPreview" title="场景配置预览" width="640px">
      <pre class="config-preview">{{ formattedScenario }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import NetworkTopo from '@/components/network_components/NetworkTopo.vue'
import { getMockScenarioConfig } from '@/core/mockData'

export default {
  name: 'EnvironmentSetup',
  components: {
    NetworkTopo
  },
  data() {
    return {
      scenarioConfig: getMockScenarioConfig(),
      showConfigPreview: false,
      modelOptions: [
        { id: 'model-001', name: 'SG-MAPPO 基线模型' },
        { id: 'model-002', name: 'SG-MAPPO 电网场景模型' }
      ]
    }
  },
  computed: {
    formattedScenario() {
      return JSON.stringify(this.scenarioConfig, null, 2)
    }
  },
  watch: {
    'scenarioConfig.strategy.modelId'(newVal) {
      const current = this.modelOptions.find((item) => item.id === newVal)
      if (current) {
        this.scenarioConfig.strategy.modelName = current.name
      }
    },
    'scenarioConfig.strategy.mode'(newVal) {
      if (newVal !== 'sg-mappo') {
        this.scenarioConfig.strategy.modelId = ''
        this.scenarioConfig.strategy.modelName = newVal === 'random' ? '随机策略（默认）' : '规则策略（默认）'
      }
    }
  },
  methods: {
    openConfigPreview() {
      this.showConfigPreview = true
    },
    saveScenario() {
      this.$message.success('已保存场景配置（Mock）')
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

.config-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.config-card {
  border-radius: 12px;
  border: 1px solid #eef1f6;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  background: #f5f7fb;
  border-radius: 10px;
  padding: 12px;
}

.summary-label {
  color: #6b7a90;
  font-size: 12px;
}

.summary-value {
  font-size: 16px;
  margin-top: 6px;
  font-weight: 600;
}

.config-preview {
  background: #0f172a;
  color: #d6e4ff;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 380px;
  overflow: auto;
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
