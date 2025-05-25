<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'category',
        'quantity',
        'generic',
        'brand_name',
        'dosage',
        'name',
    ];
}
