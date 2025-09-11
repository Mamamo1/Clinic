<?php

namespace App\Http\Controllers;

use App\Models\DentalRecord;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class DentalRecordController extends Controller
{
    /**
     * Display a listing of dental records for a specific user
     */
    public function index(Request $request, $userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            
            $dentalRecords = DentalRecord::forUser($userId)
                ->orderBy('examination_date', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $dentalRecords,
                'user' => $user->only(['id', 'name', 'email'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dental records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created dental record
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('[v0] Dental record store request received', [
                'request_data' => $request->all(),
                'user_id' => $request->input('user_id')
            ]);

             $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
            'examination_date' => 'nullable|date',
            'purpose' => 'nullable|array',
            'oral_hygiene' => 'nullable|string',
            'decayed_teeth_count' => 'nullable|integer',
            'extraction_teeth_count' => 'nullable|integer',
            'teeth_conditions' => 'nullable|array',
            'oral_prophylaxis_notes' => 'nullable|string',
            'other_notes' => 'nullable|string',
            'tooth_extraction_numbers' => 'nullable|string',
            'tooth_filling_numbers' => 'nullable|string',
            'school_dentist' => 'nullable|string',
        ]);

            Log::info('[v0] Validation passed, attempting to create record', [
                'validated_data' => $validatedData
            ]);

            $user = User::find($validatedData['user_id']);
            if (!$user) {
                Log::error('[v0] User not found', ['user_id' => $validatedData['user_id']]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $dentalRecord = DentalRecord::create($validatedData);
            
            if (!$dentalRecord) {
                Log::error('[v0] Failed to create dental record - create() returned null');
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create dental record - database operation failed'
                ], 500);
            }

            $savedRecord = DentalRecord::find($dentalRecord->id);
            if (!$savedRecord) {
                Log::error('[v0] Record created but not found in database', [
                    'created_id' => $dentalRecord->id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Record created but not persisted to database'
                ], 500);
            }

            Log::info('[v0] Dental record created successfully', [
                'record_id' => $dentalRecord->id,
                'user_id' => $dentalRecord->user_id,
                'examination_date' => $dentalRecord->examination_date
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dental record created successfully',
                'data' => $dentalRecord->load('user')
            ], 201);
        } catch (ValidationException $e) {
            Log::error('[v0] Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('[v0] Exception in dental record store', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create dental record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified dental record
     */
    public function show($id): JsonResponse
    {
        try {
            $dentalRecord = DentalRecord::with('user')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $dentalRecord
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dental record not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified dental record
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $dentalRecord = DentalRecord::findOrFail($id);

            $validatedData = $request->validate([
            'examination_date' => 'sometimes|date',
            'purpose' => 'sometimes|array',
            'purpose.*' => 'string',
            'oral_hygiene' => 'sometimes|in:excellent,good,poor',
            'decayed_teeth_count' => 'sometimes|integer|min:0',
            'extraction_teeth_count' => 'sometimes|integer|min:0',
            'teeth_conditions' => 'nullable|array',
            'oral_prophylaxis_notes' => 'nullable|string',
            'other_notes' => 'nullable|string',
            'tooth_extraction_numbers' => 'nullable|string',
            'tooth_filling_numbers' => 'nullable|string',
            'school_dentist' => 'sometimes|string|max:255',
        ]);


            $dentalRecord->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Dental record updated successfully',
                'data' => $dentalRecord->load('user')
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update dental record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified dental record
     */
    public function destroy($id): JsonResponse
    {
        try {
            $dentalRecord = DentalRecord::findOrFail($id);
            $dentalRecord->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dental record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete dental record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dental statistics for a user
     */
    /**
     * Get dental statistics for a user
     */
    public function getStatistics($userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            
            // Fix: Move the log statement after getting the records
            $dentalRecords = DentalRecord::forUser($userId)->paginate(10);
            
            Log::info('[v0] DentalRecord count for user', [
                'user_id' => $userId,
                'count' => $dentalRecords->total(),
                'records' => $dentalRecords->items()
            ]);
            
            $stats = [
                'total_examinations' => DentalRecord::forUser($userId)->count(),
                'recent_examinations' => DentalRecord::forUser($userId)->recent(30)->count(),
                'total_decayed_teeth' => DentalRecord::forUser($userId)->sum('decayed_teeth_count'),
                'total_extractions' => DentalRecord::forUser($userId)->sum('extraction_teeth_count'),
                'last_examination' => DentalRecord::forUser($userId)
                    ->latest('examination_date')
                    ->first()?->formatted_examination_date,
                'next_appointment' => DentalRecord::forUser($userId)
                    ->whereNotNull('next_appointment')
                    ->where('next_appointment', '>=', now())
                    ->orderBy('next_appointment')   
                    ->first()?->formatted_next_appointment
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'user' => $user->only(['id', 'name', 'email'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
