<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Inventory::query();
            
            // Filter by category if specified
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            
            return response()->json([
                'success' => true,
                'data' => $query->get()
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory index failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Log the request for debugging
            Log::info('Inventory store request:', $request->all());

            // Basic validation
            $validated = $request->validate([
                'category' => 'required|string|in:Medicine,Supplies',
                'quantity' => 'required|integer|min:0',
                'threshold' => 'required|integer|min:0',
                'generic' => 'nullable|string',
                'brand_name' => 'nullable|string',
                'dosage' => 'nullable|string',
                'name' => 'nullable|string',
            ]);

            // Category-specific validation
            if ($validated['category'] === 'Medicine') {
                $request->validate([
                    'generic' => 'required|string',
                    'brand_name' => 'required|string',
                    'dosage' => 'required|string',
                ]);
            } else {
                $request->validate([
                    'name' => 'required|string',
                ]);
            }

            $item = Inventory::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Inventory item created successfully',
                'data' => $item
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Inventory store failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory item',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $inventory = Inventory::findOrFail($id);
            
            $validated = $request->validate([
                'quantity' => 'required|integer|min:0',
                'threshold' => 'required|integer|min:0',
                'generic' => 'nullable|string',
                'brand_name' => 'nullable|string',
                'dosage' => 'nullable|string',
                'name' => 'nullable|string',
            ]);

            $inventory->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Updated successfully',
                'data' => $inventory
            ], 200);

        } catch (\Exception $e) {
            Log::error('Inventory update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inventory item'
            ], 500);
        }
    }

    public function deduct(Request $request)
    {
        try {
            $request->validate([
                'medicine' => 'required|string',
                'quantity' => 'required|integer|min:1',
            ]);

            $item = Inventory::where('name', $request->medicine)->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine not found'
                ], 404);
            }

            if ($item->quantity < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock'
                ], 400);
            }

            $item->quantity -= $request->quantity;
            $item->save();

            return response()->json([
                'success' => true,
                'message' => 'Stock deducted successfully',
                'data' => $item
            ], 200);

        } catch (\Exception $e) {
            Log::error('Inventory deduct failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to deduct stock'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $item = Inventory::findOrFail($id);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Inventory delete failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete inventory item'
            ], 500);
        }
    }
}