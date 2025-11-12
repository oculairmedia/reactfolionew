# Original Project Content Extraction Needed

## Issue
The CMS migration used empty JSON files. Original content was in React component files that were deleted.

## Original Content Location
Commit: `29bf4fb^` (before CMS migration)
Files: `src/pages/projects/*.js`

## Projects That Need Content Restoration

### 1. Voices Unheard
- **Hero**: Video (https://oculair.b-cdn.net/api/v1/videos/bfbad3bf0b671badf4eb75634e9f15407ffd60ad/3rjei659/hevc)
- **Sections**:
  - Project Summary
  - The Process (3 paragraphs)
  - The Outcome (2 paragraphs)
- **Gallery**: 2 images + 1 video
- **Metadata**:
  - Date: November 2023
  - Exhibition: Inter/Access IA 360° Showcase
  - Curators: Kyle Duffield and Terry Anastasiadis
  - Collaborators: Nyle Migiizi Johnston, Nigel Nolan, Emmanuel Umukoro
  - Technologies: AI-generated imagery, Digital Animation

### 2. Coffee by Altitude
- **Overview**: Text about micro-roaster concept
- **Process**: Design process description
- **Images**: 8 gallery images
- **Services**: 8 items (Creative Direction, Visual Identity, Logo, etc.)
- **Testimonial**: Quote from Adam Fletcher

## Solution Options

### Option 1: Manual Content Entry (Recommended)
1. Extract content from each old component file
2. Enter via CMS Admin UI at https://cms2.emmanuelu.com/admin
3. Manually add sections, galleries, metadata

### Option 2: Automated Migration Script
1. Parse all 11 old component files
2. Extract text content, image URLs, metadata
3. Transform to Payload CMS structure
4. Bulk update via API

### Option 3: Restore Old Components
1. Keep DynamicProjectPage for CMS projects
2. Add routes for hard-coded project pages
3. Gradually migrate to CMS

## Recommendation
Use **Option 2** - Create migration script to:
1. Parse JSX files from git history
2. Extract content structure
3. Map to Payload sections/gallery/metadata
4. Update via API

This preserves all content while using the CMS.

