/**
 * Script to add English descriptions to motors.json and drives.json
 * Run with: npx tsx scripts/add-en-descriptions.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Translation maps for motors
const encoderMap: Record<string, string> = {
  'A型编码器': 'Type A Encoder',
  'B型编码器': 'Type B Encoder',
  '电池盒式多圈': 'Battery Multi-turn',
  '机械式多圈': 'Mechanical Multi-turn'
};

const brakeMap: Record<string, string> = {
  '无抱闸': 'No Brake',
  '有抱闸': 'With Brake'
};

const shaftMap: Record<string, string> = {
  '光轴': 'Smooth Shaft',
  '带键轴': 'Keyed Shaft'
};

// Translation maps for drives
const commMap: Record<string, string> = {
  'EtherCAT通讯': 'EtherCAT Communication',
  'PROFINET通讯': 'PROFINET Communication',
  'EtherNet-IP通讯': 'EtherNet/IP Communication',
  '模拟量通讯': 'Analog Communication'
};

const stoMap: Record<string, string> = {
  '无STO': 'No STO',
  '有STO': 'With STO'
};

/**
 * Translate Chinese motor description to English
 */
function translateMotorDescription(zhDesc: string): string {
  let enDesc = zhDesc;

  Object.entries(encoderMap).forEach(([zh, en]) => {
    enDesc = enDesc.replace(zh, en);
  });

  Object.entries(brakeMap).forEach(([zh, en]) => {
    enDesc = enDesc.replace(zh, en);
  });

  Object.entries(shaftMap).forEach(([zh, en]) => {
    enDesc = enDesc.replace(zh, en);
  });

  return enDesc;
}

/**
 * Translate Chinese drive description to English
 */
function translateDriveDescription(zhDesc: string): string {
  let enDesc = zhDesc;

  Object.entries(commMap).forEach(([zh, en]) => {
    enDesc = enDesc.replace(zh, en);
  });

  Object.entries(stoMap).forEach(([zh, en]) => {
    enDesc = enDesc.replace(zh, en);
  });

  return enDesc;
}

// Process motors.json
const motorsPath = path.join(__dirname, '../src/data/motors.json');
const motorsData = JSON.parse(fs.readFileSync(motorsPath, 'utf-8'));

const updatedMotors = motorsData.motors.map((motor: any) => ({
  ...motor,
  description: {
    ...motor.description,
    shortEn: translateMotorDescription(motor.description.short)
  }
}));

fs.writeFileSync(motorsPath, JSON.stringify({
  ...motorsData,
  motors: updatedMotors
}, null, 2));

console.log(`Updated ${updatedMotors.length} motors with English descriptions`);

// Process drives.json
const drivesPath = path.join(__dirname, '../src/data/drives.json');
const drivesData = JSON.parse(fs.readFileSync(drivesPath, 'utf-8'));

const updatedDrives = drivesData.drives.map((drive: any) => ({
  ...drive,
  description: {
    ...drive.description,
    shortEn: translateDriveDescription(drive.description.short)
  }
}));

fs.writeFileSync(drivesPath, JSON.stringify({
  ...drivesData,
  drives: updatedDrives
}, null, 2));

console.log(`Updated ${updatedDrives.length} drives with English descriptions`);
