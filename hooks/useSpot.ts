import { spotsApi } from '@/lib/supabase/spots';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSpot = (cityId: string) => {
    const queryClient = useQueryClient();
    
    //create a spot with mutation
    const {data: createdSpotData, mutateAsync: mutateCreateSpot , isPending: isPendingCreateSpot} = useMutation({
        mutationFn: spotsApi.createSpot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
        },
        onError: (error) => {
            console.error("Error creating spot:", error);
        },
    });

    const {data: deleteSpotdata, mutateAsync: mutateDeleteSpot, isPending: isPendingDeleteSpot} = useMutation({
        mutationFn: spotsApi.deleteSpot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
        },
        onError: (error) => {
            console.error("Error deleting spot:", error);
        },
    })
  
    //delete a spot
    return {
        createSpot: mutateCreateSpot,
        isPendingCreateSpot,
        createdSpotData,
        deleteSpot: mutateDeleteSpot,
        isPendingDeleteSpot,
        deleteSpotdata,
    }
}

