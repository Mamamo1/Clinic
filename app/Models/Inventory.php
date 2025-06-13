<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory'; // Make sure this matches your table name
    
    protected $fillable = [
        'category',
        'quantity',
        'threshold',
        'generic',
        'brand_name',
        'dosage',
        'name',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'threshold' => 'integer',
    ];
}