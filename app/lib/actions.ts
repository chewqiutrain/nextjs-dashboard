'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// use server marks all functions in this file as Server Functions
// Server functions can be imported into both client and server 
// components 
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });

const CreateInvoice = FormSchema.omit({ id: true, date: true });


export async function createInvoice(formData: FormData) {
    const rawFormData = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    console.log(`rawFormData: ${JSON.stringify(rawFormData)} | ${typeof rawFormData.amount}`);
    const { customerId, amount, status } = rawFormData;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO public.invoices (customer_id, amount, status, date) VALUES 
                (${customerId}, ${amountInCents}, ${status}, ${date});
        `;
    } catch (error) {
        return {
            messge: `Database error: failed to create invoice`
        }
    }


    // Force client side router cache to revalidate since we added new data 
    // So that a request will be made to the server to get updated data
    revalidatePath('/dashboard/invoices');

    // redirect the user back to see invoices
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE public.invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {
            message: "Databae error: Update invoice error"
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function deleteInvoice(id: string) {
    throw new Error("Failed to delete invoice")
    try {
        await sql`
        DELETE FROM public.invoices WHERE id = ${id}
        `;
    } catch (error) {
        return {
            message: "Database error: Failed to delete invoice"
        }
    }
    revalidatePath('/dashboard/invoices');
}