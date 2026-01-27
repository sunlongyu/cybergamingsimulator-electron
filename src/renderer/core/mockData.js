const defaultScenarioConfig = {
  id: 'scenario-electric-grid-01',
  name: '电网控制区仿真场景',
  description: '面向电网调度中心的攻防信号博弈实验场景（Mock）',
  topology: {
    nodes: [
      { id: 'ccs', label: '调度中心', type: 'control-center', zone: 'core' },
      { id: 'scada-1', label: 'SCADA 主站', type: 'scada', zone: 'core' },
      { id: 'rtu-1', label: 'RTU-1', type: 'rtu', zone: 'field' },
      { id: 'rtu-2', label: 'RTU-2', type: 'rtu', zone: 'field' },
      { id: 'hm-1', label: '蜜罐-1', type: 'honeypot', zone: 'dmz' }
    ],
    links: [
      { id: 'link-ccs-scada', from: 'ccs', to: 'scada-1', type: 'control' },
      { id: 'link-scada-rtu-1', from: 'scada-1', to: 'rtu-1', type: 'field' },
      { id: 'link-scada-rtu-2', from: 'scada-1', to: 'rtu-2', type: 'field' },
      { id: 'link-scada-hm', from: 'scada-1', to: 'hm-1', type: 'honeypot' }
    ]
  },
  parameters: {
    maxRounds: 12,
    signalNoise: 0.15,
    deceptionCost: 0.2,
    attackCost: 0.35,
    rewardMatrix: {
      attackerSuccess: 3,
      attackerFail: -1,
      defenderSuccess: 2,
      defenderFail: -2
    }
  },
  strategy: {
    mode: 'rule',
    modelId: '',
    modelName: '规则策略（默认）'
  }
}

const mockSimulationRounds = [
  {
    round: 1,
    phase: 'probe',
    attackerAction: '主机探测',
    defenderAction: '无',
    attackerBelief: 0.38,
    signal: '发现疑似 RTU 服务端口',
    payoff: { attacker: 0.2, defender: -0.1 },
    events: [
      { time: '00:00:05', actor: '攻击者', message: '对 rtu-1 进行端口扫描', level: 'info' },
      { time: '00:00:09', actor: '系统', message: '返回端口存活信息', level: 'success' }
    ]
  },
  {
    round: 2,
    phase: 'deception',
    attackerAction: '继续探测',
    defenderAction: '蜜罐伪装',
    attackerBelief: 0.46,
    signal: 'SCADA 节点出现异常响应',
    payoff: { attacker: -0.1, defender: 0.3 },
    events: [
      { time: '00:00:15', actor: '防御者', message: '启用蜜罐-1伪装策略', level: 'warning' },
      { time: '00:00:20', actor: '系统', message: '攻击流量重定向至蜜罐', level: 'success' }
    ]
  },
  {
    round: 3,
    phase: 'belief_update',
    attackerAction: '信念更新',
    defenderAction: '情报分析',
    attackerBelief: 0.57,
    signal: '观测到新的控制链路',
    payoff: { attacker: 0.4, defender: -0.2 },
    events: [
      { time: '00:00:26', actor: '系统', message: '更新攻击者信念至 0.57', level: 'info' }
    ]
  },
  {
    round: 4,
    phase: 'attack',
    attackerAction: '攻击 SCADA',
    defenderAction: '主动防护',
    attackerBelief: 0.52,
    signal: '攻击被拦截',
    payoff: { attacker: -0.6, defender: 0.8 },
    events: [
      { time: '00:00:33', actor: '攻击者', message: '对 scada-1 发起攻击', level: 'danger' },
      { time: '00:00:40', actor: '防御者', message: '拦截攻击并记录溯源', level: 'success' }
    ]
  }
]

const mockAnalysisData = {
  beliefCurve: [
    { round: 1, belief: 0.38 },
    { round: 2, belief: 0.46 },
    { round: 3, belief: 0.57 },
    { round: 4, belief: 0.52 },
    { round: 5, belief: 0.61 }
  ],
  cumulativeRewards: [
    { round: 1, attacker: 0.2, defender: -0.1 },
    { round: 2, attacker: 0.1, defender: 0.2 },
    { round: 3, attacker: 0.5, defender: 0.0 },
    { round: 4, attacker: -0.1, defender: 0.8 },
    { round: 5, attacker: 0.4, defender: 1.1 }
  ],
  strategyDistribution: [
    { name: '主机探测', value: 35 },
    { name: '链路探测', value: 18 },
    { name: '蜜罐伪装', value: 27 },
    { name: '主动防护', value: 20 }
  ],
  attackSuccessRate: {
    total: 28,
    success: 9,
    rate: 0.32
  }
}

function getMockScenarioConfig() {
  return JSON.parse(JSON.stringify(defaultScenarioConfig))
}

function getMockSimulationRounds() {
  return JSON.parse(JSON.stringify(mockSimulationRounds))
}

function getMockAnalysisData() {
  return JSON.parse(JSON.stringify(mockAnalysisData))
}

export { getMockScenarioConfig, getMockSimulationRounds, getMockAnalysisData }
