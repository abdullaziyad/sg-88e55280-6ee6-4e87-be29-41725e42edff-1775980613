---
title: Create product catalog and management
status: done
priority: urgent
type: feature
tags: [catalog, products]
created_by: agent
created_at: 2026-04-12T03:29:00Z
position: 1
---

## Notes
Build the product catalog interface with ability to view, add, edit, and delete products. Each product needs name, SKU, price (MVR), stock quantity, and category. Design system setup (colors, fonts) goes in this task's checklist.

## Checklist
- [x] Update globals.css with ocean teal/coral design system
- [x] Register fonts in tailwind.config.ts (Plus Jakarta Sans + Work Sans)
- [x] Create Product type interface
- [x] Create ProductCard.tsx component for grid display
- [x] Create AddProductModal.tsx for adding new products
- [x] Create ProductList.tsx page with search and filter
- [x] Add mock product data to lib/mockData.ts