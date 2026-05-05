Analyze all images in the database without modifying them:

1. Run `pnpm analyze:images` to analyze all images
2. Review the output showing:
   - Total number of images and total size
   - Average image size
   - Size distribution (tiny, small, medium, large, xlarge)
   - Format distribution (webp, jpeg, png, etc.)
   - Images larger than 2400px
   - Missing files
   - Specific large images that may need optimization

The analysis provides insights into:

- Which images are candidates for optimization
- Overall storage usage
- Format usage patterns
- Images that don't exist on disk but are in the database

Use this before running `/optimize-images` to understand the scope of optimization needed.
