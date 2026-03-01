import { MechanismType } from '@/types';
import BallScrewDiagram from './BallScrewDiagram';
import GearboxDiagram from './GearboxDiagram';
import BeltDiagram from './BeltDiagram';
import RackPinionDiagram from './RackPinionDiagram';
import DirectDriveDiagram from './DirectDriveDiagram';

export interface MechanismDiagramProps {
  /** 额外的 CSS 类名 */
  className?: string;
}

export type MechanismDiagramComponent = React.FC<MechanismDiagramProps>;

/**
 * 机械类型到示意图组件的映射
 */
export const mechanismDiagrams: Record<MechanismType, MechanismDiagramComponent> = {
  BALL_SCREW: BallScrewDiagram,
  GEARBOX: GearboxDiagram,
  BELT: BeltDiagram,
  RACK_PINION: RackPinionDiagram,
  DIRECT_DRIVE: DirectDriveDiagram,
};

// 单独导出各组件（便于单独使用）
export {
  BallScrewDiagram,
  GearboxDiagram,
  BeltDiagram,
  RackPinionDiagram,
  DirectDriveDiagram,
};

// 导出常量
export { MECHANISM_COLORS, MECHANISM_DIMENSIONS, CANVAS_CONFIG } from './constants';
