<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'user_id',
        'physician_nurse_id',
        'visit_date',           // Changed from 'date'
        'reason_for_visit',     // Changed from 'reason'
        'temperature',
        'blood_pressure',
        'allergies',
        // Removed fields that don't exist in your table:
        // 'pulse_rate', 'respiratory_rate', 'allergy_note'
    ];
    
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function physician() {
        return $this->belongsTo(User::class, 'physician_nurse_id');
    }

    public function medicines() {
        return $this->belongsToMany(Inventory::class, 'medical_record_medicine', 'medical_record_id', 'inventory_id')
                    ->withPivot('quantity_issued')  // Changed from 'quantity'
                    ->withTimestamps();
    }
}