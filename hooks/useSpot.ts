import { spotsApi } from '@/lib/supabase/spots';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSpot = (cityId: string) => {
    const queryClient = useQueryClient();
    
    //create a spot with mutation
    const {data: createdSpotData, mutateAsync: mutateCreateSpot , isPending: isPendingCreateSpot} = useMutation({
        mutationFn: spotsApi.createSpot,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
            void queryClient.invalidateQueries({ queryKey: ['city-tags', cityId] });
            void queryClient.invalidateQueries({ queryKey: ['cities'] });
        },
        onError: (error) => {
            console.error("Error creating spot:", error);
        },
    });

    const { mutateAsync: mutateDeleteSpot, isPending: isPendingDeleteSpot } = useMutation({
        mutationFn: spotsApi.deleteSpot,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
            void queryClient.invalidateQueries({ queryKey: ['city-tags', cityId] });
            void queryClient.invalidateQueries({ queryKey: ['cities'] });
        },
        onError: (error) => {
            console.error("Error deleting spot:", error);
        },
    });

    const { mutateAsync: mutateUpdateSpot, isPending: isPendingUpdateSpot } = useMutation({
        mutationFn: spotsApi.updateSpot,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
            void queryClient.invalidateQueries({ queryKey: ['city-tags', cityId] });
        },
        onError: (error) => {
            console.error("Error updating spot:", error);
        },
    });

    return {
        createSpot: mutateCreateSpot,
        isPendingCreateSpot,
        createdSpotData,
        deleteSpot: mutateDeleteSpot,
        isPendingDeleteSpot,
        updateSpot: mutateUpdateSpot,
        isPendingUpdateSpot,
    }
}

