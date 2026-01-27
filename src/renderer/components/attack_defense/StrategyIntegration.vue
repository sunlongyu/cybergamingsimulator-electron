<template>
  <div class="module-page">
    <div class="module-header">
      <div>
        <h2>智能策略集成</h2>
        <p>面向 SG-MAPPO 的模型训练、管理与推理配置（一期为占位）。</p>
      </div>
      <div class="header-actions">
        <el-select
          v-model="activeScenarioId"
          placeholder="选择场景配置"
          class="scenario-select"
          @change="onScenarioChange"
        >
          <el-option v-for="config in scenarioConfigs" :key="config.id" :label="config.name" :value="config.id" />
        </el-select>
        <el-button type="primary" @click="openTrainingDialog">启动训练</el-button>
        <el-button @click="openUploadDialog">导入模型</el-button>
      </div>
    </div>
    <div class="module-body">
      <el-card shadow="never" class="config-card">
        <template #header>
          <div class="card-header">
            <span>模型列表</span>
            <el-tag type="info" effect="plain">Mock</el-tag>
          </div>
        </template>
        <el-table :data="filteredModels" style="width: 100%">
          <el-table-column prop="name" label="模型名称" />
          <el-table-column prop="scene" label="适用场景" />
          <el-table-column prop="version" label="版本" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ready' ? 'success' : 'warning'">
                {{ row.status === 'ready' ? '可用' : '训练中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link @click="setAsActive(row)">设为默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-card shadow="never" class="config-card">
        <template #header>
          <div class="card-header">
            <span>策略接入说明</span>
            <el-tag type="success" effect="plain">建议流程</el-tag>
          </div>
        </template>
        <div class="guide-list">
          <div class="guide-item">
            1. 在“攻防环境设置”中配置场景参数和拓扑，选择 SG-MAPPO 模型。
          </div>
          <div class="guide-item">
            2. 在本模块进行模型训练或导入，输出可复用的策略文件。
          </div>
          <div class="guide-item">
            3. 在“攻防实时推演”中加载模型进行在线推理，驱动防御决策。
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showTrainingDialog" title="SG-MAPPO 训练配置" width="520px">
      <el-form label-width="120px">
        <el-form-item label="训练场景">
          <el-input v-model="trainingForm.scene" placeholder="例如：电网控制区" />
        </el-form-item>
        <el-form-item label="训练轮数">
          <el-input-number v-model="trainingForm.epochs" :min="10" :max="5000" />
        </el-form-item>
        <el-form-item label="学习率">
          <el-input-number v-model="trainingForm.learningRate" :step="0.0001" :min="0.0001" :max="0.01" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="trainingForm.notes" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTrainingDialog = false">取消</el-button>
        <el-button type="primary" @click="startTraining">提交训练</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showUploadDialog" title="导入模型" width="420px">
      <div class="upload-placeholder">
        <el-icon><Upload /></el-icon>
        <p>二期接入模型文件上传与校验</p>
      </div>
      <template #footer>
        <el-button @click="showUploadDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Upload } from '@element-plus/icons-vue'
import {
  getScenarioConfigs,
  getActiveScenarioConfig,
  setActiveScenarioConfigId,
  getStrategyModels,
  saveStrategyModel,
  getStrategyModelsByScenario,
  setActiveStrategyModelId
} from '@/core/configStore'

export default {
  name: 'StrategyIntegration',
  components: {
    Upload
  },
  data() {
    return {
      showTrainingDialog: false,
      showUploadDialog: false,
      scenarioConfigs: [],
      activeScenarioId: '',
      trainingForm: {
        scene: '电网控制区',
        epochs: 1200,
        learningRate: 0.0005,
        notes: ''
      },
      modelList: []
    }
  },
  computed: {
    filteredModels() {
      if (!this.activeScenarioId) return this.modelList
      return getStrategyModelsByScenario(this.activeScenarioId)
    }
  },
  created() {
    this.loadScenarioConfigs()
    this.loadModels()
  },
  methods: {
    openTrainingDialog() {
      this.showTrainingDialog = true
    },
    openUploadDialog() {
      this.showUploadDialog = true
    },
    startTraining() {
      const scenario = this.scenarioConfigs.find((item) => item.id === this.activeScenarioId)
      const model = {
        id: `model-${Date.now()}`,
        name: `${scenario ? scenario.name : this.trainingForm.scene} - SG-MAPPO`,
        scene: scenario ? scenario.name : this.trainingForm.scene,
        version: 'v1.0',
        status: 'training',
        scenarioId: scenario ? scenario.id : ''
      }
      this.modelList = saveStrategyModel(model)
      this.$message.success('已提交训练任务（Mock）')
      this.showTrainingDialog = false
    },
    setAsActive(row) {
      setActiveStrategyModelId(row.id)
      this.$message.success(`已选择模型：${row.name}`)
    },
    loadScenarioConfigs() {
      this.scenarioConfigs = getScenarioConfigs()
      const active = getActiveScenarioConfig()
      if (active) {
        this.activeScenarioId = active.id
        this.trainingForm.scene = active.name
      }
    },
    onScenarioChange(configId) {
      const selected = this.scenarioConfigs.find((item) => item.id === configId)
      if (selected) {
        this.trainingForm.scene = selected.name
        setActiveScenarioConfigId(selected.id)
      }
    },
    loadModels() {
      this.modelList = getStrategyModels()
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

.scenario-select {
  width: 220px;
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
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
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

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: #41516a;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: #6b7a90;
}

@media (max-width: 1200px) {
  .module-body {
    grid-template-columns: 1fr;
  }
}
</style>
