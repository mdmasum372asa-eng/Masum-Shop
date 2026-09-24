# Security Specification for MASUM SHOP

## Data Invariants
1. Products can only be created, modified, or deleted by authenticated administrators (`isAdmin()`).
2. Public users and customers can read published products (`isPublished == true`), but not unpublished products.
3. Orders can be created by any user (including guest checkouts) with strict schema validation (prepaid transaction details, required customer info, non-empty items).
4. Order reading and modification of order statuses are strictly restricted to administrators (`isAdmin()`). Customers can only retrieve their order via matching exact order document ID on submission confirmation.
5. Website settings, payment settings, and banners can only be mutated by authenticated administrators.
6. Identity spoofing prevention: No non-admin can elevate themselves to an administrator or modify the `admins` collection.

## The Dirty Dozen Payloads
1. Non-admin attempting to create a product -> PERMISSION_DENIED
2. Non-admin attempting to update product prices or stock -> PERMISSION_DENIED
3. Non-admin attempting to delete a product -> PERMISSION_DENIED
4. Customer attempting to read all customer orders collection -> PERMISSION_DENIED
5. Customer attempting to update order status to "Delivered" -> PERMISSION_DENIED
6. Attacker attempting to create an order missing `transactionId` -> PERMISSION_DENIED
7. Attacker attempting to inject 5MB string into order customerName -> PERMISSION_DENIED
8. Non-admin attempting to modify payment numbers (bKash/Nagad) in settings -> PERMISSION_DENIED
9. Non-admin attempting to add, edit or delete banner advertisements -> PERMISSION_DENIED
10. Attacker attempting to write to `admins/{uid}` to self-assign admin rights -> PERMISSION_DENIED
11. Unauthenticated user attempting to view unpublished products in bulk -> PERMISSION_DENIED
12. Attacker attempting shadow fields update on order or product -> PERMISSION_DENIED
