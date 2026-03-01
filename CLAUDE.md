## 定位
机械负载与伺服运动控制需求的选型计算 Web 工具。

## 技术约束

**前端**: Next.js 或 HTML + TailwindCSS  
**数据**: 静态 JSON `/data/motors.json`  
**部署**: Vercel  

**开发命令**: `npm run dev` (开发), `npm run build` (构建)

## 强制规则

- **IMPORTANT**: 算法模块必须包含论文引用和复杂度分析
- **YOU MUST**: 数据预处理脚本包含数据溯源（provenance）记录
- **NEVER**: 生产代码禁止硬编码超参数

## 文档索引

- 需求: `docs/specs/`
- 算法: `docs/plans/`
- 数据: `docs/data/`

## 工作流检查点

- **UI 修复后**: 运行 Playwright 测试验证真实浏览器环境，不仅代码审查
- **i18n 实施**: 使用 next-intl 时验证静态导出兼容性，构建测试通过后标记完成，注意 4.x API 破坏性变更
- **服务器控制**: 尊重手动控制偏好，不自动启动开发服务器除非明确要求