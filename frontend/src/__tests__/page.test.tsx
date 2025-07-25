import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Selamat Datang di MindConnect');
  });

  it('renders all four zone cards', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Zona Kesehatan Mental')).toBeInTheDocument();
    expect(screen.getByText('Edukasi Finansial')).toBeInTheDocument();
    expect(screen.getByText('Manajemen Teknologi')).toBeInTheDocument();
    expect(screen.getByText('Akses & Inklusi')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<HomePage />);
    
    const description = screen.getByText(/Platform web interaktif yang menyediakan dukungan/);
    expect(description).toBeInTheDocument();
  });

  it('renders the call-to-action button', () => {
    render(<HomePage />);
    
    const button = screen.getByRole('button', { name: 'Mulai Sekarang' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600');
  });

  it('has proper responsive classes', () => {
    render(<HomePage />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl', 'md:text-6xl');
  });
});