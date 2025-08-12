<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'full_name',
        'service_type',
        'appointment_date',
        'appointment_time',
        'reason',
        'status',
        'doctor_name',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
    ];

    // Relationship with User model
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
