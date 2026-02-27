# 项目定位
根据机械负载和伺服运动控制的需求进行伺服系统选型计算的网页工具

# 技术栈约束
前端：Next.js 或 纯 HTML+TailwindCSS
数据：直接写在 JSON 文件中（/data/motors.json）
部署：Vercel

# 强制规则
- **IMPORTANT**: 所有算法模块必须包含论文引用和复杂度分析
- **YOU MUST**: 数据预处理脚本必须包含数据溯源（provenance）记录
- **NEVER**: 不得在生产代码中硬编码超参数

# 文档规范
- 需求文档：`docs/specs/tool-spec.md`
- 算法设计：`docs/plans/sizing-algo.md`
- 数据清单：`docs/data/servo-dataset.md`
