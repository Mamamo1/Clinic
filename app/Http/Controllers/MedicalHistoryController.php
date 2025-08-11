<?php

namespace App\Http\Controllers;

use App\Models\MedicalHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class MedicalHistoryController extends Controller
{
    // Only allow access to authorized admin roles
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display the medical history of a user.
     */
    public function show($user_id)
    {
        try {
            $user = Auth::user();
            
            // Enhanced authorization check
            if (!$this->isAuthorizedUser($user)) {
                Log::warning('Unauthorized access attempt to medical history', [
                    'user_id' => $user->id,
                    'account_type' => $user->account_type,
                    'requested_user_id' => $user_id
                ]);
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            // Validate user_id parameter
            if (!is_numeric($user_id) || $user_id <= 0) {
                return response()->json(['message' => 'Invalid user ID'], 400);
            }

            // Check if the requested user exists
            $requestedUser = User::find($user_id);
            if (!$requestedUser) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $history = MedicalHistory::where('user_id', $user_id)->first();
            
            if (!$history) {
                // Return empty structure instead of 404 for better UX
                return response()->json([
                    'success' => true,
                    'message' => 'No medical history found. You can create one.',
                    'data' => $this->getEmptyMedicalHistory()
                ], 200);
            }

            // Decrypt sensitive fields safely
            $decrypted = $history->toArray();
            $sensitiveFields = [
                'pwd_disability', 
                'immunocompromised_specify', 
                'musculoskeletal_injury_specify', 
                'visual_defect_specify', 
                'hearing_defect_specify', 
                'allergies_specify'
            ];

            foreach ($sensitiveFields as $field) {
                if (!empty($history->$field)) {
                    try {
                        $decrypted[$field] = Crypt::decryptString($history->$field);
                    } catch (\Exception $e) {
                        Log::error('Failed to decrypt field: ' . $field, [
                            'user_id' => $user_id,
                            'error' => $e->getMessage()
                        ]);
                        $decrypted[$field] = '[Decryption Error]';
                    }
                }
            }

            // Log successful access
            Log::info('Medical history accessed', [
                'accessed_by' => $user->id,
                'patient_id' => $user_id,
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $decrypted,
                'message' => 'Medical history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving medical history', [
                'user_id' => $user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving medical history'
            ], 500);
        }
    }

    /**
     * Store or update the medical history of a user.
     */
    public function storeOrUpdate(Request $request, $user_id)
    {
        try {
            $user = Auth::user();
            
            // Enhanced authorization check
            if (!$this->isAuthorizedUser($user)) {
                Log::warning('Unauthorized attempt to modify medical history', [
                    'user_id' => $user->id,
                    'account_type' => $user->account_type,
                    'target_user_id' => $user_id
                ]);
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            // Validate user_id parameter
            if (!is_numeric($user_id) || $user_id <= 0) {
                return response()->json(['message' => 'Invalid user ID'], 400);
            }

            // Check if the target user exists
            $targetUser = User::find($user_id);
            if (!$targetUser) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Enhanced validation with custom rules
            $validator = Validator::make($request->all(), [
                'is_pwd' => 'nullable|boolean',
                'pwd_disability' => 'nullable|string|max:500',
                'anemia' => 'nullable|boolean',
                'bleeding_disorders' => 'nullable|boolean',
                'vertigo_dizziness' => 'nullable|boolean',
                'migraine' => 'nullable|boolean',
                'epilepsy' => 'nullable|boolean',
                'panic_anxiety' => 'nullable|boolean',
                'hyperacidity_gerd' => 'nullable|boolean',
                'heart_disease' => 'nullable|boolean',
                'kidney_disease' => 'nullable|boolean',
                'asthma' => 'nullable|boolean',
                'sexually_transmitted_illness' => 'nullable|boolean',
                'congenital_heart_disease' => 'nullable|boolean',
                'immunocompromised' => 'nullable|boolean',
                'immunocompromised_specify' => 'nullable|string|max:500',
                'musculoskeletal_injury' => 'nullable|boolean',
                'musculoskeletal_injury_specify' => 'nullable|string|max:500',
                'mumps' => 'nullable|boolean',
                'chickenpox' => 'nullable|boolean',
                'hepatitis' => 'nullable|boolean',
                'scoliosis' => 'nullable|boolean',
                'diabetes_mellitus' => 'nullable|boolean',
                'head_injury' => 'nullable|boolean',
                'visual_defect' => 'nullable|boolean',
                'visual_defect_specify' => 'nullable|string|max:500',
                'hearing_defect' => 'nullable|boolean',
                'hearing_defect_specify' => 'nullable|string|max:500',
                'tuberculosis' => 'nullable|boolean',
                'hypertension' => 'nullable|boolean',
                'g6pd' => 'nullable|boolean',
                'rheumatic_heart_disease' => 'nullable|boolean',
                'allergies_specify' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Sanitize and encrypt sensitive string values
            $sensitiveFields = [
                'pwd_disability', 
                'immunocompromised_specify', 
                'musculoskeletal_injury_specify', 
                'visual_defect_specify', 
                'hearing_defect_specify', 
                'allergies_specify'
            ];

            foreach ($sensitiveFields as $field) {
                if (isset($validated[$field]) && !empty($validated[$field])) {
                    // Sanitize input
                    $validated[$field] = strip_tags(trim($validated[$field]));
                    
                    // Encrypt if not empty
                    if (!empty($validated[$field])) {
                        try {
                            $validated[$field] = Crypt::encryptString($validated[$field]);
                        } catch (\Exception $e) {
                            Log::error('Failed to encrypt field: ' . $field, [
                                'user_id' => $user_id,
                                'error' => $e->getMessage()
                            ]);
                            return response()->json([
                                'success' => false,
                                'message' => 'Encryption error occurred'
                            ], 500);
                        }
                    }
                }
            }

            // Convert boolean strings to actual booleans
            $booleanFields = [
                'is_pwd', 'anemia', 'bleeding_disorders', 'vertigo_dizziness', 'migraine',
                'epilepsy', 'panic_anxiety', 'hyperacidity_gerd', 'heart_disease',
                'kidney_disease', 'asthma', 'sexually_transmitted_illness',
                'congenital_heart_disease', 'immunocompromised', 'musculoskeletal_injury',
                'mumps', 'chickenpox', 'hepatitis', 'scoliosis', 'diabetes_mellitus',
                'head_injury', 'visual_defect', 'hearing_defect', 'tuberculosis',
                'hypertension', 'g6pd', 'rheumatic_heart_disease'
            ];

            foreach ($booleanFields as $field) {
                if (isset($validated[$field])) {
                    $validated[$field] = filter_var($validated[$field], FILTER_VALIDATE_BOOLEAN);
                }
            }

            $validated['user_id'] = $user_id;

            // Use database transaction for data integrity
            \DB::beginTransaction();
            
            try {
                $history = MedicalHistory::updateOrCreate(
                    ['user_id' => $user_id],
                    $validated
                );

                \DB::commit();

                // Log successful update
                Log::info('Medical history updated', [
                    'updated_by' => $user->id,
                    'patient_id' => $user_id,
                    'timestamp' => now()
                ]);

                // Return response without sensitive encrypted data
                $responseData = $history->toArray();
                foreach ($sensitiveFields as $field) {
                    if (isset($responseData[$field]) && !empty($responseData[$field])) {
                        try {
                            $responseData[$field] = Crypt::decryptString($responseData[$field]);
                        } catch (\Exception $e) {
                            $responseData[$field] = '[Encrypted]';
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Medical history saved successfully.',
                    'data' => $responseData,
                ]);

            } catch (\Exception $e) {
                \DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error saving medical history', [
                'user_id' => $user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving medical history'
            ], 500);
        }
    }

    /**
     * Store method for alternative route without user_id in URL
     */
    public function store(Request $request)
    {
        $user_id = $request->input('user_id');
        if (!$user_id) {
            return response()->json([
                'success' => false,
                'message' => 'User ID is required'
            ], 400);
        }

        return $this->storeOrUpdate($request, $user_id);
    }

    /**
     * Delete medical history for a user.
     */
    public function destroy($user_id)
    {
        try {
            $user = Auth::user();
            
            // Only SuperAdmin can delete medical history
            if ($user->account_type !== 'SuperAdmin') {
                Log::warning('Unauthorized attempt to delete medical history', [
                    'user_id' => $user->id,
                    'account_type' => $user->account_type,
                    'target_user_id' => $user_id
                ]);
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            // Validate user_id parameter
            if (!is_numeric($user_id) || $user_id <= 0) {
                return response()->json(['message' => 'Invalid user ID'], 400);
            }

            $history = MedicalHistory::where('user_id', $user_id)->first();
            
            if (!$history) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medical history not found'
                ], 404);
            }

            $history->delete();

            // Log deletion
            Log::warning('Medical history deleted', [
                'deleted_by' => $user->id,
                'patient_id' => $user_id,
                'timestamp' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Medical history deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting medical history', [
                'user_id' => $user_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting medical history'
            ], 500);
        }
    }

    /**
     * Check if user is authorized to access medical history.
     */
    private function isAuthorizedUser($user)
    {
        $authorizedRoles = ['SuperAdmin', 'Doctor', 'Nurse', 'Dentist'];
        return in_array($user->account_type, $authorizedRoles);
    }

    /**
     * Get empty medical history structure
     */
    private function getEmptyMedicalHistory()
    {
        return [
            'is_pwd' => false,
            'pwd_disability' => '',
            'anemia' => false,
            'bleeding_disorders' => false,
            'vertigo_dizziness' => false,
            'migraine' => false,
            'epilepsy' => false,
            'panic_anxiety' => false,
            'hyperacidity_gerd' => false,
            'heart_disease' => false,
            'kidney_disease' => false,
            'asthma' => false,
            'sexually_transmitted_illness' => false,
            'congenital_heart_disease' => false,
            'immunocompromised' => false,
            'immunocompromised_specify' => '',
            'musculoskeletal_injury' => false,
            'musculoskeletal_injury_specify' => '',
            'mumps' => false,
            'chickenpox' => false,
            'hepatitis' => false,
            'scoliosis' => false,
            'diabetes_mellitus' => false,
            'head_injury' => false,
            'visual_defect' => false,
            'visual_defect_specify' => '',
            'hearing_defect' => false,
            'hearing_defect_specify' => '',
            'tuberculosis' => false,
            'hypertension' => false,
            'g6pd' => false,
            'rheumatic_heart_disease' => false,
            'allergies_specify' => '',
        ];
    }

    /**
     * Get medical history statistics (for authorized users only).
     */
    public function getStatistics()
    {
        try {
            $user = Auth::user();
            
            if (!$this->isAuthorizedUser($user)) {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $stats = [
                'total_records' => MedicalHistory::count(),
                'pwd_count' => MedicalHistory::where('is_pwd', true)->count(),
                'common_conditions' => [
                    'hypertension' => MedicalHistory::where('hypertension', true)->count(),
                    'diabetes' => MedicalHistory::where('diabetes_mellitus', true)->count(),
                    'asthma' => MedicalHistory::where('asthma', true)->count(),
                    'heart_disease' => MedicalHistory::where('heart_disease', true)->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving medical history statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while retrieving statistics'
            ], 500);
        }
    }
}
