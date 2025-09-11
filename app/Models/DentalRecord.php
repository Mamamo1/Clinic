<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DentalRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'examination_date',
        'purpose',
        'oral_hygiene',
        'decayed_teeth_count',
        'extraction_teeth_count',
        'teeth_conditions',
        'oral_prophylaxis_notes',
        'other_notes',
        'tooth_extraction_numbers',
        'tooth_filling_numbers',
        'school_dentist',
    ];

    protected $casts = [
        'examination_date' => 'date',
        'purpose' => 'array',
        'teeth_conditions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationship with User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for formatted examination date
    public function getFormattedExaminationDateAttribute()
    {
        return $this->examination_date ? $this->examination_date->format('M d, Y') : null;
    }

    // Accessor for formatted next appointment
    public function getFormattedNextAppointmentAttribute()
    {
        return $this->next_appointment ? $this->next_appointment->format('M d, Y') : null;
    }

    // Scope for recent records
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('examination_date', '>=', now()->subDays($days));
    }

    // Scope for specific user
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
