import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function useValidateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      const { data, error } = await supabase.rpc('validate_document', {
        doc_id: docId,
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Document validated successfully! Stock moves posted.');
      // Invalidate relevant query keys
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      queryClient.invalidateQueries({ queryKey: ['stock-documents'] });
      queryClient.invalidateQueries({ queryKey: ['stock-document'] });
      queryClient.invalidateQueries({ queryKey: ['stock-on-hand'] });
    },
    onError: (error: Error) => {
      // Surface Postgres RAISE messages verbatim to the user
      toast.error(error.message || 'Validation failed');
    },
  });
}
