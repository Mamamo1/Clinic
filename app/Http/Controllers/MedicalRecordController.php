<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MedicalRecordController extends Controller
{
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'user_id' => 'required|exists:users,id',
                'physician_nurse' => 'required|exists:users,id',
                'date' => 'required|date',
                'reason' => 'required|string',
                'temperature' => 'nullable|string',
                'bloodPressure' => 'nullable|string',
                'allergies' => 'nullable|string',
                'medicines' => 'nullable|array',
                'medicines.*.id' => 'required|exists:inventory,id',
                'medicines.*.quantity' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            $record = MedicalRecord::create([
                'user_id' => $data['user_id'],
                'physician_nurse_id' => $data['physician_nurse'],
                'visit_date' => $data['date'],              // Map to correct column
                'reason_for_visit' => $data['reason'],      // Map to correct column
                'temperature' => $data['temperature'] ?? null,
                'blood_pressure' => $data['bloodPressure'] ?? null,
                'allergies' => $data['allergies'] ?? null,
            ]);

            if (!empty($data['medicines'])) {
                foreach ($data['medicines'] as $med) {
                    // Use the correct pivot column name
                    $record->medicines()->attach($med['id'], ['quantity_issued' => $med['quantity']]);

                    // Deduct from inventory
                    $inventory = Inventory::find($med['id']);
                    if ($inventory) {
                        $inventory->quantity -= $med['quantity'];
                        $inventory->save();
                    }
                }
            }

            DB::commit();

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
            Log::error('Medical record creation failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'error' => 'Something went wrong: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Custom method to get medical records by user ID
    public function getByUserId($user_id)
    {
        try {
            Log::info("Fetching medical records for user ID: {$user_id}");
            
            // Get all medical records for a specific user
            $records = MedicalRecord::where('user_id', $user_id)
                ->with(['physician', 'medicines']) // Load both physician and medicines relationships
                ->orderBy('visit_date', 'desc')    // Use correct column name
                ->get();
            
            Log::info("Found " . $records->count() . " medical records");
            
            return response()->json([
                'success' => true,
                'records' => $records
            ]);
        } catch (\Exception $e) {
            Log::error('Medical records fetch failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
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
            Log::info("Fetching single medical record ID: {$id}");
            
            // Get a single medical record by its ID
            $record = MedicalRecord::with(['physician', 'medicines'])
                ->findOrFail($id);
            
            Log::info("Found medical record: {$record->id}");
            
            return response()->json([
                'success' => true,
                'record' => $record
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Medical record not found: {$id}");
            return response()->json([
                'success' => false,
                'error' => 'Medical record not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Medical record fetch failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch medical record: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Log::info("Attempting to delete medical record ID: {$id}");
            
            // Find the medical record
            $record = MedicalRecord::findOrFail($id);
            
            DB::beginTransaction();
            
            // Optional: Return medicines to inventory before deleting the record
            if ($record->medicines && $record->medicines->count() > 0) {
                foreach ($record->medicines as $medicine) {
                    $inventory = Inventory::find($medicine->id);
                    if ($inventory) {
                        // Add back the quantity that was issued
                        $quantityIssued = $medicine->pivot->quantity_issued ?? 0;
                        $inventory->quantity += $quantityIssued;
                        $inventory->save();
                        Log::info("Returned {$quantityIssued} units of {$medicine->name} to inventory");
                    }
                }
                
                // Detach medicines from the record
                $record->medicines()->detach();
            }
            
            // Delete the medical record
            $record->delete();
            
            DB::commit();
            
            Log::info("Medical record ID {$id} deleted successfully");
            
            return response()->json([
                'success' => true,
                'message' => 'Medical record deleted successfully'
            ], 200);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Medical record not found: {$id}");
            return response()->json([
                'success' => false,
                'error' => 'Medical record not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Medical record deletion failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete medical record: ' . $e->getMessage()
            ], 500);
        }
    }
}