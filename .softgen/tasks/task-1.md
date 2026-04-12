---
title: Create product catalog and management
status: in_progress
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
- [ ] Update globals.css with ocean teal/coral design system
- [ ] Register fonts in tailwind.config.ts (Plus Jakarta Sans + Work Sans)
- [ ] Create Product type interface
- [ ] Create ProductCard.tsx component for grid display
- [ ] Create AddProductModal.tsx for adding new products
- [ ] Create ProductList.tsx page with search and filter
- [ ] Add mock product data to lib/mockData.ts