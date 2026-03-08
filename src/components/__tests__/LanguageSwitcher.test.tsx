import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';
import ClientLanguageProvider from '@/i18n/ClientLanguageProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.history
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  value: { replaceState: mockReplaceState },
});

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render language buttons', async () => {
    render(
      <ClientLanguageProvider>
        <LanguageSwitcher />
      </ClientLanguageProvider>
    );

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText('中文')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  it('should switch language without page reload', async () => {
    render(
      <ClientLanguageProvider>
        <LanguageSwitcher />
      </ClientLanguageProvider>
    );

    // Wait for mount
    await waitFor(() => {
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    const enButton = screen.getByText('EN');

    // Click to switch to English
    fireEvent.click(enButton);

    // Verify URL was updated without reload
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalled();
    });

    // Verify the URL update includes lang parameter
    const lastCall = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1];
    expect(lastCall[2]).toContain('lang=en');
  });

  it('should highlight current locale', async () => {
    render(
      <ClientLanguageProvider>
        <LanguageSwitcher />
      </ClientLanguageProvider>
    );

    // Wait for mount
    await waitFor(() => {
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    const zhButton = screen.getByText('中文');
    const enButton = screen.getByText('EN');

    // 中文应该被选中（默认）- 检查是否有主背景色样式
    expect(zhButton.className).toContain('bg-[var(--primary-500)]');
    expect(enButton.className).not.toContain('bg-[var(--primary-500)]');
  });
});
