<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MedicalRecordController extends Controller
{
    public function index(Request $request)
    {
        try {
            
            $query = MedicalRecord::with(['user', 'physician', 'medicines']);
            
            // Apply search filter if provided
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('reason_for_visit', 'like', "%{$searchTerm}%")
                      ->orWhere('illness_name', 'like', "%{$searchTerm}%")
                      ->orWhere('diagnosis', 'like', "%{$searchTerm}%")
                      ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                          $userQuery->where('first_name', 'like', "%{$searchTerm}%")
                                   ->orWhere('last_name', 'like', "%{$searchTerm}%");
                      });
                });
            }
            
            // Apply date range filter if provided
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('visit_date', '>=', $request->start_date);
            }
            
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('visit_date', '<=', $request->end_date);
            }
            
            // Apply user filter if provided (for specific user's records)
            if ($request->has('user_id') && !empty($request->user_id)) {
                $query->where('user_id', $request->user_id);
            }
            
            // Order by most recent first
            $query->orderBy('visit_date', 'desc')->orderBy('visit_time', 'desc');
            
            // Get paginated results
            $perPage = $request->get('per_page', 10);
            $records = $query->paginate($perPage);
                      
            return response()->json([
                'success' => true,
                'data' => $records->getCollection()->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'patient_name' => $record->user ? $record->user->first_name . ' ' . $record->user->last_name : 'Unknown',
                        'physician_name' => $record->physician ? $record->physician->first_name . ' ' . $record->physician->last_name : 'Unknown',
                        'physician' => $record->physician, // Include full physician object
                        'reason_for_visit' => $record->reason_for_visit,
                        'illness_name' => $record->illness_name,
                        'visit_date' => $record->visit_date,
                        'visit_time' => $record->visit_time,
                        'diagnosis' => $record->diagnosis,
                        'temperature' => $record->temperature,
                        'blood_pressure' => $record->blood_pressure,
                        'allergies' => $record->allergies,
                        'medicines' => $record->medicines,
                    ];
                }),
                'pagination' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch medical records: ' . $e->getMessage()
            ], 500);
        }
    }

    // Add a new method specifically for getting current user's records
    public function getUserRecords(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'User not authenticated'
                ], 401);
            }

            $query = MedicalRecord::with(['user', 'physician', 'medicines'])
                ->where('user_id', $user->id);
            
            // Apply search filter if provided
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('reason_for_visit', 'like', "%{$searchTerm}%")
                      ->orWhere('illness_name', 'like', "%{$searchTerm}%")
                      ->orWhere('diagnosis', 'like', "%{$searchTerm}%")
                      ->orWhereHas('physician', function($physicianQuery) use ($searchTerm) {
                          $physicianQuery->where('first_name', 'like', "%{$searchTerm}%")
                                        ->orWhere('last_name', 'like', "%{$searchTerm}%");
                      });
                });
            }
            
            // Apply date range filter if provided
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('visit_date', '>=', $request->start_date);
            }
            
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('visit_date', '<=', $request->end_date);
            }
            
            // Order by most recent first
            $query->orderBy('visit_date', 'desc')->orderBy('visit_time', 'desc');
            
            // Get paginated results
            $perPage = $request->get('per_page', 10);
            $records = $query->paginate($perPage);
                      
            return response()->json([
                'success' => true,
                'data' => $records->getCollection()->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'patient_name' => $record->user ? $record->user->first_name . ' ' . $record->user->last_name : 'Unknown',
                        'physician_name' => $record->physician ? $record->physician->first_name . ' ' . $record->physician->last_name : 'Unknown',
                        'physician' => $record->physician, // Include full physician object
                        'reason_for_visit' => $record->reason_for_visit,
                        'illness_name' => $record->illness_name,
                        'visit_date' => $record->visit_date,
                        'visit_time' => $record->visit_time,
                        'diagnosis' => $record->diagnosis,
                        'temperature' => $record->temperature,
                        'blood_pressure' => $record->blood_pressure,
                        'allergies' => $record->allergies,
                        'medicines' => $record->medicines,
                    ];
                }),
                'pagination' => [
                    'current_page' => $records->currentPage(),
                    'last_page' => $records->lastPage(),
                    'per_page' => $records->perPage(),
                    'total' => $records->total(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch medical records: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
{
    try {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'physician_nurse' => 'required|exists:users,id',
            'date' => 'required|date',
            'visit_time' => 'nullable|date_format:H:i',
            'reason' => 'required|string',
            'illness_name' => 'nullable|string|max:255',
            'temperature' => 'nullable|string',
            'blood_pressure' => 'nullable|string', // Fixed field name
            'allergies' => 'nullable|string',
            'medicines' => 'nullable|array',
            'medicines.*.id' => 'required|exists:inventory,id',
            'medicines.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        // Debug logging
        Log::info('Creating medical record with data:', [
            'user_id' => $data['user_id'],
            'physician_nurse_id' => $data['physician_nurse'],
            'visit_date' => $data['date'],
            'visit_time' => $data['visit_time'] ?? null,
            'reason_for_visit' => $data['reason'],
            'illness_name' => $data['illness_name'] ?? null,
            'temperature' => $data['temperature'] ?? null,
            'blood_pressure' => $data['blood_pressure'] ?? null,
            'allergies' => $data['allergies'] ?? null,
        ]);

        $record = MedicalRecord::create([
            'user_id' => $data['user_id'],
            'physician_nurse_id' => $data['physician_nurse'], // Make sure this column exists
            'visit_date' => $data['date'],
            'visit_time' => $data['visit_time'] ?? null,
            'reason_for_visit' => $data['reason'],
            'illness_name' => $data['illness_name'] ?? null,
            'temperature' => $data['temperature'] ?? null,
            'blood_pressure' => $data['blood_pressure'] ?? null,
            'allergies' => $data['allergies'] ?? null,
        ]);

        if (!empty($data['medicines'])) {
            foreach ($data['medicines'] as $med) {
                // Check if inventory item exists and has enough quantity
                $inventory = Inventory::find($med['id']);
                if (!$inventory) {
                    throw new \Exception("Medicine with ID {$med['id']} not found");
                }
                
                if ($inventory->quantity < $med['quantity']) {
                    throw new \Exception("Insufficient quantity for {$inventory->generic}. Available: {$inventory->quantity}, Requested: {$med['quantity']}");
                }
                
                // Attach medicine to record
                $record->medicines()->attach($med['id'], ['quantity_issued' => $med['quantity']]);

                // Deduct from inventory
                $inventory->quantity -= $med['quantity'];
                $inventory->save();
            }
        }

        DB::commit();

        // Load relationships for response
        $record->load(['user', 'physician', 'medicines']);

        return response()->json([
            'success' => true,
            'message' => 'Medical record saved successfully',
            'record' => $record,
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Medical record creation failed: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => 'Something went wrong: ' . $e->getMessage(),
        ], 500);
    }
}

    public function getIllnessData(Request $request) 
    {
        try {
            $month = $request->query('month', 'September'); // Default fallback
            
            
            $monthNames = [
                'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
                'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
                'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
            ];
            
            // Ensure monthNumber is always defined
            if (isset($monthNames[$month])) {
                $monthNumber = $monthNames[$month];
            } else {
                $monthNumber = (int) date('n'); // Current month as integer
            }
            
            $currentYear = (int) date('Y');
            
            $illnessData = MedicalRecord::whereMonth('visit_date', $monthNumber)
                ->whereYear('visit_date', $currentYear)
                ->whereNotNull('illness_name')
                ->where('illness_name', '!=', '')
                ->with('user') // Load user relationship
                ->get()
                ->groupBy('illness_name')
                ->map(function($records, $illnessName) use ($monthNumber, $currentYear) {
                    $shsCount = 0;
                    $collegeCount = 0;
                    $employeeCount = 0;
                    
                    // Count records by actual user type
                    foreach ($records as $record) {
                        if ($record->user) {
                            // Determine user category based on account_type or ID fields
                            if ($record->user->account_type === 'SHS' || 
                                (isset($record->user->student_number) && strpos($record->user->student_number, 'SHS') !== false)) {
                                $shsCount++;
                            } elseif ($record->user->account_type === 'College' || 
                                     (isset($record->user->student_number) && !empty($record->user->student_number) && 
                                      strpos($record->user->student_number, 'College') === false)) {
                                $collegeCount++;
                            } elseif ($record->user->account_type === 'Employee' || 
                                     isset($record->user->employee_id) && !empty($record->user->employee_id)) {
                                $employeeCount++;
                            } else {
                                // Default categorization if account_type is not clear
                                if (!empty($record->user->student_number)) {
                                    $collegeCount++; // Default students to College
                                } elseif (!empty($record->user->employee_id)) {
                                    $employeeCount++;
                                } else {
                                    $collegeCount++; // Default fallback to College
                                }
                            }
                        }
                    }
                    
                    $totalCount = $records->count();
                    return [
                        'name' => $illnessName,
                        'SHS' => $shsCount,
                        'College' => $collegeCount,
                        'Employee' => $employeeCount,
                        'severity' => $this->calculateSeverity($totalCount),
                        'trend' => $this->calculateTrend($illnessName, $monthNumber, $currentYear)
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $illnessData->values(), // Reset array keys
                'month' => $month,
                'monthNumber' => $monthNumber
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch illness data: ' . $e->getMessage(),
                'details' => [
                    'month' => $month ?? 'undefined',
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile())
                ]
            ], 500);
        }
    }
    
    private function calculateSeverity($totalCount) 
    {
        if ($totalCount >= 20) {
            return 'high';
        } elseif ($totalCount >= 10) {
            return 'moderate';
        } else {
            return 'low';
        }
    }
    
    private function calculateTrend($illnessName, $currentMonth, $currentYear) 
    {
        try {
            // Get previous month data
            $previousMonth = $currentMonth - 1;
            $previousYear = $currentYear;
            
            if ($previousMonth < 1) {
                $previousMonth = 12;
                $previousYear = $currentYear - 1;
            }
            
            $previousCount = MedicalRecord::whereMonth('visit_date', $previousMonth)
                ->whereYear('visit_date', $previousYear)
                ->where('illness_name', $illnessName)
                ->count();
                
            $currentCount = MedicalRecord::whereMonth('visit_date', $currentMonth)
                ->whereYear('visit_date', $currentYear)
                ->where('illness_name', $illnessName)
                ->count();
            
            if ($currentCount > $previousCount) {
                return 'increasing';
            } elseif ($currentCount < $previousCount) {
                return 'decreasing';
            } else {
                return 'stable';
            }
        } catch (\Exception $e) {
            return 'stable'; // Default to stable if calculation fails
        }
    }

    // Custom method to get medical records by user ID
    public function getByUserId($user_id)
    {
        try {
            
            // Get all medical records for a specific user
            $records = MedicalRecord::where('user_id', $user_id)
                ->with(['physician', 'medicines']) // Load both physician and medicines relationships
                ->orderBy('visit_date', 'desc')    // Use correct column name
                ->get();

                 $lastVisit = $records->first()?->visit_date;
            
            
            return response()->json([
                'success' => true,
                'last_visit' => $lastVisit,
                'records' => $records
            ]);
        } catch (\Exception $e) {
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch medical records: ' . $e->getMessage()
            ], 500);
        }
    }

    // This show method is for the resource route - shows a single medical record
    public function show($id)
    {
        try {
            
            // Get a single medical record by its ID
            $record = MedicalRecord::with(['physician', 'medicines'])
                ->findOrFail($id);
            return response()->json([
                'success' => true,
                'record' => $record
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Medical record not found'
            ], 404);
        } catch (\Exception $e) {            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch medical record: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            
            $record = MedicalRecord::findOrFail($id);
            
            DB::beginTransaction();
            
            if ($record->medicines && $record->medicines->count() > 0) {
                foreach ($record->medicines as $medicine) {
                    $inventory = Inventory::find($medicine->id);
                    if ($inventory) {
                        $quantityIssued = $medicine->pivot->quantity_issued ?? 0;
                        $inventory->quantity += $quantityIssued;
                        $inventory->save();
                    }
                }
                
                // Detach medicines from the record
                $record->medicines()->detach();
            }
            
            // Delete the medical record
            $record->delete();
            
            DB::commit();
            
            
            return response()->json([
                'success' => true,
                'message' => 'Medical record deleted successfully'
            ], 200);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Medical record not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete medical record: ' . $e->getMessage()
            ], 500);
        }
    }
}