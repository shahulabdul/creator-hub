import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetCard from './contentcreator-app/src/components/assets/AssetCard';

describe('AssetCard Component', () => {
  const mockAsset = {
    id: 'asset-1',
    name: 'Test Image',
    description: 'This is a test image description',
    type: 'IMAGE',
    url: 'https://example.com/test-image.jpg',
    tags: ['tag1', 'tag2'],
    project: {
      id: 'project-1',
      title: 'Test Project',
    },
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
  };

  const mockOnClick = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnTagClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders asset information correctly', () => {
    render(
      <AssetCard 
        asset={mockAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Check if asset name and description are rendered
    expect(screen.getByText('Test Image')).toBeInTheDocument();
    expect(screen.getByText('This is a test image description')).toBeInTheDocument();
    
    // Check if type is rendered
    expect(screen.getByText('IMAGE')).toBeInTheDocument();
    
    // Check if tags are rendered
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    
    // Check if project is rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    
    // Check if image is rendered with correct URL
    const image = screen.getByAltText('Test Image');
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
  });

  it('calls onClick when card is clicked', () => {
    render(
      <AssetCard 
        asset={mockAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Click on the card
    fireEvent.click(screen.getByText('Test Image'));
    
    // Check if onClick was called with the asset
    expect(mockOnClick).toHaveBeenCalledWith(mockAsset);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <AssetCard 
        asset={mockAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Click on the edit button
    fireEvent.click(screen.getByLabelText('Edit asset'));
    
    // Check if onEdit was called with the asset
    expect(mockOnEdit).toHaveBeenCalledWith(mockAsset);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <AssetCard 
        asset={mockAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Click on the delete button
    fireEvent.click(screen.getByLabelText('Delete asset'));
    
    // Check if onDelete was called with the asset id
    expect(mockOnDelete).toHaveBeenCalledWith(mockAsset.id);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('calls onTagClick when a tag is clicked', () => {
    render(
      <AssetCard 
        asset={mockAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Click on a tag
    fireEvent.click(screen.getByText('tag1'));
    
    // Check if onTagClick was called with the tag
    expect(mockOnTagClick).toHaveBeenCalledWith('tag1');
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders different asset types correctly', () => {
    // Test with video asset
    const videoAsset = { 
      ...mockAsset, 
      type: 'VIDEO',
      url: 'https://example.com/test-video.mp4'
    };
    
    const { rerender } = render(
      <AssetCard 
        asset={videoAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Check if video type is rendered
    expect(screen.getByText('VIDEO')).toBeInTheDocument();
    
    // Check if video thumbnail is rendered
    const videoThumbnail = screen.getByAltText('Test Image');
    expect(videoThumbnail).toHaveAttribute('src', expect.stringContaining('video-thumbnail'));
    
    // Test with document asset
    const documentAsset = { 
      ...mockAsset, 
      type: 'DOCUMENT',
      url: 'https://example.com/test-document.pdf'
    };
    
    rerender(
      <AssetCard 
        asset={documentAsset} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTagClick={mockOnTagClick}
      />
    );

    // Check if document type is rendered
    expect(screen.getByText('DOCUMENT')).toBeInTheDocument();
    
    // Check if document icon is rendered
    const documentIcon = screen.getByAltText('Test Image');
    expect(documentIcon).toHaveAttribute('src', expect.stringContaining('document-icon'));
  });
});
