-- Step 1: Delete related reviews that reference these orders (foreign key constraint requires this first)
DELETE FROM public.reviews WHERE order_id IN (
  SELECT id FROM public.orders WHERE status IN ('completed', 'cancelled')
);

-- Step 2: Delete pending orders
DELETE FROM public.orders WHERE status = 'pending';

-- Step 3: Delete sold orders
DELETE FROM public.orders WHERE status = 'sold';

-- Step 4: Delete cancelled orders
DELETE FROM public.orders WHERE status = 'cancelled';

-- Step 5: Delete completed orders (after reviews are deleted)
DELETE FROM public.orders WHERE status = 'completed';

-- Step 6: Show remaining orders for verification
SELECT id, status, payment_status, escrow_status, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;