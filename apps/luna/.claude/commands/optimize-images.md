Optimize all images in the database using the Sharp image processing library:

1. Run `pnpm optimize:images` to start the optimization process
2. Monitor the output for:
   - Number of images processed
   - File size savings
   - Any errors or skipped files
3. Review the summary at the end showing:
   - Total images optimized
   - Total file size savings
   - Any failures

The optimization process will:

- Resize images to max 2400px (maintaining aspect ratio)
- Convert to WebP format with 85% quality
- Create backups of non-WebP originals
- Update database with new dimensions

This can take several minutes for large galleries. The process creates backups so original files are preserved.
