<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
{
    $query = Inventory::query();
    
    // Filter by category if specified
    if ($request->has('category')) {
        $query->where('category', $request->category);
    }
    
    // Return filtered inventory items
    return response()->json(['data' => $query->get()]);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'quantity' => 'required|integer',
            'threshold' => 'required|integer',
            'generic' => 'nullable|string',
            'brand_name' => 'nullable|string',
            'dosage' => 'nullable|string',
            'name' => 'nullable|string',
        ]);

        $item = Inventory::create($validated);

        return response()->json(['message' => 'Created', 'data' => $item], 201);
    }

    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'threshold' => 'required|integer',
            'generic' => 'nullable|string',
            'brand_name' => 'nullable|string',
            'dosage' => 'nullable|string',
            'name' => 'nullable|string',
        ]);

        $inventory->update($validated);

        return response()->json(['message' => 'Updated', 'data' => $inventory], 200);
    }


    public function deduct(Request $request)
{
    $request->validate([
        'medicine' => 'required|string',
        'quantity' => 'required|integer|min:1',
    ]);

    $item = Inventory::where('name', $request->medicine)->first();

    if (!$item) {
        return response()->json(['error' => 'Medicine not found'], 404);
    }

    if ($item->quantity < $request->quantity) {
        return response()->json(['error' => 'Insufficient stock'], 400);
    }

    $item->quantity -= $request->quantity;
    $item->save();

    return response()->json(['message' => 'Stock deducted', 'data' => $item], 200);
}


    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
