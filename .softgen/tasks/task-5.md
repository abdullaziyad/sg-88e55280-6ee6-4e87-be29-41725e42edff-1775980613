---
title: Create transaction history page for admins
status: in_progress
priority: high
type: feature
tags: [history, admin, reporting]
created_by: agent
created_at: 2026-04-12T03:48:00Z
position: 5
---

## Notes
Build a transaction history page where admins can view all past sales with detailed tax breakdowns. Include filters by date, payment method, and search by receipt number. Cashiers should not have access to this page.

## Checklist
- [ ] Create TransactionHistory.tsx page component
- [ ] Add navigation link in header (admin only)
- [ ] Display transactions in table/card format
- [ ] Show tax breakdown for each transaction
- [ ] Add date range filter
- [ ] Add payment method filter
- [ ] Add search by receipt number
- [ ] Implement role-based access control
- [ ] Add translations for history page