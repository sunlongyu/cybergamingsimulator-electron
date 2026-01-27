const SCENARIO_KEY = 'attackDefenseScenarioConfigs'
const ACTIVE_SCENARIO_KEY = 'attackDefenseActiveScenarioId'
const MODEL_KEY = 'attackDefenseStrategyModels'
const ACTIVE_MODEL_KEY = 'attackDefenseActiveModelId'

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (error) {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getScenarioConfigs() {
  return readJson(SCENARIO_KEY, [])
}

function saveScenarioConfig(config) {
  const configs = getScenarioConfigs()
  const index = configs.findIndex((item) => item.id === config.id)
  if (index >= 0) {
    configs[index] = config
  } else {
    configs.push(config)
  }
  writeJson(SCENARIO_KEY, configs)
  setActiveScenarioConfigId(config.id)
  return configs
}

function setActiveScenarioConfigId(id) {
  window.localStorage.setItem(ACTIVE_SCENARIO_KEY, id)
}

function getActiveScenarioConfigId() {
  return window.localStorage.getItem(ACTIVE_SCENARIO_KEY)
}

function getActiveScenarioConfig() {
  const configs = getScenarioConfigs()
  const activeId = getActiveScenarioConfigId()
  if (!activeId) return configs[0] || null
  return configs.find((item) => item.id === activeId) || configs[0] || null
}

function getStrategyModels() {
  return readJson(MODEL_KEY, [])
}

function saveStrategyModel(model) {
  const models = getStrategyModels()
  const index = models.findIndex((item) => item.id === model.id)
  if (index >= 0) {
    models[index] = model
  } else {
    models.push(model)
  }
  writeJson(MODEL_KEY, models)
  return models
}

function getStrategyModelsByScenario(scenarioId) {
  return getStrategyModels().filter((item) => item.scenarioId === scenarioId)
}

function setActiveStrategyModelId(modelId) {
  window.localStorage.setItem(ACTIVE_MODEL_KEY, modelId)
}

function getActiveStrategyModelId() {
  return window.localStorage.getItem(ACTIVE_MODEL_KEY)
}

export {
  getScenarioConfigs,
  saveScenarioConfig,
  setActiveScenarioConfigId,
  getActiveScenarioConfigId,
  getActiveScenarioConfig,
  getStrategyModels,
  saveStrategyModel,
  getStrategyModelsByScenario,
  setActiveStrategyModelId,
  getActiveStrategyModelId
}
