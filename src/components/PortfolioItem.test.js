/**
 * Tests for PortfolioItem component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortfolioItem from './PortfolioItem';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, variants, initial, animate, ref, ...props }) => (
      <div 
        className={className} 
        onClick={onClick} 
        ref={ref}
        data-testid="motion-div"
        {...props}
      >
        {children}
      </div>
    ),
  },
  useInView: () => true,
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PortfolioItem', () => {
  const mockImageData = {
    img: 'https://example.com/image.jpg',
    title: 'Test Project',
    description: 'This is a test project description',
    link: '/projects/test-project',
    isVideo: false
  };

  const mockVideoData = {
    img: 'https://example.com/poster.jpg',
    video: 'https://example.com/video.mp4',
    title: 'Video Project',
    description: 'This is a video project description',
    link: '/projects/video-project',
    isVideo: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Image Portfolio Items', () => {
    it('should render without crashing', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should display the project title', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should display the project description', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    });

    it('should display "View Project" text', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByText('View Project')).toBeInTheDocument();
    });

    it('should render image with correct src', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const img = screen.getByAltText('Test Project');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render image with correct alt text', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByAltText('Test Project')).toBeInTheDocument();
    });

    it('should apply loading="lazy" to image', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const img = screen.getByAltText('Test Project');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should apply "loaded" class after image loads', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const img = screen.getByAltText('Test Project');
      
      fireEvent.load(img);
      
      expect(img).toHaveClass('loaded');
    });
  });

  describe('Happy Path - Video Portfolio Items', () => {
    it('should render poster image initially for video items', () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      const img = screen.getByAltText('Video Project');
      expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
    });

    it('should render video element after delay', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toBeInTheDocument();
      }, { timeout: 300 });
    });

    it('should render video with correct source', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        const source = video.querySelector('source');
        expect(source).toHaveAttribute('src', 'https://example.com/video.mp4');
      }, { timeout: 300 });
    });

    it('should set video to autoplay', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('autoplay');
      }, { timeout: 300 });
    });

    it('should set video to loop', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('loop');
      }, { timeout: 300 });
    });

    it('should set video to muted', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('muted');
      }, { timeout: 300 });
    });

    it('should set playsinline attribute', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('playsinline');
      }, { timeout: 300 });
    });

    it('should set preload="metadata"', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('preload', 'metadata');
      }, { timeout: 300 });
    });

    it('should set poster attribute', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        expect(video).toHaveAttribute('poster', 'https://example.com/poster.jpg');
      }, { timeout: 300 });
    });

    it('should apply "loaded" class after video loads', async () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      await waitFor(() => {
        const video = screen.getByRole('application');
        fireEvent.loadedData(video);
        expect(video).toHaveClass('loaded');
      }, { timeout: 300 });
    });
  });

  describe('Navigation Behavior', () => {
    it('should navigate to project link when clicked', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const item = screen.getByTestId('motion-div');
      
      fireEvent.click(item);
      
      expect(mockNavigate).toHaveBeenCalledWith('/projects/test-project');
    });

    it('should navigate to correct link for video items', () => {
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      const item = screen.getByTestId('motion-div');
      
      fireEvent.click(item);
      
      expect(mockNavigate).toHaveBeenCalledWith('/projects/video-project');
    });

    it('should be clickable', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const item = screen.getByTestId('motion-div');
      
      expect(item).toHaveAttribute('onClick');
    });
  });

  describe('Text Truncation', () => {
    it('should not truncate short descriptions', () => {
      const shortData = {
        ...mockImageData,
        description: 'Short description'
      };
      
      renderWithRouter(<PortfolioItem data={shortData} index={0} />);
      expect(screen.getByText('Short description')).toBeInTheDocument();
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });

    it('should truncate long descriptions', () => {
      const longData = {
        ...mockImageData,
        description: 'This is a very long description that should be truncated because it exceeds the maximum allowed length of 100 characters for display'
      };
      
      renderWithRouter(<PortfolioItem data={longData} index={0} />);
      const description = screen.getByText(/\.\.\./);
      expect(description.textContent.length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('should truncate at exactly 100 characters', () => {
      const exactLengthData = {
        ...mockImageData,
        description: 'a'.repeat(101) // 101 characters
      };
      
      renderWithRouter(<PortfolioItem data={exactLengthData} index={0} />);
      const description = screen.getByText(/\.\.\./);
      expect(description.textContent).toHaveLength(103); // 100 + '...'
    });

    it('should not truncate at boundary (100 chars exactly)', () => {
      const boundaryData = {
        ...mockImageData,
        description: 'a'.repeat(100) // Exactly 100 characters
      };
      
      renderWithRouter(<PortfolioItem data={boundaryData} index={0} />);
      const text = screen.getByText('a'.repeat(100));
      expect(text.textContent).not.toContain('...');
    });
  });

  describe('Index-based Animation Delay', () => {
    it('should pass index to component', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={5} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should render with index 0', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('should render with large index', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={100} />);
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Missing or Invalid Data', () => {
    it('should handle missing description', () => {
      const noDescData = {
        ...mockImageData,
        description: undefined
      };
      
      renderWithRouter(<PortfolioItem data={noDescData} index={0} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      const emptyDescData = {
        ...mockImageData,
        description: ''
      };
      
      renderWithRouter(<PortfolioItem data={emptyDescData} index={0} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should handle missing title', () => {
      const noTitleData = {
        ...mockImageData,
        title: undefined
      };
      
      renderWithRouter(<PortfolioItem data={noTitleData} index={0} />);
      expect(screen.getByText('View Project')).toBeInTheDocument();
    });

    it('should handle missing link', () => {
      const noLinkData = {
        ...mockImageData,
        link: undefined
      };
      
      renderWithRouter(<PortfolioItem data={noLinkData} index={0} />);
      
      const item = screen.getByTestId('motion-div');
      fireEvent.click(item);
      
      expect(mockNavigate).toHaveBeenCalledWith(undefined);
    });

    it('should handle missing image source', () => {
      const noImgData = {
        ...mockImageData,
        img: undefined
      };
      
      renderWithRouter(<PortfolioItem data={noImgData} index={0} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should handle video data without video source', () => {
      const noVideoSrc = {
        ...mockVideoData,
        video: undefined
      };
      
      renderWithRouter(<PortfolioItem data={noVideoSrc} index={0} />);
      expect(screen.getByText('Video Project')).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Various URLs', () => {
    it('should handle relative image URLs', () => {
      const relativeUrlData = {
        ...mockImageData,
        img: '/images/project.jpg'
      };
      
      renderWithRouter(<PortfolioItem data={relativeUrlData} index={0} />);
      const img = screen.getByAltText('Test Project');
      expect(img).toHaveAttribute('src', '/images/project.jpg');
    });

    it('should handle data URLs', () => {
      const dataUrlData = {
        ...mockImageData,
        img: 'data:image/png;base64,iVBORw0KGg='
      };
      
      renderWithRouter(<PortfolioItem data={dataUrlData} index={0} />);
      const img = screen.getByAltText('Test Project');
      expect(img).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGg=');
    });

    it('should handle absolute link paths', () => {
      const absoluteLinkData = {
        ...mockImageData,
        link: '/portfolio/item/123'
      };
      
      renderWithRouter(<PortfolioItem data={absoluteLinkData} index={0} />);
      const item = screen.getByTestId('motion-div');
      
      fireEvent.click(item);
      
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio/item/123');
    });

    it('should handle external links', () => {
      const externalLinkData = {
        ...mockImageData,
        link: 'https://example.com/project'
      };
      
      renderWithRouter(<PortfolioItem data={externalLinkData} index={0} />);
      const item = screen.getByTestId('motion-div');
      
      fireEvent.click(item);
      
      expect(mockNavigate).toHaveBeenCalledWith('https://example.com/project');
    });
  });

  describe('Component Structure', () => {
    it('should have po_item class', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const item = screen.getByTestId('motion-div');
      expect(item).toHaveClass('po_item');
    });

    it('should have media-container element', () => {
      const { container } = renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const mediaContainer = container.querySelector('.media-container');
      expect(mediaContainer).toBeInTheDocument();
    });

    it('should have content element', () => {
      const { container } = renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const content = container.querySelector('.content');
      expect(content).toBeInTheDocument();
    });

    it('should render title in h3 element', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Test Project');
    });

    it('should render description in p element', () => {
      const { container } = renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const description = container.querySelector('.content p');
      expect(description).toHaveTextContent('This is a test project description');
    });

    it('should render "View Project" in span with correct class', () => {
      const { container } = renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const viewProject = container.querySelector('.view-project');
      expect(viewProject).toHaveTextContent('View Project');
    });
  });

  describe('Video Loading Delay', () => {
    it('should delay video loading by 200ms', async () => {
      jest.useFakeTimers();
      renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      // Initially should show poster image
      expect(screen.getByAltText('Video Project')).toBeInTheDocument();
      
      // Advance timers by 200ms
      jest.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should cleanup timer on unmount', () => {
      jest.useFakeTimers();
      const { unmount } = renderWithRouter(<PortfolioItem data={mockVideoData} index={0} />);
      
      unmount();
      
      // Should not throw error
      jest.advanceTimersByTime(200);
      
      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should provide alt text for images', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Test Project');
    });

    it('should be keyboard accessible (clickable)', () => {
      renderWithRouter(<PortfolioItem data={mockImageData} index={0} />);
      const item = screen.getByTestId('motion-div');
      expect(item).toHaveAttribute('onClick');
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple items with different indices', () => {
      const { container } = renderWithRouter(
        <>
          <PortfolioItem data={mockImageData} index={0} />
          <PortfolioItem data={{ ...mockImageData, title: 'Project 2' }} index={1} />
          <PortfolioItem data={{ ...mockImageData, title: 'Project 3' }} index={2} />
        </>
      );
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });
  });
});