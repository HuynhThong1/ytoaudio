import { render, screen, fireEvent } from '@testing-library/react';
import { ConverterForm } from '@/components/ConverterForm';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

// Mock Progress component to avoid ResizeObserver issues
jest.mock('@/components/ui/progress', () => ({
    Progress: () => <div data-testid="progress-bar" />,
}));

describe('ConverterForm', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockReset();
    });

    it('renders input and button', () => {
        render(<ConverterForm />);
        expect(screen.getByPlaceholderText(/https:\/\/www.youtube.com/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /fetch/i })).toBeInTheDocument();
    });

    it('handles input change', () => {
        render(<ConverterForm />);
        const input = screen.getByPlaceholderText(/https:\/\/www.youtube.com/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } });
        expect(input.value).toBe('https://youtube.com/watch?v=123');
    });

    it('shows error on failed fetch', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid URL' }),
        });

        render(<ConverterForm />);
        const input = screen.getByPlaceholderText(/https:\/\/www.youtube.com/i);
        const fetchButton = screen.getByRole('button', { name: /fetch/i });

        fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
        fireEvent.click(fetchButton);

        const alert = await screen.findByTestId('error-alert', {}, { timeout: 3000 });
        expect(alert).toHaveTextContent(/Invalid URL/i);
    });

    it('shows video info on success', async () => {
        const mockInfo = {
            title: 'Test Video',
            thumbnail: 'http://example.com/thumb.jpg',
            duration: '120',
            author: 'Test Author',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockInfo,
        });

        render(<ConverterForm />);
        const input = screen.getByPlaceholderText(/https:\/\/www.youtube.com/i);
        const button = screen.getByRole('button', { name: /fetch/i });

        fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } });
        fireEvent.click(button);

        expect(await screen.findByTestId('video-title')).toHaveTextContent(/Test Video/i);
        expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Download MP3/i })).toBeInTheDocument();
    });
});
