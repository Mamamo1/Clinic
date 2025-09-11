<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
    'user_id',
    'physician_nurse_id',
    'visit_date',
    'visit_time',
    'reason_for_visit',
    'illness_name',
    'temperature',
    'blood_pressure',
    'allergies'
];
    
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function physician() {
        return $this->belongsTo(User::class, 'physician_nurse_id');
    }

    public function medicines() {
        return $this->belongsToMany(Inventory::class, 'medical_record_medicine', 'medical_record_id', 'inventory_id')
                    ->withPivot('quantity_issued')  
                    ->withTimestamps();
    }
}