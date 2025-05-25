<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        // Wrap in 'data' so frontend can safely use res.data.data
        return response()->json(['data' => Inventory::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'quantity' => 'required|integer',
            'generic' => 'nullable|string',
            'brand_name' => 'nullable|string',
            'dosage' => 'nullable|string',
            'name' => 'nullable|string',
        ]);

        Inventory::create($validated);
        return response()->json(['message' => 'Created'], 201);
    }

    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'generic' => 'nullable|string',
            'brand_name' => 'nullable|string',
            'dosage' => 'nullable|string',
            'name' => 'nullable|string',
        ]);

        $inventory->update($validated);
        return response()->json(['message' => 'Updated'], 200);
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
