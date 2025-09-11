<?php

namespace App\Http\Controllers;

use App\Models\DentalHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class DentalHistoryController extends Controller
{
    /**
     * Display the dental history for a specific user
     */
    public function show($userId): JsonResponse
    {
        try {
            $dentalHistory = DentalHistory::where('user_id', $userId)->first();
            
            if (!$dentalHistory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dental history not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $dentalHistory
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving dental history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dental history'
            ], 500);
        }
    }

    /**
     * Store or update dental history (handles both create and update)
     */
    public function storeOrUpdate(Request $request, $userId): JsonResponse
    {
        try {
            Log::info('Attempting to save dental history for user: ' . $userId);
            Log::info('Request data: ' . json_encode($request->all()));

            $validatedData = $request->validate([
                'previous_dentist' => 'nullable|string|max:255',
                'last_dental_visit' => 'nullable|date',
                'last_tooth_extraction' => 'nullable|string|max:500',
                'allergy_anesthesia' => 'required|boolean',
                'allergy_pain_reliever' => 'required|boolean',
                'last_dental_procedure' => 'nullable|string|max:500',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            $validatedData['user_id'] = $userId;

            Log::info('Validated data: ' . json_encode($validatedData));

            $dentalHistory = DentalHistory::updateOrCreate(
                ['user_id' => $userId],
                $validatedData
            );

            Log::info('Dental history saved successfully');

            return response()->json([
                'success' => true,
                'message' => 'Dental history saved successfully',
                'data' => $dentalHistory
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error saving dental history: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error saving dental history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update dental history
     */
    public function update(Request $request, $userId): JsonResponse
    {
        try {
            $dentalHistory = DentalHistory::where('user_id', $userId)->first();
            
            if (!$dentalHistory) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dental history not found'
                ], 404);
            }

            $validatedData = $request->validate([
                'previous_dentist' => 'nullable|string|max:255',
                'last_dental_visit' => 'nullable|date',
                'last_tooth_extraction' => 'nullable|string|max:500',
                'allergy_anesthesia' => 'required|boolean',
                'allergy_pain_reliever' => 'required|boolean',
                'last_dental_procedure' => 'nullable|string|max:500',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            $dentalHistory->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Dental history updated successfully',
                'data' => $dentalHistory
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating dental history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating dental history'
            ], 500);
        }
    }
}
