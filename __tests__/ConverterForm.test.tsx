import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConverterForm } from '@/components/ConverterForm';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

describe('ConverterForm', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
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
        const button = screen.getByRole('button', { name: /fetch/i });

        fireEvent.change(input, { target: { value: 'invalid' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument();
        });
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

        await waitFor(() => {
            expect(screen.getByText(/Test Video/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
            expect(screen.getByText(/Download MP3/i)).toBeInTheDocument();
        });
    });
});
