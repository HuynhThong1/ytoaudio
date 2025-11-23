import { formatDuration } from '@/lib/utils';

describe('formatDuration', () => {
  it('formats seconds to mm:ss', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration('65')).toBe('1:05');
    expect(formatDuration(10)).toBe('0:10');
  });

  it('formats seconds to h:mm:ss', () => {
    expect(formatDuration(3665)).toBe('1:01:05');
  });

  it('handles 0', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('handles invalid input', () => {
    expect(formatDuration('abc')).toBe('0:00');
  });
});
