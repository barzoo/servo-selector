'use client';

import { useState } from 'react';
import { AxisSidebar } from './AxisSidebar';
import type { Project } from '@/types';

interface MobileAxisDrawerProps {
  project: Project;
  currentAxisId: string;
  onSwitchAxis: (axisId: string) => void;
  onAddAxis: () => void;
  onDeleteAxis?: (axisId: string) => void;
  onReeditAxis?: (axisId: string) => void;
  onUpdateAxisName?: (axisId: string, name: string) => void;
}

export function MobileAxisDrawer({
  project,
  currentAxisId,
  onSwitchAxis,
  onAddAxis,
  onDeleteAxis,
  onReeditAxis,
  onUpdateAxisName,
}: MobileAxisDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchAxis = (axisId: string) => {
    onSwitchAxis(axisId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
        aria-label="打开轴列表"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">轴列表</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <AxisSidebar
              project={project}
              currentAxisId={currentAxisId}
              onSwitchAxis={handleSwitchAxis}
              onAddAxis={() => {
                onAddAxis();
                setIsOpen(false);
              }}
              onDeleteAxis={onDeleteAxis}
              onReeditAxis={onReeditAxis}
              onUpdateAxisName={onUpdateAxisName}
            />
          </div>
        </>
      )}
    </>
  );
}
