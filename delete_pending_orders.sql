-- Delete orders with status 'pending'
DELETE FROM public.orders WHERE status = 'pending';

-- Delete orders with status 'sold'  
DELETE FROM public.orders WHERE status = 'sold';

-- Delete orders with status 'rejected'
DELETE FROM public.orders WHERE status = 'rejected';

-- Show remaining orders for verification
SELECT id, status, payment_status, escrow_status, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;